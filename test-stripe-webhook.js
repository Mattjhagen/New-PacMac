#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔗 Stripe Webhook Test\n');

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

// Test webhook endpoint
const testWebhook = async () => {
  const webhookUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const webhookEndpoint = `${webhookUrl}/api/stripe/webhook`;
  
  console.log('🧪 Testing Webhook Endpoint...');
  console.log(`📍 URL: ${webhookEndpoint}`);
  
  // Create a test webhook payload
  const testPayload = {
    id: 'evt_test_webhook',
    object: 'event',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_123',
        amount: 1000,
        currency: 'usd',
        status: 'succeeded',
        metadata: {
          test: 'true'
        }
      }
    }
  };
  
  try {
    const response = await fetch(webhookEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 'test_signature' // This will fail validation, but we can test the endpoint
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    
    if (response.status === 400) {
      console.log('✅ Webhook endpoint is responding (signature validation working)');
    } else if (response.status === 200) {
      console.log('✅ Webhook endpoint is working');
    } else {
      console.log(`⚠️  Unexpected response: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log(`📝 Response: ${responseText.substring(0, 200)}...`);
    
  } catch (error) {
    console.log('❌ Webhook test failed:', error.message);
    console.log('💡 Make sure your development server is running (npm run dev)');
  }
};

// Check if webhook secret is configured
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.log('⚠️  STRIPE_WEBHOOK_SECRET not configured');
  console.log('📝 To set up webhooks:');
  console.log('1. Go to Stripe Dashboard → Webhooks');
  console.log('2. Add endpoint: https://your-domain.com/api/stripe/webhook');
  console.log('3. Select events: payment_intent.succeeded, payment_intent.payment_failed');
  console.log('4. Copy webhook secret to STRIPE_WEBHOOK_SECRET');
} else {
  console.log('✅ Webhook secret configured');
  testWebhook();
}

console.log('\n🔧 Webhook Setup Guide:');
console.log('1. Stripe Dashboard → Webhooks → Add endpoint');
console.log('2. URL: https://your-domain.com/api/stripe/webhook');
console.log('3. Events to send:');
console.log('   • payment_intent.succeeded');
console.log('   • payment_intent.payment_failed');
console.log('   • checkout.session.completed');
console.log('4. Copy webhook signing secret to .env.local');
