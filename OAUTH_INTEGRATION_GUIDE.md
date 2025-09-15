# OAuth Integration Guide for New-PacMac

## Overview

This guide explains how to set up OAuth authentication for the main PacMac Mobile website (New-PacMac repository). The OAuth splash screen has been integrated as the default landing page.

## What's Been Added

### New Files
- `src/components/OAuthSplashScreen.tsx` - OAuth splash screen component
- `src/app/auth/callback/page.tsx` - OAuth callback handler
- `src/app/api/auth/github/route.ts` - GitHub OAuth API endpoint
- `OAUTH_SETUP_GUIDE.md` - Detailed setup instructions
- `oauth-demo.html` - Interactive demo
- `test-oauth-setup.js` - Setup validation script

### Modified Files
- `src/app/page.tsx` - Updated to use OAuth splash screen as default

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

# Existing Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. Test the Setup

```bash
# Test OAuth configuration
node test-oauth-setup.js

# Start the development server
npm run dev
```

## How It Works

### Authentication Flow

1. **User visits the site** → OAuth splash screen is displayed by default
2. **User clicks "Continue with GitHub"** → GitHub OAuth popup opens
3. **User authorizes the app** → GitHub redirects to callback page
4. **Callback page exchanges code for token** → User data is fetched
5. **Success message sent to parent** → User is authenticated
6. **Main marketplace is displayed** → User can browse and shop

### Integration with Existing Auth

The OAuth system works alongside your existing Supabase authentication:

- **OAuth Users**: Authenticated via GitHub, stored in localStorage
- **Supabase Users**: Existing authentication system remains unchanged
- **Dual Display**: Both user types can be displayed in the header
- **Seamless Experience**: Users can choose their preferred authentication method

## User Experience

### Default Landing Page
- Beautiful OAuth splash screen with PacMac branding
- Feature highlights and benefits
- GitHub authentication button
- Demo mode option
- Professional, modern design

### After Authentication
- User profile display in header
- GitHub avatar and username
- Logout functionality
- Access to full marketplace features

### Logout Experience
- Clean logout confirmation screen
- Automatic return to splash screen
- Local storage cleanup

## Customization

### Styling
The OAuth splash screen uses Tailwind CSS and can be easily customized:

```tsx
// Change the gradient background
className="bg-gradient-to-br from-blue-50 to-purple-50"

// Modify the branding
<h1>Welcome to <span className="text-blue-600">PacMac Mobile</span></h1>
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

## Production Deployment

### Environment Variables
Set these in your production environment:

```bash
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_production_client_id
NEXT_PUBLIC_APP_URL=https://pacmacmobile.com
```

### GitHub OAuth App
Update your GitHub OAuth app with production URLs:
- Homepage URL: `https://pacmacmobile.com`
- Authorization callback URL: `https://pacmacmobile.com/auth/callback`

## Testing

### Development Testing
1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. You should see the OAuth splash screen by default
4. Click "Continue with GitHub" to test authentication
5. Test logout functionality

### Demo Mode
Use the "Try Demo Mode" button to test the app without GitHub authentication.

### Validation Script
Run the setup validation script to check your configuration:

```bash
node test-oauth-setup.js
```

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

## Integration Benefits

### For Users
- **Professional First Impression**: Beautiful landing page
- **Secure Authentication**: GitHub OAuth for trusted login
- **Quick Access**: Demo mode for immediate exploration
- **Seamless Experience**: Smooth transitions between states

### For Business
- **Increased Trust**: GitHub authentication builds credibility
- **Better Conversion**: Professional splash screen improves first impressions
- **User Engagement**: Interactive features encourage exploration
- **Brand Consistency**: Maintains PacMac Mobile branding throughout

## Next Steps

1. **Set up your GitHub OAuth app** using the instructions above
2. **Configure environment variables** in `.env.local`
3. **Test the setup** with the validation script
4. **Start your app** and verify the OAuth splash screen appears
5. **Test the authentication flow** end-to-end
6. **Deploy to production** with production OAuth app settings

The OAuth splash screen is now your default landing page, providing a professional, secure, and user-friendly authentication experience for your PacMac Mobile marketplace! 🎉
