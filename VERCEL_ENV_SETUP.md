# Vercel Environment Variables Setup

## Required Environment Variables

To fix the OAuth authentication issue, you need to set these environment variables in your Vercel dashboard:

### 1. NextAuth Configuration
```
NEXTAUTH_SECRET=PtoFtcCylllogbCNxd5ucCrgbNAN/foNZ+f7ZeTtxpg=
NEXTAUTH_URL=https://pacmacmobile-admin-git-main-matty-hagens-projects.vercel.app
```

### 2. Google OAuth App
```
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (pacmacmobile-admin)
3. Go to Settings → Environment Variables
4. Add each variable with the appropriate value

## Google OAuth App Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen if prompted
6. Create OAuth 2.0 Client ID with these settings:

**Application type:** `Web application`

**Name:** `PacMac Mobile Admin`

**Authorized JavaScript origins:**
```
https://pacmacmobile-admin-git-main-matty-hagens-projects.vercel.app
```

**Authorized redirect URIs:**
```
https://pacmacmobile-admin-git-main-matty-hagens-projects.vercel.app/api/auth/callback/google
```

7. Copy the Client ID and Client Secret to your Vercel environment variables

## Generate NEXTAUTH_SECRET

You can generate a secure secret using:
```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## After Setting Variables

1. Redeploy your app in Vercel
2. The Google OAuth should now work correctly
3. After signing in, you should be redirected back to the main dashboard

## Troubleshooting

- Make sure the redirect URI in Google OAuth app matches exactly: `https://pacmacmobile-admin-git-main-matty-hagens-projects.vercel.app/api/auth/callback/google`
- Ensure all environment variables are set in Vercel
- Check Vercel function logs for any errors
- Verify the NEXTAUTH_URL matches your deployed domain