#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Stripe Setup...\n');

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

// Check Stripe environment variables
console.log('🔍 Checking Stripe Environment Variables:');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set (starts with sk_)' : '❌ Not set');
console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set (starts with pk_)' : '❌ Not set');
console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set (starts with whsec_)' : '❌ Not set');

// Test Stripe API connection if secret key is available
if (process.env.STRIPE_SECRET_KEY) {
  console.log('\n🔗 Testing Stripe API Connection...');
  
  // Simple test to verify the API key works
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
    console.log('📊 Test mode:', process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'Yes' : 'No');
  })
  .catch(error => {
    console.log('❌ Stripe API connection failed:', error.message);
    if (error.message.includes('401')) {
      console.log('💡 This usually means your API key is invalid or expired');
    }
  });
} else {
  console.log('\n⚠️  Cannot test API connection - STRIPE_SECRET_KEY not set');
}

console.log('\n📋 Next Steps:');
if (!process.env.STRIPE_SECRET_KEY) {
  console.log('1. Get your Stripe keys from: https://dashboard.stripe.com/apikeys');
  console.log('2. Add them to your .env.local file:');
  console.log('   STRIPE_SECRET_KEY=sk_test_your_key_here');
  console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here');
  console.log('   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here');
} else {
  console.log('1. ✅ Stripe keys are configured');
  console.log('2. 🧪 Run the app and test the payment flow');
  console.log('3. 🔗 Set up webhooks in Stripe dashboard');
}

console.log('\n💳 Test Cards:');
console.log('• Success: 4242 4242 4242 4242');
console.log('• Decline: 4000 0000 0000 0002');
console.log('• 3D Secure: 4000 0025 0000 3155');
