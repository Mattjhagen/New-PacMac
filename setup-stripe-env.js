#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Stripe Environment Setup Helper\n');

const envPath = path.join(__dirname, '.env.local');
const stripeConfig = `

# Stripe Configuration (Add your actual keys here)
# Get these from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here`;

// Check if .env.local exists
if (fs.existsSync(envPath)) {
  const currentContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if Stripe config already exists
  if (currentContent.includes('STRIPE_SECRET_KEY')) {
    console.log('✅ Stripe configuration already exists in .env.local');
    console.log('📝 Current Stripe variables:');
    
    const lines = currentContent.split('\n');
    lines.forEach(line => {
      if (line.includes('STRIPE_') || line.includes('NEXT_PUBLIC_STRIPE_')) {
        const [key] = line.split('=');
        console.log(`   ${key.trim()}`);
      }
    });
  } else {
    console.log('📝 Adding Stripe configuration to .env.local...');
    fs.appendFileSync(envPath, stripeConfig);
    console.log('✅ Stripe configuration added!');
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('📝 Creating .env.local with Stripe configuration...');
  fs.writeFileSync(envPath, stripeConfig.trim());
  console.log('✅ .env.local created with Stripe configuration!');
}

console.log('\n🔑 Next Steps:');
console.log('1. Go to: https://dashboard.stripe.com/apikeys');
console.log('2. Copy your Stripe keys');
console.log('3. Replace the placeholder values in .env.local:');
console.log('   - sk_test_your_stripe_secret_key_here');
console.log('   - pk_test_your_stripe_publishable_key_here');
console.log('   - whsec_your_webhook_secret_here');
console.log('\n💳 Test Cards:');
console.log('• Success: 4242 4242 4242 4242');
console.log('• Decline: 4000 0000 0000 0002');
console.log('• 3D Secure: 4000 0025 0000 3155');
