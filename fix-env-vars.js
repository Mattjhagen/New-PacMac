#!/usr/bin/env node

// Script to fix environment variables for production deployment

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing environment variables for production...');

// Read current .env.local
const envPath = path.join(__dirname, '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

// Fix Supabase URL
envContent = envContent.replace(
  'NEXT_PUBLIC_SUPABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.tvikatcdfnkwvjjpaxbu.supabase.co:5432/postgres"',
  'NEXT_PUBLIC_SUPABASE_URL="https://tvikatcdfnkwvjjpaxbu.supabase.co"'
);

// Update app URL for production
envContent = envContent.replace(
  'NEXT_PUBLIC_APP_URL=http://localhost:3002',
  'NEXT_PUBLIC_APP_URL=https://new-pacmac.onrender.com'
);

// Write updated content
fs.writeFileSync(envPath, envContent);

console.log('✅ Environment variables fixed!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Update these environment variables on Render:');
console.log('   - NEXT_PUBLIC_SUPABASE_URL=https://tvikatcdfnkwvjjpaxbu.supabase.co');
console.log('   - NEXT_PUBLIC_APP_URL=https://new-pacmac.onrender.com');
console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('   - STRIPE_SECRET_KEY=sk_test_...');
console.log('   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
console.log('   - STRIPE_WEBHOOK_SECRET=whsec_...');
console.log('   - GITHUB_CLIENT_ID=Ov23liwak0jfN8lwLFja');
console.log('   - GITHUB_CLIENT_SECRET=abb3669c6692456ccafaceee3fad33a10ecffed4');
console.log('   - NEXT_PUBLIC_GITHUB_CLIENT_ID=Ov23liwak0jfN8lwLFja');
console.log('');
console.log('2. Trigger a new deployment on Render');
console.log('');
console.log('3. Test the escrow dashboard: https://new-pacmac.onrender.com/escrow-dashboard');
