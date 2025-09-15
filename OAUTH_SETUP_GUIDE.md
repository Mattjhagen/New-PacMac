# OAuth Splash Screen Setup Guide

## Overview

This guide will help you set up the OAuth splash screen with GitHub authentication for your PacMac Mobile application. The splash screen serves as the default landing page with OAuth integration and logout functionality.

## Features

✅ **OAuth Splash Screen**: Beautiful landing page with GitHub authentication  
✅ **GitHub OAuth Integration**: Secure authentication using GitHub OAuth  
✅ **User Profile Display**: Shows authenticated user information  
✅ **Logout Functionality**: Clean logout with confirmation screen  
✅ **Demo Mode**: Option to try the app without authentication  
✅ **Responsive Design**: Works on all device sizes  

## Setup Instructions

### 1. Create GitHub OAuth App

1. Go to [GitHub Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:

**Application name:** `PacMac Mobile`  
**Homepage URL:** `http://localhost:3000` (for development)  
**Application description:** `PacMac Mobile - Mobile device marketplace`  
**Authorization callback URL:** `http://localhost:3000/auth/callback`  

4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

### 2. Environment Configuration

Create a `.env.local` file in your project root:

```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_oauth_client_id_here
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret_here

# Public GitHub Client ID (for frontend)
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_oauth_client_id_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Production Configuration

For production deployment, update your GitHub OAuth app settings:

**Homepage URL:** `https://your-domain.com`  
**Authorization callback URL:** `https://your-domain.com/auth/callback`  

And update your environment variables:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## How It Works

### Authentication Flow

1. **User visits the site** → OAuth splash screen is displayed
2. **User clicks "Continue with GitHub"** → GitHub OAuth popup opens
3. **User authorizes the app** → GitHub redirects to callback page
4. **Callback page exchanges code for token** → User data is fetched
5. **Success message sent to parent** → User is authenticated
6. **Main app is displayed** → User can access the marketplace

### Logout Flow

1. **User clicks logout** → Logout confirmation screen is shown
2. **Local storage is cleared** → User data is removed
3. **Splash screen is displayed** → User returns to landing page

## File Structure

```
src/
├── components/
│   └── OAuthSplashScreen.tsx     # Main splash screen component
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx          # OAuth callback handler
│   └── api/
│       └── auth/
│           └── github/
│               └── route.ts      # GitHub OAuth API endpoint
└── page.tsx                      # Updated main page with OAuth integration
```

## Component Features

### OAuthSplashScreen Component

- **Welcome Screen**: Beautiful landing page with app branding
- **Feature Highlights**: Shows key benefits of the platform
- **GitHub Authentication**: Secure OAuth integration
- **Demo Mode**: Option to try without authentication
- **User Profile**: Displays authenticated user information
- **Logout Confirmation**: Clean logout experience

### Key Props

```typescript
interface OAuthSplashScreenProps {
  onAuthSuccess: (user: User, token: string) => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  currentUser?: User;
}
```

## User Interface

### Welcome Screen
- App branding and logo
- Feature highlights with icons
- GitHub authentication button
- Demo mode option
- Terms and privacy policy links

### Success Screen
- User profile card with GitHub avatar
- GitHub statistics (repos, followers, following)
- "Enter Marketplace" button
- Logout option

### Logout Screen
- Confirmation message
- Animated progress indicator
- Automatic return to welcome screen

## Security Features

- **Secure Token Exchange**: Uses server-side code exchange
- **Local Storage**: Stores user data securely
- **Popup Authentication**: Prevents page redirects
- **Error Handling**: Comprehensive error management
- **State Validation**: Prevents CSRF attacks

## Customization

### Styling
The component uses Tailwind CSS classes and can be easily customized:

```tsx
// Change colors
className="bg-gradient-to-br from-blue-50 to-purple-50"

// Modify branding
<h1>Welcome to <span className="text-blue-600">Your App</span></h1>
```

### Features
Add or remove features in the welcome screen:

```tsx
<div className="space-y-4">
  <div className="flex items-start space-x-3">
    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
      <CheckCircleIcon className="h-5 w-5 text-green-600" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-900">Your Feature</h3>
      <p className="text-gray-600">Feature description</p>
    </div>
  </div>
</div>
```

## Testing

### Development Testing
1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Continue with GitHub"
4. Complete the OAuth flow
5. Test logout functionality

### Demo Mode
Use the "Try Demo Mode" button to test the app without GitHub authentication.

## Troubleshooting

### Common Issues

**OAuth Error: "redirect_uri_mismatch"**
- Check that your callback URL matches exactly in GitHub OAuth app settings
- Ensure the URL includes the correct protocol (http/https)

**Popup Blocked**
- Ensure popups are allowed for your domain
- The component will show an error message if popups are blocked

**Token Exchange Failed**
- Verify your GitHub Client ID and Secret are correct
- Check that the environment variables are properly set

**User Data Not Loading**
- Check browser console for API errors
- Verify GitHub API rate limits aren't exceeded

### Debug Mode
Enable debug logging by adding to your environment:

```bash
NEXT_PUBLIC_DEBUG=true
```

## Production Deployment

### Environment Variables
Set these in your production environment:

```bash
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_production_client_id
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### GitHub OAuth App
Update your GitHub OAuth app with production URLs:
- Homepage URL: `https://your-domain.com`
- Authorization callback URL: `https://your-domain.com/auth/callback`

## Integration with Existing App

The OAuth splash screen integrates seamlessly with your existing PacMac Mobile admin panel:

1. **Default Landing**: Shows by default when users visit the site
2. **Authentication State**: Manages OAuth authentication state
3. **User Display**: Shows authenticated user in the header
4. **Logout Integration**: Provides logout functionality throughout the app

## Next Steps

1. Set up your GitHub OAuth app
2. Configure environment variables
3. Test the authentication flow
4. Customize the branding and features
5. Deploy to production

The OAuth splash screen provides a professional, secure, and user-friendly authentication experience for your PacMac Mobile application!
