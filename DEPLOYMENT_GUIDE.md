# 🚀 PacMac Marketplace - Deployment Guide

## 📋 **Deployment Overview**

This guide covers the complete deployment process for PacMac Marketplace from development to production on Render.com.

---

## 🛠️ **Prerequisites**

### **Required Accounts:**
- [GitHub Account](https://github.com) - Code repository
- [Render Account](https://render.com) - Hosting platform
- [Google Cloud Console](https://console.cloud.google.com) - OAuth credentials
- [Stripe Account](https://stripe.com) - Payment processing
- [Domain Provider](https://namecheap.com) - Custom domain (optional)

### **Required Tools:**
- Git (version control)
- Node.js 18+ (local development)
- npm or yarn (package manager)
- Text editor (VS Code recommended)

---

## 🔧 **Step 1: Environment Setup**

### **1.1 Clone Repository**
```bash
git clone https://github.com/Mattjhagen/New-PacMac.git
cd New-PacMac
```

### **1.2 Install Dependencies**
```bash
npm install
```

### **1.3 Environment Variables**
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your values
nano .env
```

**Required Environment Variables:**
```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_stripe_publishable_key_here

# Contact Information
DISPUTE_EMAIL=disputes@pacmacmobile.com
DISPUTE_PHONE=(947) 225-4327

# Server Configuration
PORT=3000
NODE_ENV=production
```

---

## 🔐 **Step 2: Google OAuth Setup**

### **2.1 Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "New Project"
3. Enter project name: "PacMac Marketplace"
4. Click "Create"

### **2.2 Enable Google+ API**
1. In the project dashboard, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click "Enable"

### **2.3 Create OAuth Credentials**
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://your-domain.com/auth/google/callback` (production)
5. Click "Create"
6. Copy the Client ID and Client Secret

### **2.4 Configure OAuth Consent Screen**
1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Fill in required fields:
   - App name: "PacMac Marketplace"
   - User support email: your email
   - Developer contact: your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (for development)

---

## 💳 **Step 3: Stripe Setup**

### **3.1 Create Stripe Account**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up for an account
3. Complete account verification

### **3.2 Get API Keys**
1. In Stripe Dashboard, go to "Developers" > "API keys"
2. Copy the "Publishable key" and "Secret key"
3. Use test keys for development, live keys for production

### **3.3 Configure Webhooks (Optional)**
1. Go to "Developers" > "Webhooks"
2. Click "Add endpoint"
3. Enter URL: `https://your-domain.com/api/stripe/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the webhook secret

---

## 🌐 **Step 4: Render.com Deployment**

### **4.1 Connect GitHub Repository**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" > "Web Service"
3. Connect your GitHub account
4. Select the "New-PacMac" repository
5. Click "Connect"

### **4.2 Configure Service**
```yaml
# Service Configuration
Name: pacmac-marketplace
Environment: Node
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

### **4.3 Set Environment Variables**
In Render dashboard, go to "Environment" tab and add:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session
SESSION_SECRET=your-session-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Contact
DISPUTE_EMAIL=disputes@pacmacmobile.com
DISPUTE_PHONE=(947) 225-4327

# Server
NODE_ENV=production
PORT=3000
```

### **4.4 Deploy Service**
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note the service URL (e.g., `https://pacmac-marketplace.onrender.com`)

---

## 🔗 **Step 5: Domain Configuration (Optional)**

### **5.1 Custom Domain Setup**
1. In Render dashboard, go to "Settings" > "Custom Domains"
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `pacmacmobile.com`)
4. Follow DNS configuration instructions

### **5.2 DNS Configuration**
Add these DNS records to your domain provider:

```
Type: CNAME
Name: www
Value: pacmac-marketplace.onrender.com

Type: A
Name: @
Value: [Render IP Address]
```

### **5.3 SSL Certificate**
- Render automatically provides SSL certificates
- Wait for certificate to be issued (usually 24-48 hours)

---

## 🔄 **Step 6: Update OAuth Redirect URIs**

### **6.1 Update Google OAuth Settings**
1. Go back to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" > "Credentials"
3. Edit your OAuth client
4. Update authorized redirect URIs:
   - `https://your-domain.com/auth/google/callback`
   - `https://pacmac-marketplace.onrender.com/auth/google/callback`

### **6.2 Test OAuth Flow**
1. Visit your deployed application
2. Click "Continue with Google"
3. Complete OAuth flow
4. Verify successful authentication

---

## 🧪 **Step 7: Testing & Verification**

### **7.1 Health Check**
```bash
# Test health endpoint
curl https://your-domain.com/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "version": "1.0.0"
}
```

### **7.2 OAuth Testing**
1. Visit your application URL
2. Click "Continue with Google"
3. Complete authentication
4. Verify user profile loads correctly

### **7.3 Payment Testing**
1. Use Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
2. Test bid functionality ($0.05)
3. Test purchase functionality ($1.00)
4. Verify fee calculations

### **7.4 Demo Mode Testing**
1. Click "Try Demo Mode"
2. Verify demo user loads
3. Test marketplace functionality
4. Verify all features work

---

## 📊 **Step 8: Monitoring & Maintenance**

### **8.1 Render Dashboard Monitoring**
- Monitor service uptime and performance
- Check deployment logs for errors
- Monitor resource usage

### **8.2 Stripe Dashboard Monitoring**
- Monitor payment success rates
- Check for failed transactions
- Review webhook delivery status

### **8.3 Google Cloud Console Monitoring**
- Monitor OAuth usage
- Check API quotas
- Review security settings

---

## 🔧 **Step 9: Production Checklist**

### **9.1 Security Checklist**
- [ ] Environment variables are set correctly
- [ ] OAuth redirect URIs are configured
- [ ] Stripe keys are live (not test) keys
- [ ] SSL certificate is active
- [ ] Session secret is secure and random

### **9.2 Functionality Checklist**
- [ ] OAuth authentication works
- [ ] Demo mode works
- [ ] Payment processing works
- [ ] Fee calculations are correct
- [ ] Chat functionality works
- [ ] Verification system works

### **9.3 Performance Checklist**
- [ ] Page load times are acceptable
- [ ] API response times are fast
- [ ] Error handling is working
- [ ] Logging is configured
- [ ] Health checks are responding

---

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **OAuth Issues:**
```bash
# Check OAuth configuration
Error: "redirect_uri_mismatch"
Solution: Update redirect URIs in Google Console

Error: "invalid_client"
Solution: Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
```

#### **Stripe Issues:**
```bash
# Check Stripe configuration
Error: "Invalid API key"
Solution: Verify STRIPE_SECRET_KEY is correct

Error: "Payment failed"
Solution: Check Stripe dashboard for error details
```

#### **Deployment Issues:**
```bash
# Check deployment logs
Error: "Build failed"
Solution: Check package.json and dependencies

Error: "Service unavailable"
Solution: Check environment variables and health endpoint
```

### **Debug Commands:**
```bash
# Check service status
curl https://your-domain.com/health

# Check API health
curl https://your-domain.com/api/health

# Test OAuth endpoint
curl https://your-domain.com/auth/google

# Check Stripe connection
# Use Stripe CLI or dashboard
```

---

## 📈 **Step 10: Scaling & Optimization**

### **10.1 Performance Optimization**
- Enable Render's auto-scaling
- Configure CDN for static assets
- Implement caching strategies
- Monitor and optimize database queries

### **10.2 Security Enhancements**
- Implement rate limiting
- Add CSRF protection
- Configure security headers
- Set up monitoring and alerting

### **10.3 Feature Enhancements**
- Add real-time notifications
- Implement advanced search
- Add user reviews and ratings
- Integrate with external services

---

## 📚 **Additional Resources**

### **Documentation:**
- [Render Documentation](https://render.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Stripe Documentation](https://stripe.com/docs)
- [Node.js Documentation](https://nodejs.org/docs)

### **Support:**
- [Render Support](https://render.com/support)
- [Google Cloud Support](https://cloud.google.com/support)
- [Stripe Support](https://support.stripe.com)
- [GitHub Support](https://support.github.com)

### **Community:**
- [Render Community](https://community.render.com)
- [Stack Overflow](https://stackoverflow.com)
- [Reddit r/webdev](https://reddit.com/r/webdev)

---

## 🎯 **Success Metrics**

### **Deployment Success Indicators:**
- ✅ Service is accessible via URL
- ✅ OAuth authentication works
- ✅ Payment processing works
- ✅ All features are functional
- ✅ Performance is acceptable
- ✅ Security is properly configured

### **Post-Deployment Monitoring:**
- Monitor uptime and availability
- Track user registrations and activity
- Monitor payment success rates
- Review error logs and performance metrics
- Collect user feedback and iterate

---

**Deployment Complete! 🎉**

Your PacMac Marketplace is now live and ready for users. Monitor the deployment closely for the first 24-48 hours to ensure everything is working correctly.

**Last Updated: January 2025**
**Version: 1.0.0**
**Status: Production Ready**
