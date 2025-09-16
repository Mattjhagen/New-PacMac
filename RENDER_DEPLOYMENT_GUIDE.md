# 🚀 Render Deployment Guide for PacMac Mobile

## 📋 **Prerequisites**

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Have your keys ready

## 🔧 **Step 1: Connect GitHub Repository**

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**:
   - Select your `New-PacMac` repository
   - Choose the `main` branch

## ⚙️ **Step 2: Configure Build Settings**

### **Basic Settings:**
- **Name**: `pacmac-mobile`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (uses root)

### **Build & Deploy:**
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`

## 🔑 **Step 3: Environment Variables**

Add these environment variables in Render dashboard:

### **Supabase Configuration:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tvikatcdfnkwvjjpaxbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aWthdGNkZm5rd3ZqanBheGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDMxMzgsImV4cCI6MjA3Mjk3OTEzOH0.4NmsPSyWrwy7B2wQ1HEAXLr-2ccVPAg5gnGzFsElU24
```

### **Stripe Configuration:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### **GitHub OAuth:**
```bash
GITHUB_CLIENT_ID=Ov23liwak0jfN8lwLFja
GITHUB_CLIENT_SECRET=your_github_client_secret_here
NEXT_PUBLIC_GITHUB_CLIENT_ID=Ov23liwak0jfN8lwLFja
```

### **App Configuration:**
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-render-app.onrender.com
```

## 🚀 **Step 4: Deploy**

1. **Click "Create Web Service"**
2. **Wait for deployment** (5-10 minutes)
3. **Get your Render URL**: `https://your-app-name.onrender.com`

## 🔗 **Step 5: Update Webhook URLs**

### **Stripe Webhook:**
1. **Go to Stripe Dashboard** → **Webhooks**
2. **Update endpoint URL** to: `https://your-render-app.onrender.com/api/stripe/webhook`
3. **Test the webhook** to ensure it's working

### **GitHub OAuth App:**
1. **Go to GitHub** → **Settings** → **Developer settings** → **OAuth Apps**
2. **Update Homepage URL** to: `https://your-render-app.onrender.com`
3. **Update Authorization callback URL** to: `https://your-render-app.onrender.com/auth/callback`

### **Supabase OAuth:**
1. **Go to Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Update Site URL** to: `https://your-render-app.onrender.com`
3. **Update Redirect URLs** to include: `https://your-render-app.onrender.com/auth/callback`

## 🧪 **Step 6: Test the Deployment**

### **Test OAuth:**
1. Visit your Render URL
2. Click "Continue with GitHub"
3. Complete GitHub authentication
4. Verify you're logged in

### **Test Stripe:**
1. Click "💳 Buy Now" on any product
2. Use test card: `4242 4242 4242 4242`
3. Complete payment
4. Verify success page

## 📊 **Step 7: Monitor & Optimize**

### **Render Dashboard:**
- **Logs**: Monitor application logs
- **Metrics**: Check performance metrics
- **Deployments**: Track deployment history

### **Performance Tips:**
- **Enable Auto-Deploy**: Automatic deployments on git push
- **Custom Domain**: Add your own domain
- **SSL**: Automatically provided by Render

## 🆘 **Troubleshooting**

### **Common Issues:**

**Build Fails:**
- Check Node.js version (should be 18+)
- Verify all dependencies in package.json
- Check build logs for specific errors

**Environment Variables:**
- Ensure all required variables are set
- Check variable names match exactly
- Verify no extra spaces or quotes

**Database Issues:**
- Ensure Prisma schema is correct
- Check database connection strings
- Verify migrations are applied

**OAuth Issues:**
- Update callback URLs in all services
- Check client IDs and secrets
- Verify redirect URLs match exactly

### **Debug Commands:**
```bash
# Check build locally
npm run build

# Test environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Check Prisma
npx prisma generate
npx prisma db push
```

## 🎯 **Success Checklist**

- ✅ **App deploys successfully**
- ✅ **OAuth login works**
- ✅ **Stripe payments process**
- ✅ **Webhooks receive events**
- ✅ **Database connections work**
- ✅ **Custom domain configured** (optional)

## 📞 **Support**

- **Render Docs**: https://render.com/docs
- **Render Support**: https://render.com/support
- **Next.js on Render**: https://render.com/docs/deploy-nextjs

## 🎊 **You're Live!**

Your PacMac Mobile app is now running on Render with:
- ✅ **Secure OAuth authentication**
- ✅ **Stripe payment processing**
- ✅ **Real-time webhooks**
- ✅ **Production-ready deployment**

**Happy selling!** 🚀
