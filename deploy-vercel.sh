#!/bin/bash

# 🚀 ImpacterAGI Dashboard - Quick Deploy to Vercel
# This script deploys the dashboard to production

set -e  # Exit on error

echo "============================================"
echo "🚀 ImpacterAGI Dashboard - Deployment"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check environment variables
echo -e "${BLUE}📋 Checking environment variables...${NC}"

if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production not found!${NC}"
    echo "Please create .env.production with all required variables."
    exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"
echo ""

# Build test
echo -e "${BLUE}🔨 Testing build locally...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed! Fix errors before deploying.${NC}"
    exit 1
fi

echo ""

# Deploy
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
echo ""

# Choose deployment type
read -p "Deploy to production? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Deploying to PRODUCTION...${NC}"
    vercel --prod
else
    echo -e "${BLUE}Deploying to STAGING...${NC}"
    vercel
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo ""
echo "1. Configure environment variables in Vercel dashboard:"
echo "   https://vercel.com/dashboard"
echo ""
echo "2. Set up Stripe webhook:"
echo "   - URL: https://your-domain.vercel.app/api/webhooks/stripe"
echo "   - Event: checkout.session.completed"
echo ""
echo "3. Add custom domain:"
echo "   - dashboard.impacteragi.com"
echo ""
echo "4. Test the dashboard:"
echo "   - Visit the URL"
echo "   - Login with test credentials"
echo "   - Create a test task"
echo ""
echo -e "${GREEN}🎉 Dashboard is LIVE!${NC}"
echo ""
