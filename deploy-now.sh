#!/bin/bash
set -e

echo "🚀 Deploying ImpacterAGI Dashboard to Cloudflare Pages..."

# Check if build exists
if [ ! -d ".next" ]; then
    echo "📦 Building Next.js app first..."
    npm run build
fi

echo "☁️  Deploying to Cloudflare Pages..."
echo "This will create a new Pages project: impacteragi-dashboard"

# Deploy using npx wrangler pages deploy
npx wrangler pages deploy .next --project-name=impacteragi-dashboard --branch=main

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Go to https://dash.cloudflare.com → Pages"
echo "2. Find 'impacteragi-dashboard' project"
echo "3. Go to Settings → Custom domains"
echo "4. Add: dashboard.impacteragi.com"
echo "5. Test the deployment!"
