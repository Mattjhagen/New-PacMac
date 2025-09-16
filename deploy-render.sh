#!/bin/bash

# Render Deployment Script for PacMac Mobile
echo "🚀 Starting Render deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please ensure Render configuration is set up."
    exit 1
fi

echo "📋 Render Deployment Checklist:"
echo ""
echo "1. ✅ Code is committed and pushed to GitHub"
echo "2. 🔧 Go to https://dashboard.render.com"
echo "3. 🔗 Connect your GitHub repository"
echo "4. ⚙️  Configure build settings:"
echo "   - Build Command: npm install && npx prisma generate && npm run build"
echo "   - Start Command: npm start"
echo "5. 🔑 Add environment variables:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - GITHUB_CLIENT_ID"
echo "   - GITHUB_CLIENT_SECRET"
echo "   - NEXT_PUBLIC_GITHUB_CLIENT_ID"
echo "   - NEXT_PUBLIC_APP_URL"
echo "6. 🚀 Deploy and get your Render URL"
echo "7. 🔗 Update webhook URLs in Stripe, GitHub, and Supabase"
echo ""
echo "📖 For detailed instructions, see: RENDER_DEPLOYMENT_GUIDE.md"
echo ""
echo "🎯 Your app will be available at: https://your-app-name.onrender.com"
echo ""
echo "✅ Ready for Render deployment!"
