# 🚀 PacMac Mobile - Quick Start Guide

## Get Your Site Live in 5 Minutes!

### Option 1: Local Development (Recommended for testing)

1. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your actual API keys
   ```

2. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

3. **Visit your site:**
   ```
   http://localhost:3000
   ```

### Option 2: Deploy to Vercel (Free & Easy)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `SENDGRID_API_KEY`

### Option 3: Deploy to Heroku

1. **Install Heroku CLI:**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   ```

2. **Create Heroku app:**
   ```bash
   heroku create pacmac-mobile
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set STRIPE_SECRET_KEY=sk_live_your_key
   heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   heroku config:set SENDGRID_API_KEY=SG.your_key
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Option 4: Deploy to Railway

1. **Connect your GitHub repo to Railway**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically on git push**

## 🔑 Required API Keys

### Stripe (Required for payments)
- Get from: https://dashboard.stripe.com/apikeys
- Set: `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`

### SendGrid (Required for emails)
- Get from: https://app.sendgrid.com/settings/api_keys
- Set: `SENDGRID_API_KEY`

### Optional Services
- **Progressive Leasing**: For lease-to-own payments
- **Nomad Internet**: For internet add-ons
- **Apple Trade-In**: For device trade-ins

## 🎯 What's Included

✅ **Full e-commerce functionality**
✅ **Payment processing with Stripe**
✅ **Email notifications with SendGrid**
✅ **Trade-in system with Phobio**
✅ **Progressive Leasing integration**
✅ **Nomad Internet add-ons**
✅ **Responsive design**
✅ **Mobile-optimized**
✅ **SEO-friendly**

## 🚨 Important Notes

- **Never commit API keys** to git
- **Use environment variables** for all sensitive data
- **Test thoroughly** before going live
- **Monitor your Stripe dashboard** for payments
- **Set up webhooks** for production

## 📞 Support

Need help? Check the main README.md for detailed documentation.
