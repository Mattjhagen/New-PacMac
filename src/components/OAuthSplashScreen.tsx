
'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowRightIcon,
  UserIcon,
  CogIcon,
  ShoppingBagIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  login: string;
  location?: string;
  bio?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
}

interface OAuthSplashScreenProps {
  onAuthSuccess: (user: User, token: string) => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  currentUser?: User;
}

export default function OAuthSplashScreen({ 
  onAuthSuccess, 
  onLogout, 
  isAuthenticated, 
  currentUser 
}: OAuthSplashScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);
  const [authStep, setAuthStep] = useState<'welcome' | 'authenticating' | 'success' | 'logout'>('welcome');

  // Check for existing authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    const user = localStorage.getItem('github_user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        onAuthSuccess(userData, token);
        setAuthStep('success');
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_user');
      }
    }
  }, [onAuthSuccess]);

  // Check for Supabase OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const auth = urlParams.get('auth');
    const error = urlParams.get('error');
    
    if (auth === 'success') {
      // Supabase OAuth was successful
      // Get the current user from Supabase
      supabase.auth.getUser().then(({ data: { user }, error }) => {
        if (user && !error) {
          // Format user data for compatibility
          const userData = {
            id: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
            email: user.email || '',
            login: user.user_metadata?.user_name || user.email?.split('@')[0],
            avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture
          };
          
          // Store in localStorage for compatibility
          localStorage.setItem('github_token', 'supabase_session');
          localStorage.setItem('github_user', JSON.stringify(userData));
          
          onAuthSuccess(userData, 'supabase_session');
          setAuthStep('success');
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          console.error('Error getting user from Supabase:', error);
          setError('Authentication failed. Please try again.');
        }
      });
    } else if (error) {
      setError(`Authentication failed: ${error}`);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onAuthSuccess]);

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    setError(null);
    setAuthStep('authenticating');

    try {
      // Use Supabase GitHub OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Supabase OAuth error:', error);
        setError(error.message);
        setIsLoading(false);
        setAuthStep('welcome');
      }
      // If successful, Supabase will handle the redirect

    } catch (error) {
      console.error('GitHub auth error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      setIsLoading(false);
      setAuthStep('welcome');
    }
  };

  const handleLogout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear localStorage
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
    
    onLogout();
    setAuthStep('logout');
    
    // Show logout confirmation briefly
    setTimeout(() => {
      setAuthStep('welcome');
    }, 2000);
  };

  const handleContinueToApp = () => {
    // This will be handled by the parent component
    // The splash screen will be hidden and the main app will show
  };

  // Logout confirmation screen
  if (authStep === 'logout') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Successfully Logged Out</h2>
            <p className="text-gray-600 mb-6">You have been logged out of PacMac Mobile. Thank you for using our service!</p>
            <div className="animate-pulse">
              <div className="h-2 bg-green-200 rounded-full">
                <div className="h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success screen after authentication
  if (authStep === 'success' && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to PacMac Mobile!</h2>
                <p className="text-gray-600">You&apos;re now authenticated and ready to explore our marketplace</p>
            </div>

            {/* User Profile Card */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=3b82f6&color=fff`}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{currentUser.name}</h3>
                  <p className="text-gray-600">@{currentUser.login}</p>
                  {currentUser.location && (
                    <p className="text-sm text-gray-500">📍 {currentUser.location}</p>
                  )}
                  {currentUser.bio && (
                    <p className="text-sm text-gray-600 mt-1">{currentUser.bio}</p>
                  )}
                </div>
              </div>
              
              {/* GitHub Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{currentUser.public_repos || 0}</div>
                  <div className="text-sm text-gray-500">Repositories</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{currentUser.followers || 0}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{currentUser.following || 0}</div>
                  <div className="text-sm text-gray-500">Following</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleContinueToApp}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Enter Marketplace
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main welcome screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <span className="text-3xl">📱</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PacMac Mobile</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your premier destination for buying and selling mobile devices. 
            Connect with GitHub to access our full marketplace experience.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Features */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose PacMac Mobile?</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Verified Sellers</h3>
                  <p className="text-gray-600">All sellers are authenticated through GitHub for security and trust</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <StarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quality Guaranteed</h3>
                  <p className="text-gray-600">Every device is thoroughly tested and comes with our quality promise</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HeartIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Community Driven</h3>
                  <p className="text-gray-600">Built by developers, for developers. Open source and transparent</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFeatures(!showFeatures)}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              {showFeatures ? 'Hide' : 'Show'} More Features
              <ArrowRightIcon className={`h-4 w-4 ml-1 transition-transform ${showFeatures ? 'rotate-90' : ''}`} />
            </button>

            {showFeatures && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Real-time inventory updates</li>
                  <li>• Secure payment processing</li>
                  <li>• Device condition verification</li>
                  <li>• Local pickup and shipping options</li>
                  <li>• 30-day return guarantee</li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Side - Authentication */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Get Started</h2>
              <p className="text-gray-600">Sign in with GitHub to access the marketplace</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleGitHubAuth}
              disabled={isLoading}
              className="w-full bg-gray-900 text-white px-6 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  Continue with GitHub
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                By continuing, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </p>
            </div>

            {/* Demo Mode */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center mb-3">Or try our demo mode</p>
              <button
                onClick={() => {
                  const demoUser = {
                    id: 'demo-user',
                    name: 'Demo User',
                    email: 'demo@pacmacmobile.com',
                    login: 'demo-user',
                    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff'
                  };
                  onAuthSuccess(demoUser, 'demo-token');
                  setAuthStep('success');
                }}
                className="w-full bg-blue-100 text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
              >
                Try Demo Mode
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Built with ❤️ by the PacMac Mobile team</p>
          <p className="text-sm mt-1">
            <a href="https://github.com/Mattjhagen/New-PacMac" target="_blank" rel="noopener noreferrer" className="hover:underline">
              View on GitHub
            </a>
            {' • '}
            <a href="mailto:support@pacmacmobile.com" className="hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
