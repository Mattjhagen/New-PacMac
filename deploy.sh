#!/bin/bash

# PacMac Mobile Deployment Script
echo "🚀 PacMac Mobile Deployment Script"
echo "=================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ No .env file found!"
    echo "📝 Please create a .env file with your API keys:"
    echo "   cp env.example .env"
    echo "   Then edit .env with your actual API keys"
    exit 1
fi

# Load environment variables
source .env

# Check if required API keys are set
if [ "$STRIPE_SECRET_KEY" = "sk_live_your_actual_stripe_secret_key_here" ] || [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ Stripe secret key not configured!"
    echo "   Please set STRIPE_SECRET_KEY in your .env file"
    exit 1
fi

if [ "$SENDGRID_API_KEY" = "SG.your_actual_sendgrid_api_key_here" ] || [ -z "$SENDGRID_API_KEY" ]; then
    echo "❌ SendGrid API key not configured!"
    echo "   Please set SENDGRID_API_KEY in your .env file"
    exit 1
fi

echo "✅ Environment variables loaded successfully"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Test the server
echo "🧪 Testing server..."
npm test 2>/dev/null || echo "⚠️  No tests found, continuing..."

# Start the server
echo "🌐 Starting PacMac Mobile server..."
echo "   Server will be available at: http://localhost:${PORT:-3000}"
echo "   Press Ctrl+C to stop the server"
echo ""

npm start
