# 🧪 Stripe Testing Guide

## 🚀 **Quick Start Testing**

### **Step 1: Set Up Stripe Keys**

1. **Get your Stripe keys** from: https://dashboard.stripe.com/apikeys
2. **Add to `.env.local`**:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_actual_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

### **Step 2: Run Tests**

```bash
# Test environment setup
node test-stripe-setup.js

# Test full integration
node test-stripe-integration.js

# Test webhook endpoint
node test-stripe-webhook.js
```

### **Step 3: Test in Browser**

```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000

# Click "💳 Buy Now" on any product
# Use test card: 4242 4242 4242 4242
```

## 🔧 **Test Scripts**

### **1. `test-stripe-setup.js`**
- ✅ Checks environment variables
- ✅ Tests API connection
- ✅ Validates key formats

### **2. `test-stripe-integration.js`**
- ✅ Full integration test
- ✅ Payment intent creation
- ✅ API routes verification
- ✅ Components check

### **3. `test-stripe-webhook.js`**
- ✅ Webhook endpoint test
- ✅ Signature validation
- ✅ Event handling

## 💳 **Test Cards**

| Card Number | Description | Expected Result |
|-------------|-------------|-----------------|
| `4242 4242 4242 4242` | Visa | ✅ Success |
| `4000 0000 0000 0002` | Declined | ❌ Declined |
| `4000 0025 0000 3155` | 3D Secure | 🔐 Requires authentication |
| `4000 0000 0000 9995` | Insufficient funds | ❌ Declined |

**Test Details:**
- **Expiry**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

## 🛠️ **Manual Testing Steps**

### **1. Product Purchase Flow**
1. Go to homepage
2. Click "💳 Buy Now" on any product
3. Review order summary
4. Enter test card details
5. Complete payment
6. Verify success page

### **2. Error Handling**
1. Use declined card (`4000 0000 0000 0002`)
2. Verify error message displays
3. Try with invalid card number
4. Test with expired date

### **3. Mobile Testing**
1. Open on mobile device
2. Test payment form responsiveness
3. Verify touch interactions
4. Check modal behavior

## 🔍 **Debugging**

### **Common Issues:**

#### **"Invalid API Key"**
```bash
# Check your keys
node test-stripe-setup.js
```
- Verify keys are correct
- Check for extra spaces
- Ensure test vs live keys

#### **"Payment Failed"**
- Check card details
- Verify amount is valid
- Check account status

#### **"Webhook Failed"**
```bash
# Test webhook
node test-stripe-webhook.js
```
- Verify webhook URL
- Check webhook secret
- Ensure server is running

#### **"CORS Error"**
- Check domain configuration
- Verify HTTPS in production
- Update allowed origins

### **Logs to Check:**

```bash
# Development server logs
npm run dev

# Browser console
F12 → Console

# Stripe Dashboard
https://dashboard.stripe.com/logs
```

## 📊 **Success Indicators**

### **✅ Working Correctly:**
- Payment intent created successfully
- Payment form loads without errors
- Test card payments succeed
- Success page displays
- Webhook events received

### **❌ Needs Fixing:**
- API key errors
- Payment form won't load
- Cards always decline
- No success confirmation
- Webhook timeouts

## 🚀 **Production Checklist**

Before going live:

- [ ] Switch to live Stripe keys
- [ ] Update webhook URLs to production domain
- [ ] Test with real (small) amounts
- [ ] Verify SSL certificate
- [ ] Check error handling
- [ ] Test mobile experience
- [ ] Verify webhook security

## 🆘 **Getting Help**

### **Stripe Resources:**
- [Stripe Documentation](https://stripe.com/docs)
- [Test Cards](https://stripe.com/docs/testing)
- [Webhook Guide](https://stripe.com/docs/webhooks)

### **Debug Commands:**
```bash
# Check environment
node test-stripe-setup.js

# Full test
node test-stripe-integration.js

# Webhook test
node test-stripe-webhook.js

# Start server
npm run dev
```

## 🎯 **Expected Results**

After successful setup:

1. **Environment Test**: ✅ All keys configured
2. **API Test**: ✅ Connection successful
3. **Payment Test**: ✅ Intent created
4. **Browser Test**: ✅ Payment form works
5. **Webhook Test**: ✅ Events received

**Your Stripe integration is ready for production!** 🚀
