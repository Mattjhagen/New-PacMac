#!/usr/bin/env node

// Script to fix Render service configuration

const axios = require('axios');

const RENDER_API_BASE_URL = 'https://api.render.com/v1';
const API_KEY = 'rnd_TMVOS42FIljet4iPFQlkPGXyh3lz';
const SERVICE_ID = 'srv-d34bcm3ipnbc73fqucq0';

async function fixRenderConfig() {
  console.log('🔧 Fixing Render service configuration...');
  
  try {
    // Update service configuration
    const updateData = {
      serviceDetails: {
        buildCommand: 'npm install && npx prisma generate && npm run build',
        startCommand: 'npm start',
        env: 'node'
      }
    };

    const response = await axios.patch(
      `${RENDER_API_BASE_URL}/services/${SERVICE_ID}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Service configuration updated successfully!');
    console.log('📋 Configuration:');
    console.log(`   Build Command: ${updateData.serviceDetails.buildCommand}`);
    console.log(`   Start Command: ${updateData.serviceDetails.startCommand}`);
    console.log(`   Environment: ${updateData.serviceDetails.env}`);
    console.log(`   Plan: ${updateData.serviceDetails.plan}`);
    console.log(`   Region: ${updateData.serviceDetails.region}`);
    
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Go to Render Dashboard → Your Service → Environment');
    console.log('2. Add these environment variables:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL=https://tvikatcdfnkwvjjpaxbu.supabase.co');
    console.log('   - NEXT_PUBLIC_APP_URL=https://new-pacmac.onrender.com');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    console.log('   - STRIPE_SECRET_KEY=sk_test_...');
    console.log('   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
    console.log('   - STRIPE_WEBHOOK_SECRET=whsec_...');
    console.log('   - GITHUB_CLIENT_ID=Ov23liwak0jfN8lwLFja');
    console.log('   - GITHUB_CLIENT_SECRET=abb3669c6692456ccafaceee3fad33a10ecffed4');
    console.log('   - NEXT_PUBLIC_GITHUB_CLIENT_ID=Ov23liwak0jfN8lwLFja');
    console.log('3. Trigger a new deployment');
    console.log('4. Test: https://new-pacmac.onrender.com/escrow-dashboard');

  } catch (error) {
    console.error('❌ Failed to update service configuration:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('');
      console.log('🔑 Permission denied. You may need to:');
      console.log('1. Check your Render API key permissions');
      console.log('2. Update the configuration manually in the Render dashboard');
    }
  }
}

// Run the script
fixRenderConfig().catch(console.error);
