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
  StarIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  PlayIcon,
  CheckIcon,
  LocationMarkerIcon,
  GiftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  login?: string;
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
  const [authStep, setAuthStep] = useState<'welcome' | 'authenticating' | 'success' | 'logout' | 'account-creation' | 'location-setup'>('welcome');
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ address: string; coordinates: { lat: number; lng: number } } | null>(null);

  const steps = [
    {
      title: "Welcome to PacMac Mobile",
      subtitle: "Premium mobile devices at unbeatable prices",
      icon: DevicePhoneMobileIcon,
      color: "from-blue-500 to-purple-600",
      features: [
        "Latest iPhone & Android devices",
        "Certified pre-owned phones",
        "Unbeatable prices & warranties"
      ]
    },
    {
      title: "Quality Guaranteed",
      subtitle: "Every device is thoroughly tested and certified",
      icon: ShieldCheckIcon,
      color: "from-green-500 to-teal-600",
      features: [
        "30-day return policy",
        "1-year warranty included",
        "Free shipping nationwide"
      ]
    },
    {
      title: "Location-Based Deals",
      subtitle: "Find amazing deals near you",
      icon: MapPinIcon,
      color: "from-orange-500 to-red-600",
      features: [
        "Local pickup options",
        "Area-specific discounts",
        "Meet sellers in person"
      ]
    },
    {
      title: "Community Support",
      subtitle: "We're here to help you every step of the way",
      icon: ChatBubbleLeftRightIcon,
      color: "from-purple-500 to-pink-600",
      features: [
        "24/7 customer support",
        "Expert device advice",
        "Quick order processing"
      ]
    }
  ];

  // Check for existing authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('google_token');
    const user = localStorage.getItem('google_user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        onAuthSuccess(userData, token);
        setAuthStep('success');
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('google_token');
        localStorage.removeItem('google_user');
      }
    }
  }, [onAuthSuccess]);

  // Auto-advance steps
  useEffect(() => {
    if (authStep === 'welcome') {
      const timer = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentStep((prev) => (prev + 1) % steps.length);
          setIsAnimating(false);
        }, 300);
      }, 4000);

      return () => clearInterval(timer);
    }
  }, [authStep, steps.length]);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    setAuthStep('authenticating');

    try {
      // Check if Google OAuth is configured
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId || clientId === 'your_google_client_id') {
        throw new Error('Google OAuth is not configured. Please contact support.');
      }

      const redirectUri = `${window.location.origin}/auth/callback`;
      const scope = 'openid email profile';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${Date.now()}`;
      
      // Open OAuth popup
      const popup = window.open(
        authUrl,
        'google-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for popup completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsLoading(false);
          setAuthStep('welcome');
        }
      }, 1000);

      // Listen for message from popup
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          
          const { user, token } = event.data;
          
          // Store in localStorage
          localStorage.setItem('google_token', token);
          localStorage.setItem('google_user', JSON.stringify(user));
          
          onAuthSuccess(user, token);
          setAuthStep('account-creation');
          setIsLoading(false);
          
          window.removeEventListener('message', messageHandler);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          
          setError(event.data.error || 'Authentication failed');
          setIsLoading(false);
          setAuthStep('welcome');
          
          window.removeEventListener('message', messageHandler);
        }
      };

      window.addEventListener('message', messageHandler);

    } catch (error) {
      console.error('Google auth error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      setIsLoading(false);
      setAuthStep('welcome');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('google_token');
    localStorage.removeItem('google_user');
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

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
      setIsAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
      setIsAnimating(false);
    }, 300);
  };

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding would be done here in a real app
          setUserLocation({
            address: "Your Location",
            coordinates: { lat: latitude, lng: longitude }
          });
          setAuthStep('success');
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Continue without location
          setAuthStep('success');
        }
      );
    } else {
      // Geolocation not supported, continue without location
      setAuthStep('success');
    }
  };

  // Account creation step
  if (authStep === 'account-creation' && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {currentUser.name}!</h2>
              <p className="text-gray-600">Let's set up your account to get the best experience</p>
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
                  <p className="text-gray-600">{currentUser.email}</p>
                  <div className="flex items-center mt-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">Google Account Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <GiftIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Welcome Bonus</h4>
                  <p className="text-sm text-gray-600">Get $10 off your first purchase</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <LocationMarkerIcon className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Local Deals</h4>
                  <p className="text-sm text-gray-600">Find deals near you</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLocationRequest}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <LocationMarkerIcon className="h-5 w-5 mr-2" />
                Enable Location & Continue
              </button>
              <button
                onClick={() => setAuthStep('success')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Skip Location
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-gray-600">You're now authenticated and ready to explore our marketplace</p>
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
                  <p className="text-gray-600">{currentUser.email}</p>
                  {userLocation && (
                    <p className="text-sm text-gray-500">📍 {userLocation.address}</p>
                  )}
                </div>
              </div>
              
              {/* Google Account Info */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">Google</div>
                  <div className="text-sm text-gray-500">Account</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">Verified</div>
                  <div className="text-sm text-gray-500">Email</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">Secure</div>
                  <div className="text-sm text-gray-500">Login</div>
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
            Sign in with Google to access our full marketplace experience.
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
                  <p className="text-gray-600">All sellers are authenticated through Google for security and trust</p>
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

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <LocationMarkerIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Location-Based Deals</h3>
                  <p className="text-gray-600">Find amazing deals near you with local pickup options</p>
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
                  <li>• Location-based discounts</li>
                  <li>• Meet sellers in person</li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Side - Authentication */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Get Started</h2>
              <p className="text-gray-600">Sign in with Google to access the marketplace</p>
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
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full bg-white text-gray-700 px-6 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-gray-300"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
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
                    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff'
                  };
                  onAuthSuccess(demoUser, 'demo-token');
                  setAuthStep('account-creation');
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
