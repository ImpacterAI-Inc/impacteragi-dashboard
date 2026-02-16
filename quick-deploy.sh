#!/bin/bash

# 🚀 Quick Deploy Script - ImpacterAGI Dashboard
# Auto-deploys to Vercel with environment variables

set -e

echo "🚀 ImpacterAGI Dashboard - Quick Deploy"
echo "======================================="
echo ""

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to project
cd "$(dirname "$0")"

echo "✓ Project directory: $(pwd)"
echo ""

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

echo "✓ Vercel authentication confirmed"
echo ""

# Build locally first to verify
echo "🔨 Testing build locally..."
npm run build

if [ $? -eq 0 ]; then
    echo "✓ Build successful!"
else
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

echo ""
echo "📦 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Add Neon Postgres database in Vercel dashboard"
echo "2. Configure environment variables (see DEPLOY_NOW.md)"
echo "3. Setup Stripe webhook"
echo "4. Test the dashboard"
echo "5. Add custom domain: dashboard.impacteragi.com"
echo ""
echo "🎯 Your dashboard is LIVE! 🎉"
