#!/usr/bin/env node

/**
 * Test script for OAuth setup
 * Run with: node test-oauth-setup.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
          process.env[key] = value;
        }
      }
    });
  }
}

// Load environment variables
loadEnvFile();

// Test configuration
const config = {
  clientId: process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
};

async function testOAuthSetup() {
  console.log('🔍 Testing OAuth Setup...\n');
  
  // Test 1: Environment Variables
  console.log('📋 Test 1: Environment Variables');
  const envFile = path.join(process.cwd(), '.env.local');
  const envExists = fs.existsSync(envFile);
  
  if (envExists) {
    console.log('✅ .env.local file exists');
    const envContent = fs.readFileSync(envFile, 'utf8');
    
    const hasClientId = envContent.includes('GITHUB_CLIENT_ID=');
    const hasClientSecret = envContent.includes('GITHUB_CLIENT_SECRET=');
    const hasPublicClientId = envContent.includes('NEXT_PUBLIC_GITHUB_CLIENT_ID=');
    
    console.log(`   Client ID: ${hasClientId ? '✅' : '❌'}`);
    console.log(`   Client Secret: ${hasClientSecret ? '✅' : '❌'}`);
    console.log(`   Public Client ID: ${hasPublicClientId ? '✅' : '❌'}`);
    
    if (!hasClientId || !hasClientSecret || !hasPublicClientId) {
      console.log('❌ Missing required environment variables');
      console.log('   Please check your .env.local file');
      return;
    }
  } else {
    console.log('❌ .env.local file not found');
    console.log('   Please create .env.local with your GitHub OAuth credentials');
    return;
  }

  // Test 2: GitHub OAuth App Configuration
  console.log('\n🔧 Test 2: GitHub OAuth App Configuration');
  if (!config.clientId) {
    console.log('❌ GITHUB_CLIENT_ID not found in environment');
    return;
  }
  
  console.log(`✅ Client ID found: ${config.clientId.substring(0, 8)}...`);
  
  // Test 3: Callback URL Configuration
  console.log('\n🔗 Test 3: Callback URL Configuration');
  const expectedCallbackUrl = `${config.appUrl}/auth/callback`;
  console.log(`✅ Expected callback URL: ${expectedCallbackUrl}`);
  console.log('   Make sure this matches your GitHub OAuth app settings');

  // Test 4: File Structure
  console.log('\n📁 Test 4: File Structure');
  const requiredFiles = [
    'src/components/OAuthSplashScreen.tsx',
    'src/app/auth/callback/page.tsx',
    'src/app/api/auth/github/route.ts'
  ];
  
  let allFilesExist = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    const exists = fs.existsSync(filePath);
    console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
    if (!exists) allFilesExist = false;
  });
  
  if (!allFilesExist) {
    console.log('❌ Some required files are missing');
    return;
  }

  // Test 5: GitHub API Access (if token available)
  console.log('\n🌐 Test 5: GitHub API Access');
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      const response = await makeGitHubRequest('/user', token);
      if (response.status === 200) {
        const userData = JSON.parse(response.data);
        console.log(`✅ GitHub API access successful`);
        console.log(`   User: ${userData.login} (${userData.name})`);
      } else {
        console.log(`❌ GitHub API access failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ GitHub API test failed: ${error.message}`);
    }
  } else {
    console.log('⚠️  GITHUB_TOKEN not found - skipping API test');
  }

  // Test 6: Next.js Configuration
  console.log('\n⚙️  Test 6: Next.js Configuration');
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  const nextConfigExists = fs.existsSync(nextConfigPath);
  console.log(`   next.config.js: ${nextConfigExists ? '✅' : '❌'}`);
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJsonExists = fs.existsSync(packageJsonPath);
  console.log(`   package.json: ${packageJsonExists ? '✅' : '❌'}`);

  console.log('\n🎉 OAuth Setup Test Complete!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Start your Next.js app: npm run dev');
  console.log('   2. Visit http://localhost:3000');
  console.log('   3. Click "Continue with GitHub"');
  console.log('   4. Complete the OAuth flow');
  console.log('   5. Test logout functionality');
  
  console.log('\n🔧 GitHub OAuth App Setup:');
  console.log('   1. Go to https://github.com/settings/developers');
  console.log('   2. Create a new OAuth App');
  console.log('   3. Set Homepage URL: http://localhost:3000');
  console.log('   4. Set Callback URL: http://localhost:3000/auth/callback');
  console.log('   5. Copy Client ID and Secret to .env.local');
}

function makeGitHubRequest(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'PacMac-OAuth-Test'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Run the test
testOAuthSetup().catch(console.error);
