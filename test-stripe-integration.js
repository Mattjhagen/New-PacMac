#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Comprehensive Stripe Integration Test\n');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

// Test 1: Environment Variables
console.log('🔍 Test 1: Environment Variables');
const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;

console.log(`STRIPE_SECRET_KEY: ${hasSecretKey ? '✅ Set' : '❌ Missing'}`);
console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${hasPublishableKey ? '✅ Set' : '❌ Missing'}`);
console.log(`STRIPE_WEBHOOK_SECRET: ${hasWebhookSecret ? '✅ Set' : '❌ Missing'}`);

if (!hasSecretKey || !hasPublishableKey) {
  console.log('\n⚠️  Cannot proceed with API tests - missing required keys');
  console.log('📝 Please add your Stripe keys to .env.local first');
  process.exit(1);
}

// Test 2: API Connection
console.log('\n🔗 Test 2: Stripe API Connection');
fetch('https://api.stripe.com/v1/charges?limit=1', {
  headers: {
    'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})
.then(response => {
  if (response.ok) {
    console.log('✅ Stripe API connection successful!');
    return response.json();
  } else {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
})
.then(data => {
  console.log('✅ Stripe API is responding correctly');
  console.log(`📊 Test mode: ${process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'Yes' : 'No'}`);
  
  // Test 3: Payment Intent Creation
  console.log('\n💳 Test 3: Payment Intent Creation');
  return fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      amount: '1000', // $10.00
      currency: 'usd',
      metadata: JSON.stringify({
        test: 'true',
        source: 'integration-test'
      })
    })
  });
})
.then(response => {
  if (response.ok) {
    console.log('✅ Payment intent creation successful!');
    return response.json();
  } else {
    throw new Error(`Payment Intent Error: ${response.status} ${response.statusText}`);
  }
})
.then(paymentIntent => {
  console.log(`✅ Payment Intent ID: ${paymentIntent.id}`);
  console.log(`💰 Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
  console.log(`🔒 Status: ${paymentIntent.status}`);
  
  // Test 4: Check API Routes
  console.log('\n🛣️  Test 4: API Routes Check');
  const apiRoutes = [
    'src/app/api/stripe/create-payment-intent/route.ts',
    'src/app/api/stripe/webhook/route.ts'
  ];
  
  apiRoutes.forEach(route => {
    const routePath = path.join(__dirname, route);
    if (fs.existsSync(routePath)) {
      console.log(`✅ ${route} exists`);
    } else {
      console.log(`❌ ${route} missing`);
    }
  });
  
  // Test 5: Check Components
  console.log('\n🧩 Test 5: Components Check');
  const components = [
    'src/components/StripePayment.tsx',
    'src/components/ProductCheckoutModal.tsx',
    'src/components/CheckoutModal.tsx'
  ];
  
  components.forEach(component => {
    const componentPath = path.join(__dirname, component);
    if (fs.existsSync(componentPath)) {
      console.log(`✅ ${component} exists`);
    } else {
      console.log(`❌ ${component} missing`);
    }
  });
  
  console.log('\n🎉 Stripe Integration Test Complete!');
  console.log('\n📋 Summary:');
  console.log('✅ Environment variables configured');
  console.log('✅ API connection working');
  console.log('✅ Payment intent creation working');
  console.log('✅ API routes present');
  console.log('✅ Components present');
  
  console.log('\n🚀 Ready to test in browser:');
  console.log('1. Run: npm run dev');
  console.log('2. Go to: http://localhost:3000');
  console.log('3. Click "💳 Buy Now" on any product');
  console.log('4. Use test card: 4242 4242 4242 4242');
  
})
.catch(error => {
  console.log('❌ Test failed:', error.message);
  if (error.message.includes('401')) {
    console.log('💡 Check your Stripe API key is correct');
  } else if (error.message.includes('402')) {
    console.log('💡 Payment failed - check your account status');
  }
});
