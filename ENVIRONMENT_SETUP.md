# PacMac Mobile - Environment Setup Guide

This guide will help you set up all the necessary environment variables for your PacMac Mobile application.

## Quick Start

### Option 1: Interactive Setup (Recommended)
```bash
node setup-env.js
```

### Option 2: Manual Setup
```bash
cp env.sample .env.local
# Edit .env.local with your actual values
```

## Required Environment Variables

### 🔑 Google OAuth (Required)
```bash
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
NEXT_PUBLIC_APP_URL=https://www.pacmacmobile.com
```

**How to get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "APIs & Services" → "Credentials"
5. Create OAuth 2.0 Client ID
6. Set authorized redirect URI: `https://www.pacmacmobile.com/auth/callback`

### 💳 Stripe Payments (Optional)
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**How to get Stripe credentials:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your publishable and secret keys
3. Set up webhooks for payment processing

### 🗄️ Database (Optional)
```bash
# For local development (SQLite)
DATABASE_URL="file:./dev.db"

# For production (PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database"
```

## Environment Setup by Platform

### 🏠 Local Development

1. **Copy the sample file:**
   ```bash
   cp env.sample .env.local
   ```

2. **Edit .env.local with your values:**
   ```bash
   # Use localhost for development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   DATABASE_URL="file:./dev.db"
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### 🌐 Production (Render)

1. **Go to your Render dashboard**
2. **Select your service**
3. **Go to Environment tab**
4. **Add these variables:**

```bash
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_google_client_id
NEXT_PUBLIC_APP_URL=https://www.pacmacmobile.com
DATABASE_URL=your_production_database_url
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Testing Your Setup

### Local Testing
```bash
# Run the test script
node test-google-oauth.js

# Start development server
npm run dev

# Visit http://localhost:3000
# Click "Continue with Google"
```

### Production Testing
1. Visit `https://www.pacmacmobile.com`
2. Click "Continue with Google"
3. Complete the OAuth flow
4. Check browser console for any errors

## Troubleshooting

### Common Issues

**"Google OAuth is not configured"**
- Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- Check that the Client ID is correct (not a placeholder)

**"Invalid redirect URI"**
- Verify redirect URI in Google OAuth app matches exactly
- Check for trailing slashes or protocol mismatches

**"Client-side exception"**
- Check that all required environment variables are set
- Verify the app URL matches your deployment

**"Authentication failed"**
- Check Google OAuth app configuration
- Verify environment variables on Render
- Check browser console for detailed errors

### Debug Steps

1. **Check environment variables:**
   ```bash
   node -e "console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)"
   ```

2. **Test API endpoints:**
   ```bash
   curl https://www.pacmacmobile.com/api/auth/google
   ```

3. **Check Render logs:**
   - Go to Render dashboard → Your service → Logs
   - Look for any error messages

## Security Best Practices

### ✅ Do:
- Use environment variables for all secrets
- Never commit `.env.local` to git
- Use different credentials for development and production
- Regularly rotate your API keys

### ❌ Don't:
- Hardcode secrets in your code
- Share environment variables in chat/email
- Use production credentials for development
- Commit actual secrets to version control

## File Structure

```
├── env.sample              # Complete environment template
├── setup-env.js           # Interactive setup script
├── test-google-oauth.js   # OAuth configuration test
├── .env.local             # Your local environment (not in git)
└── ENVIRONMENT_SETUP.md   # This guide
```

## Support

If you encounter issues:

1. Check this guide first
2. Run the test script: `node test-google-oauth.js`
3. Check the troubleshooting section
4. Review Render logs for errors
5. Verify all environment variables are set correctly

## Next Steps

After setting up your environment:

1. **Test locally** with `npm run dev`
2. **Deploy to production** with proper environment variables
3. **Test the live site** at `https://www.pacmacmobile.com`
4. **Set up monitoring** to track any issues

---

**Need help?** Check the `env.sample` file for a complete list of all available environment variables with detailed comments.
