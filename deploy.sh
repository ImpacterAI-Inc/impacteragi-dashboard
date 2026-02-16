#!/bin/bash

# Deploy to Cloudflare Pages
# This script builds and deploys the app

echo "🚀 Deploying ImpacterAGI Dashboard to Cloudflare Pages..."

# Build the app
echo "📦 Building Next.js app..."
npm run build

# Deploy using Wrangler
echo "☁️  Deploying to Cloudflare..."
npx wrangler pages deploy .next --project-name=impacteragi-dashboard

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set up Stripe webhook: https://dashboard.impacteragi.com/api/stripe/webhook"
echo "2. Add webhook secret to Cloudflare Pages environment variables"
echo "3. Test payment flow"
