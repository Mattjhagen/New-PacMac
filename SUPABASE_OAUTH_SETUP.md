# Supabase OAuth Setup Guide

## Current Issue
The OAuth flow is failing with `error=server_error&error_code=unexpected_failure` because the Supabase OAuth configuration needs to be properly set up.

## Required Supabase Configuration

### 1. Enable GitHub OAuth Provider in Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/tvikatcdfnkwvjjpaxbu
2. Navigate to **Authentication** → **Providers**
3. Find **GitHub** and click **Configure**
4. Enable GitHub provider
5. Add your GitHub OAuth App credentials:
   - **Client ID**: `Ov23liQ9MO4Icvic5D6H`
   - **Client Secret**: `7196c929f98b5f5a12b7f5209655bdf7648598b6`

### 2. Configure Redirect URLs

In the Supabase GitHub provider settings, add these redirect URLs:

**Site URL:**
```
https://new-pac-f36d74pk8-matty-hagens-projects.vercel.app
```

**Redirect URLs:**
```
https://new-pac-f36d74pk8-matty-hagens-projects.vercel.app/auth/callback
https://tvikatcdfnkwvjjpaxbu.supabase.co/auth/v1/callback
```

### 3. Update GitHub OAuth App Settings

In your GitHub OAuth App settings (https://github.com/settings/developers):

**Homepage URL:**
```
https://new-pac-f36d74pk8-matty-hagens-projects.vercel.app
```

**Authorization callback URL:**
```
https://tvikatcdfnkwvjjpaxbu.supabase.co/auth/v1/callback
```

## Why This Setup is Needed

Supabase acts as an OAuth proxy. The flow works like this:

1. User clicks "Continue with GitHub" → Supabase OAuth URL
2. User authenticates with GitHub → GitHub redirects to Supabase
3. Supabase processes the OAuth → Redirects to your app with session
4. Your app receives the session → User is authenticated

## Current Problem

The OAuth flow is failing because:
- Supabase GitHub provider might not be enabled
- Redirect URLs might not be configured correctly
- GitHub OAuth app callback URL might not match Supabase's callback

## Next Steps

1. **Configure Supabase OAuth** (most important):
   - Enable GitHub provider in Supabase dashboard
   - Add your GitHub OAuth credentials
   - Set correct redirect URLs

2. **Update GitHub OAuth App**:
   - Set callback URL to Supabase's callback
   - Ensure homepage URL matches your Vercel deployment

3. **Test the flow**:
   - Visit your Vercel deployment
   - Click "Continue with GitHub"
   - Should redirect through Supabase → GitHub → Supabase → Your app

## Alternative: Direct GitHub OAuth

If Supabase OAuth continues to have issues, we can switch back to direct GitHub OAuth, but Supabase OAuth is preferred for better session management and security.
