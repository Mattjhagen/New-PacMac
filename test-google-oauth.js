#!/usr/bin/env node

/**
 * Google OAuth Setup Test Script
 * 
 * This script helps verify that your Google OAuth configuration is correct.
 * Run this script to check your environment variables and OAuth setup.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Google OAuth Setup Test\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local file not found');
  console.log('📝 Create a .env.local file with the following variables:');
  console.log('');
  console.log('GOOGLE_CLIENT_ID=your_google_client_id');
  console.log('GOOGLE_CLIENT_SECRET=your_google_client_secret');
  console.log('NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id');
  console.log('NEXT_PUBLIC_APP_URL=http://localhost:3000');
  console.log('');
  process.exit(1);
}

// Read and parse .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

console.log('✅ .env.local file found\n');

// Check required environment variables
const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_APP_URL'
];

let allVarsPresent = true;

console.log('🔧 Checking environment variables:');
requiredVars.forEach(varName => {
  if (envVars[varName] && envVars[varName] !== 'your_google_client_id' && envVars[varName] !== 'your_google_client_secret') {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing or placeholder value`);
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.log('\n❌ Some environment variables are missing or have placeholder values');
  console.log('📝 Please update your .env.local file with actual Google OAuth credentials');
  console.log('');
  console.log('🔗 Get your credentials from: https://console.cloud.google.com/');
  process.exit(1);
}

console.log('\n✅ All environment variables are set correctly');

// Check if Google OAuth API route exists
const apiRoutePath = path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'google', 'route.ts');
const apiRouteExists = fs.existsSync(apiRoutePath);

if (apiRouteExists) {
  console.log('✅ Google OAuth API route exists');
} else {
  console.log('❌ Google OAuth API route not found');
  console.log('📝 Expected: src/app/api/auth/google/route.ts');
}

// Check if auth callback page exists
const callbackPath = path.join(process.cwd(), 'src', 'app', 'auth', 'callback', 'page.tsx');
const callbackExists = fs.existsSync(callbackPath);

if (callbackExists) {
  console.log('✅ Auth callback page exists');
} else {
  console.log('❌ Auth callback page not found');
  console.log('📝 Expected: src/app/auth/callback/page.tsx');
}

// Check if OAuth splash screen component exists
const splashPath = path.join(process.cwd(), 'src', 'components', 'OAuthSplashScreen.tsx');
const splashExists = fs.existsSync(splashPath);

if (splashExists) {
  console.log('✅ OAuth splash screen component exists');
} else {
  console.log('❌ OAuth splash screen component not found');
  console.log('📝 Expected: src/components/OAuthSplashScreen.tsx');
}

console.log('\n🎉 Google OAuth setup verification complete!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Start your development server: npm run dev');
console.log('2. Visit http://localhost:3000');
console.log('3. Click "Continue with Google" to test the OAuth flow');
console.log('4. Check browser console for any errors');
console.log('');
console.log('🔗 Google OAuth App Configuration:');
console.log('- Authorized JavaScript origins: http://localhost:3000');
console.log('- Authorized redirect URIs: http://localhost:3000/auth/callback');
console.log('');
console.log('📚 For detailed setup instructions, see: GOOGLE_OAUTH_SETUP.md');
