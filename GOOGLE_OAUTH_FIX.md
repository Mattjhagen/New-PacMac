# 🔐 Google OAuth Redirect URI Fix

## 🚨 Current Issue
**Error 400: redirect_uri_mismatch** - The redirect URI in the OAuth request doesn't match what's configured in Google API Console.

## ✅ Solution Steps

### 1. Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**

### 2. Find Your OAuth 2.0 Client
1. Look for the OAuth 2.0 Client ID: `1053950032683-igseosamup9cej3bn1o8lj5kqdok1t1b.apps.googleusercontent.com`
2. Click on the **Edit** button (pencil icon)

### 3. Configure Authorized Redirect URIs
In the **Authorized redirect URIs** section, add these exact URIs:

```
https://new-pacmac.onrender.com/auth/google/callback
http://localhost:3000/auth/google/callback
```

**Important:** Make sure there are no trailing slashes or extra characters.

### 4. Configure Authorized JavaScript Origins
In the **Authorized JavaScript origins** section, add:

```
https://new-pacmac.onrender.com
http://localhost:3000
```

### 5. Save Changes
1. Click **Save** at the bottom
2. Wait a few minutes for changes to propagate

### 6. Test the Fix
1. Go to your live site: https://new-pacmac.onrender.com
2. Click "Sign In" 
3. The Google OAuth should now work without the redirect_uri_mismatch error

## 🔧 Alternative: Create New OAuth Client

If you can't find the existing client or want to start fresh:

### 1. Create New OAuth 2.0 Client ID
1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. Choose **Web application**

### 2. Configure the New Client
**Name:** `PacMac Marketplace`

**Authorized JavaScript origins:**
```
https://new-pacmac.onrender.com
http://localhost:3000
```

**Authorized redirect URIs:**
```
https://new-pacmac.onrender.com/auth/google/callback
http://localhost:3000/auth/google/callback
```

### 3. Update Your Code
If you create a new client, update the Client ID in:
- `welcome.html` (line 1081)
- `server.js` (line 192)

## 🛠️ OAuth Consent Screen Setup

If you haven't configured the OAuth consent screen:

### 1. Go to OAuth Consent Screen
1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Click **Create**

### 2. Fill Required Fields
**App name:** `PacMac Marketplace`
**User support email:** Your email
**Developer contact information:** Your email

### 3. Add Scopes
Click **Add or Remove Scopes** and add:
- `../auth/userinfo.email`
- `../auth/userinfo.profile`
- `openid`

### 4. Add Test Users (if in Testing mode)
Add your email address to test users list.

## 🔍 Verification Steps

### 1. Check Current Configuration
Visit: https://console.cloud.google.com/apis/credentials

Look for your OAuth 2.0 client and verify:
- ✅ Client ID: `1053950032683-igseosamup9cej3bn1o8lj5kqdok1t1b.apps.googleusercontent.com`
- ✅ Authorized redirect URIs include: `https://new-pacmac.onrender.com/auth/google/callback`
- ✅ Authorized JavaScript origins include: `https://new-pacmac.onrender.com`

### 2. Test OAuth Flow
1. Go to https://new-pacmac.onrender.com
2. Click "Sign In"
3. Should redirect to Google OAuth without errors
4. After authentication, should redirect back to your app

## 🚨 Common Issues & Solutions

### Issue: "redirect_uri_mismatch"
**Solution:** Ensure the exact URI `https://new-pacmac.onrender.com/auth/google/callback` is in your Google API Console

### Issue: "invalid_client"
**Solution:** Check that the Client ID matches exactly in both Google Console and your code

### Issue: "access_denied"
**Solution:** Check OAuth consent screen configuration and test users list

### Issue: "unauthorized_client"
**Solution:** Verify the JavaScript origin `https://new-pacmac.onrender.com` is authorized

## 📞 Need Help?

If you're still having issues:
1. Double-check all URIs match exactly (no trailing slashes)
2. Wait 5-10 minutes after making changes in Google Console
3. Clear browser cache and try again
4. Check browser developer console for additional error details

## 🎯 Expected Result

After fixing the redirect URI configuration:
1. ✅ Google OAuth login works without errors
2. ✅ Users are redirected to profile setup page
3. ✅ Complete onboarding flow functions properly
4. ✅ Users can access the marketplace after setup

---

**Last Updated:** January 17, 2025  
**Status:** Ready for testing
