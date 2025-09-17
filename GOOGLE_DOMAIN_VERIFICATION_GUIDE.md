# Google OAuth 2.0 Domain Verification Guide

## Overview
This guide walks you through completing Google domain verification for OAuth 2.0 authentication on your PacMac Marketplace application.

## Current Configuration
- **Production Domain**: `new-pacmac.onrender.com`
- **OAuth Client ID**: `1053950032683-igseosamup9cej3bn1o8lj5kqdok1t1b.apps.googleusercontent.com`
- **Callback URL**: `https://new-pacmac.onrender.com/auth/google/callback`

## Step-by-Step Verification Process

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**

### Step 2: Configure OAuth 2.0 Client
1. Find your OAuth 2.0 client ID
2. Click **Edit**
3. Add these **Authorized redirect URIs**:
   - `https://new-pacmac.onrender.com/auth/google/callback`
   - `http://localhost:3000/auth/google/callback` (for development)

### Step 3: Domain Verification

#### Option A: HTML File Upload (Recommended)
1. In Google Cloud Console, go to **APIs & Services** → **Domain verification**
2. Click **Add domain**
3. Enter: `new-pacmac.onrender.com`
4. Choose **HTML file** verification method
5. Download the verification file (e.g., `google1234567890abcdef.html`)
6. Rename it to `google-verification-file.html`
7. Upload to your server root directory
8. Test at: `https://new-pacmac.onrender.com/google-verification-file.html`

#### Option B: DNS TXT Record
1. Choose **DNS TXT record** method
2. Add TXT record to your domain's DNS:
   - **Name**: `@`
   - **Value**: [Verification code from Google]
   - **TTL**: 3600

### Step 4: Verification Testing
1. Test the verification file is accessible:
   ```bash
   curl https://new-pacmac.onrender.com/google-verification-file.html
   ```
2. Return to Google Cloud Console and click **Verify**
3. Wait for verification to complete (can take up to 24 hours)

### Step 5: Update Environment Variables
After verification, update your production environment variables:
```bash
GOOGLE_CLIENT_ID=your_verified_client_id
GOOGLE_CLIENT_SECRET=your_verified_client_secret
NODE_ENV=production
```

## Troubleshooting

### Common Issues
1. **Verification file not accessible**: Ensure the file is in the root directory
2. **DNS propagation delay**: Wait up to 24 hours for DNS changes
3. **HTTPS required**: Ensure your domain uses HTTPS
4. **CORS issues**: Verify CORS configuration in server.js

### Testing Commands
```bash
# Test verification file
curl -I https://new-pacmac.onrender.com/google-verification-file.html

# Test OAuth callback
curl -I https://new-pacmac.onrender.com/auth/google/callback

# Test health endpoint
curl https://new-pacmac.onrender.com/health
```

## Security Considerations
- Keep client secrets secure
- Use HTTPS in production
- Regularly rotate credentials
- Monitor OAuth usage in Google Cloud Console

## Next Steps After Verification
1. Test OAuth flow in production
2. Monitor authentication logs
3. Set up OAuth consent screen
4. Configure app verification if needed

## Support Resources
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
