# Supabase OAuth Authentication Setup Guide

This guide will help you set up Supabase OAuth authentication for the PacMac Mobile application.

## 🚀 Quick Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `pacmacmobile` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NextAuth Configuration (optional)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
```

### 4. Enable OAuth Providers

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure OAuth consent screen:
   - **Application name**: PacMac Mobile
   - **Authorized domains**: Add your domain
6. Create OAuth client:
   - **Application type**: Web application
   - **Authorized redirect URIs**: 
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
7. Copy the **Client ID** and **Client Secret**

#### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: PacMac Mobile
   - **Homepage URL**: `https://your-domain.com`
   - **Authorization callback URL**: `https://your-project-id.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**

#### Apple OAuth Setup

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Create a new App ID
3. Enable "Sign In with Apple"
4. Create a Service ID
5. Configure the Service ID with your domain
6. Copy the **Client ID** and **Client Secret**

### 5. Configure Supabase Auth

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Enable and configure each provider:

#### Google
- **Enable**: ✅
- **Client ID**: Your Google Client ID
- **Client Secret**: Your Google Client Secret

#### GitHub
- **Enable**: ✅
- **Client ID**: Your GitHub Client ID
- **Client Secret**: Your GitHub Client Secret

#### Apple
- **Enable**: ✅
- **Client ID**: Your Apple Service ID
- **Client Secret**: Your Apple Client Secret

### 6. Configure Redirect URLs

In **Authentication** → **URL Configuration**:

- **Site URL**: `https://your-domain.com`
- **Redirect URLs**: 
  - `https://your-domain.com/auth/callback`
  - `http://localhost:3000/auth/callback` (for development)

### 7. Test the Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Click "Sign In" or "Create Account"
4. Test both email/password and OAuth flows

## 🔧 Features Implemented

### Authentication Methods
- ✅ **Email/Password**: Traditional login with Supabase Auth
- ✅ **Google OAuth**: One-click Google sign-in
- ✅ **GitHub OAuth**: One-click GitHub sign-in
- ✅ **Apple OAuth**: One-click Apple sign-in (iOS/macOS)

### User Management
- ✅ **User Registration**: Multi-step registration with location
- ✅ **User Profiles**: Store user metadata (name, location, business info)
- ✅ **Session Management**: Automatic session persistence
- ✅ **Logout**: Secure session termination

### UI Integration
- ✅ **Splash Screen**: Shows until user is authenticated
- ✅ **Login Modal**: Beautiful OAuth and email/password forms
- ✅ **Registration Modal**: Multi-step registration process
- ✅ **User Menu**: Display user info and logout option

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
Make sure to set all required environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

### Update Supabase URLs
After deployment, update your Supabase project:
1. Go to **Authentication** → **URL Configuration**
2. Update **Site URL** to your production domain
3. Add production **Redirect URLs**

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use strong, unique passwords for Supabase
- Regularly rotate your service role key
- Enable Row Level Security (RLS) in Supabase
- Configure proper CORS settings

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [OAuth Provider Setup](https://supabase.com/docs/guides/auth/social-login)

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid redirect URL"**
   - Check that your redirect URLs match exactly in Supabase
   - Ensure HTTPS is used in production

2. **"OAuth provider not configured"**
   - Verify Client ID and Secret are correct
   - Check that the provider is enabled in Supabase

3. **"Environment variables not found"**
   - Ensure `.env.local` exists and has correct values
   - Restart your development server after adding variables

4. **Build errors**
   - Check that all environment variables are set
   - Verify Supabase project is active and accessible

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Join the [Supabase Discord](https://discord.supabase.com/)
- Review the [Next.js Documentation](https://nextjs.org/docs)