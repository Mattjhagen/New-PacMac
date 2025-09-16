# Google OAuth Setup Guide

## Overview

This guide will help you set up Google OAuth authentication for your PacMac Mobile application. Google OAuth is more accessible to users since most people have Google accounts.

## Features

✅ **Google OAuth Integration**: Secure authentication using Google OAuth 2.0  
✅ **User Profile Display**: Shows authenticated user information  
✅ **Logout Functionality**: Clean logout with confirmation screen  
✅ **Demo Mode**: Option to try the app without authentication  
✅ **Responsive Design**: Works on all device sizes  

## Setup Instructions

### 1. Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen if prompted:
   - Choose "External" user type
   - Fill in app name: `PacMac Mobile`
   - Add your email as developer contact
   - Add authorized domains (your production domain)
6. Create OAuth 2.0 Client ID with these settings:

**Application type:** `Web application`

**Name:** `PacMac Mobile`

**Authorized JavaScript origins:**
```
http://localhost:3000
https://your-production-domain.com
```

**Authorized redirect URIs:**
```
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

7. Copy the **Client ID** and **Client Secret**

### 2. Environment Configuration

Create a `.env.local` file in your project root:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret_here

# Public Google Client ID (for frontend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Production Configuration

For production deployment, update your Google OAuth app settings:

**Authorized JavaScript origins:**
```
https://your-production-domain.com
```

**Authorized redirect URIs:**
```
https://your-production-domain.com/auth/callback
```

And update your environment variables:

```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

## How It Works

### Authentication Flow

1. **User clicks "Continue with Google"** → Opens Google OAuth popup
2. **User authorizes the app** → Google redirects to `/auth/callback` with authorization code
3. **Callback page exchanges code for token** → Calls `/api/auth/google` endpoint
4. **API endpoint gets user info** → Returns user data and access token
5. **User is authenticated** → Stored in localStorage and app state

### API Endpoints

- **`/api/auth/google`** - Exchanges authorization code for access token and user info
- **`/auth/callback`** - Handles OAuth callback and communicates with parent window

### User Data Structure

```typescript
interface User {
  id: string;           // Google user ID
  name: string;         // Full name
  email: string;        // Email address
  avatar?: string;      // Profile picture URL
  login?: string;       // Email prefix (derived from email)
}
```

## Security Features

- **Secure token exchange**: Authorization codes are exchanged server-side
- **Local storage**: User data stored client-side only
- **Popup-based auth**: Prevents page redirects
- **State parameter**: Prevents CSRF attacks
- **HTTPS required**: Production requires secure connections

## Testing

### Local Development

1. Set up your `.env.local` file with Google OAuth credentials
2. Run `npm run dev`
3. Visit `http://localhost:3000`
4. Click "Continue with Google"
5. Complete the OAuth flow

### Production Testing

1. Update Google OAuth app with production URLs
2. Set environment variables on your hosting platform
3. Deploy your application
4. Test the OAuth flow on production

## Troubleshooting

### Common Issues

**"Popup blocked"**
- Ensure popups are allowed for your domain
- Check browser popup settings

**"Invalid redirect URI"**
- Verify redirect URI in Google OAuth app matches exactly
- Check for trailing slashes or protocol mismatches

**"Client ID not found"**
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
- Check environment variable loading

**"Token exchange failed"**
- Verify `GOOGLE_CLIENT_SECRET` is set correctly
- Check that Google+ API is enabled

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify environment variables are loaded
3. Test API endpoints directly
4. Check Google Cloud Console for API quotas
5. Verify OAuth consent screen is configured

## Environment Variables Summary

### Required for Development
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Required for Production
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

## Next Steps

After setting up Google OAuth:

1. **Test the authentication flow** thoroughly
2. **Update your production environment** with the correct URLs
3. **Monitor authentication logs** for any issues
4. **Consider adding additional scopes** if needed (e.g., calendar, contacts)
5. **Implement user management** features as needed

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Google OAuth documentation
3. Check browser console for errors
4. Verify all environment variables are set correctly
5. Test with a fresh browser session

---

**Note**: This implementation uses a popup-based OAuth flow for better user experience. The authentication is handled client-side with server-side token exchange for security.