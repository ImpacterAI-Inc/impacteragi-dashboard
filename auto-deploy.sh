#!/bin/bash

# 🚀 Auto-Deploy Script for ImpacterAGI Dashboard
# This script automates the deployment to Vercel

set -e

echo "============================================"
echo "🚀 ImpacterAGI Dashboard - Auto Deploy"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo ""
echo -e "${BLUE}🔨 Building application...${NC}"
npx prisma generate
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Build successful!${NC}"
echo ""

echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
echo ""

# Deploy (will prompt for login if needed)
vercel --prod --confirm

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Deployment initiated!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo ""
echo "1. Add database (Neon PostgreSQL):"
echo "   - Go to Vercel dashboard → Storage → Create Database"
echo "   - Select Neon PostgreSQL"
echo "   - DATABASE_URL will be added automatically"
echo ""
echo "2. Add environment variables in Vercel dashboard:"
echo "   - NEXTAUTH_SECRET=wo3S12PLQYeQZV5ST1SrGBt63y+/NnzMuWA65/MbsHY="
echo "   - AWS credentials (already in vercel-deploy.env)"
echo "   - STRIPE keys (get from Stripe dashboard)"
echo ""
echo "3. Initialize database:"
echo "   - In Vercel dashboard → Project → Console:"
echo "   - Run: npx prisma db push"
echo "   - Run: npx prisma db seed"
echo ""
echo "4. Test the site:"
echo "   - Login with: test@example.com / password123"
echo "   - Check credit balance"
echo "   - Try chat interface"
echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
