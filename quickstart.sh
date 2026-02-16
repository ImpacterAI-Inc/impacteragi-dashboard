#!/bin/bash

# ImpacterAGI Dashboard - Quick Start Script
# This script sets up everything for local development

set -e

echo "🚀 ImpacterAGI Dashboard - Quick Start"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found!"
  echo ""
  echo "Please create .env.local with:"
  echo "  STRIPE_SECRET_KEY=sk_live_..."
  echo "  STRIPE_WEBHOOK_SECRET=whsec_..."
  echo "  JWT_SECRET=\$(openssl rand -hex 32)"
  echo "  NEXT_PUBLIC_APP_URL=https://dashboard.impacteragi.com"
  echo ""
  exit 1
fi

echo "✅ Found .env.local"

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
  echo "❌ Error: AWS credentials not configured!"
  echo ""
  echo "Please configure AWS credentials:"
  echo "  export AWS_ACCESS_KEY_ID=..."
  echo "  export AWS_SECRET_ACCESS_KEY=..."
  echo ""
  exit 1
fi

echo "✅ AWS credentials configured"

# Install dependencies
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo "✅ Dependencies installed"
else
  echo "✅ Dependencies already installed"
fi

# Set up DynamoDB tables
echo "🗄️  Setting up DynamoDB tables..."
node scripts/setup-db.js

# Run build test
echo "🔨 Testing build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed - check npm run build for errors"
  exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start local dev server:"
echo "   npm run dev"
echo ""
echo "2. Test in browser:"
echo "   http://localhost:3000"
echo ""
echo "3. When ready to deploy:"
echo "   ./deploy.sh"
echo ""
echo "4. After deploy, set up Stripe webhook:"
echo "   URL: https://dashboard.impacteragi.com/api/stripe/webhook"
echo "   Event: checkout.session.completed"
echo ""
echo "📚 See DEPLOYMENT.md for full deployment guide"
echo ""
