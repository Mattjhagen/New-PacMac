# 🔧 Stripe Integration Setup Guide

## 📋 **Step 1: Get Your Stripe Keys**

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/apikeys
2. **Copy your keys**:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

## 🗝️ **Step 2: Create Environment File**

Create a file called `.env.local` in your project root with:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_ENVIRONMENT=test
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🚀 **Step 3: Vercel Environment Variables**

For production deployment, add these to Vercel:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add each variable**:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SITE_URL`

## 🔗 **Step 4: Webhook Setup**

1. **Go to Stripe Dashboard** → Webhooks
2. **Add endpoint**: `https://your-domain.com/api/stripe/webhook`
3. **Select events**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. **Copy webhook secret** to your environment variables

## 💳 **Step 5: Test Cards**

Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## 🔒 **Security Notes**

- ✅ **Never commit** `.env.local` to git
- ✅ **Use test keys** during development
- ✅ **Switch to live keys** only for production
- ✅ **Keep secret keys** secure and private

## 📱 **Step 6: Test Integration**

1. **Start your app**: `npm run dev`
2. **Go to**: `http://localhost:3000`
3. **Try a test purchase** with test card numbers
4. **Check Stripe Dashboard** for payment logs

## 🆘 **Troubleshooting**

- **"Invalid API Key"**: Check your keys are correct
- **"Webhook failed"**: Verify webhook URL and secret
- **"CORS error"**: Ensure proper domain configuration
- **"Payment failed"**: Check card details and amount

## 📞 **Support**

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Test Mode**: Use test keys until ready for live payments
