# GitHub OAuth Setup for index.html

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:

**Application name:** `PacMac Mobile Admin`

**Homepage URL:**
```
https://your-domain.com
```

**Application description:** `Admin portal for PacMac Mobile inventory management`

**Authorization callback URL:**
```
https://your-domain.com
```

## Step 2: Get Your Credentials

After creating the OAuth app, you'll get:
- **Client ID** (public)
- **Client Secret** (keep this secure!)

## Step 3: Update index.html

Replace the placeholder values in the `index.html` file:

```javascript
this.githubClientId = 'your-actual-github-client-id-here';
```

**Note:** For security, the client secret should be handled server-side in production. For this simple setup, you can temporarily include it in the code, but consider using a backend service for production use.

## Step 4: Test the Authentication

1. Open your `index.html` file in a browser
2. Click "Log in with GitHub"
3. Complete the GitHub OAuth flow
4. You should see the admin interface after successful authentication

## Features Added

- ✅ GitHub OAuth authentication
- ✅ User session persistence (stored in localStorage)
- ✅ Protected admin interface (hidden until authenticated)
- ✅ User info display (name, email, avatar)
- ✅ Logout functionality
- ✅ Automatic re-authentication on page reload

## Security Notes

- User data is stored in localStorage (client-side only)
- No server-side authentication required
- Perfect for simple admin interfaces
- GitHub OAuth tokens are handled securely

## Troubleshooting

- Make sure your domain is added to the callback URL
- Check browser console for any JavaScript errors
- Ensure your GitHub OAuth app is properly configured
- Verify your Client ID is correct
- Make sure the callback URL matches exactly
