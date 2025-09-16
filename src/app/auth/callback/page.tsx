'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        // Handle OAuth error
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: `OAuth error: ${error}`
        }, window.location.origin);
        window.close();
        return;
      }

      if (!code) {
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: 'No authorization code received'
        }, window.location.origin);
        window.close();
        return;
      }

      try {
        // Exchange code for access token
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to authenticate');
        }

        // Send success message to parent window
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          user: data.user,
          token: data.token
        }, window.location.origin);

        window.close();
      } catch (error) {
        console.error('Auth callback error:', error);
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error instanceof Error ? error.message : 'Authentication failed'
        }, window.location.origin);
        window.close();
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Authentication...</h2>
        <p className="text-gray-600">Please wait while we finish setting up your account.</p>
      </div>
    </div>
  );
}
