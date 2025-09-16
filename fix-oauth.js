#!/usr/bin/env node

/**
 * OAuth Configuration Fixer for PacMac Marketplace
 * This script helps fix the Google OAuth redirect_uri_mismatch error
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 PacMac Marketplace OAuth Configuration Fixer\n');

// Your Google OAuth credentials
const oauthConfig = {
  clientId: "1053950032683-uq62m35cvps95qql1u8b8malds0jipe2.apps.googleusercontent.com",
  projectId: "vibecodealpha",
  clientSecret: "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"
};

console.log('📋 Current OAuth Configuration:');
console.log(`   Client ID: ${oauthConfig.clientId}`);
console.log(`   Project ID: ${oauthConfig.projectId}`);
console.log(`   Client Secret: ${oauthConfig.clientSecret.substring(0, 10)}...`);

console.log('\n🌐 Render URL Options:');
console.log('   Your Render app URL is likely one of these:');
console.log('   1. https://pacmac-marketplace.onrender.com');
console.log('   2. https://pacmac-web.onrender.com');
console.log('   3. https://new-pacmac.onrender.com');
console.log('   4. Check your Render dashboard for the exact URL');

console.log('\n🔧 Steps to Fix OAuth:');
console.log('   1. Go to: https://console.developers.google.com/');
console.log('   2. Select project: vibecodealpha');
console.log('   3. Go to: APIs & Services > Credentials');
console.log('   4. Click on your OAuth 2.0 Client ID');
console.log('   5. Add these Authorized redirect URIs:');
console.log('      - https://pacmac-marketplace.onrender.com/auth/google/callback');
console.log('      - https://pacmac-web.onrender.com/auth/google/callback');
console.log('      - https://new-pacmac.onrender.com/auth/google/callback');
console.log('      - http://localhost:3000/auth/google/callback (for development)');
console.log('   6. Save the changes');

console.log('\n📝 Environment Variables to Set in Render:');
console.log('   GOOGLE_CLIENT_ID=1053950032683-uq62m35cvps95qql1u8b8malds0jipe2.apps.googleusercontent.com');
console.log('   GOOGLE_CLIENT_SECRET=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');
console.log('   SESSION_SECRET=your-secure-session-secret-here');
console.log('   NODE_ENV=production');

console.log('\n🧪 Test Commands:');
console.log('   # Test health endpoint');
console.log('   curl https://your-render-url.onrender.com/health');
console.log('');
console.log('   # Test OAuth endpoint');
console.log('   curl https://your-render-url.onrender.com/auth/google');

console.log('\n✅ After fixing OAuth:');
console.log('   1. Wait 5-10 minutes for Google changes to propagate');
console.log('   2. Test the OAuth flow in your deployed app');
console.log('   3. Check Render logs for any errors');

console.log('\n🚨 Common Issues:');
console.log('   - URL must match exactly (including https://)');
console.log('   - No trailing slashes in redirect URIs');
console.log('   - Changes can take up to 10 minutes to take effect');
console.log('   - Make sure Render environment variables are set');

console.log('\n📞 Need Help?');
console.log('   - Render Dashboard: https://dashboard.render.com/');
console.log('   - Google Console: https://console.developers.google.com/');
console.log('   - Check deployment logs in Render dashboard');
