#!/bin/bash

# Deploy ImpacterAGI Dashboard - Complete Script
# This will guide you through deployment with detailed steps

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════╗"
echo "║                                                  ║"
echo "║   ImpacterAGI Dashboard - Production Deploy     ║"
echo "║                                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if user wants automated or manual deployment
echo -e "${YELLOW}Choose deployment method:${NC}"
echo ""
echo "1) Vercel (Recommended - Fastest, Best for Next.js)"
echo "2) Railway (Easiest - Includes Database)"
echo "3) Render (Budget-Friendly)"
echo "4) Manual instructions only"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
        echo ""
        
        # Check if logged in to Vercel
        if ! vercel whoami &>/dev/null; then
            echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
            echo ""
            echo "Please run: vercel login"
            echo "Then run this script again."
            echo ""
            echo "Or visit: https://vercel.com/dashboard"
            echo "And deploy manually using DEPLOY_MANUAL.md guide"
            exit 0
        fi
        
        echo -e "${GREEN}✅ Logged in to Vercel${NC}"
        echo ""
        
        # Generate Prisma client
        echo -e "${BLUE}📦 Generating Prisma client...${NC}"
        npx prisma generate
        
        # Deploy
        echo -e "${BLUE}🚀 Starting deployment...${NC}"
        echo ""
        vercel --prod --yes
        
        echo ""
        echo -e "${GREEN}✅ Deployed to Vercel!${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Important: Complete these steps in Vercel dashboard:${NC}"
        echo ""
        echo "1. Add Neon PostgreSQL database:"
        echo "   Vercel Dashboard → Storage → Create → Neon"
        echo ""
        echo "2. Add environment variables (see vercel-deploy.env)"
        echo ""
        echo "3. Redeploy after adding variables"
        echo ""
        echo "4. Run in console:"
        echo "   npx prisma db push"
        echo "   npx prisma db seed"
        echo ""
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}🚀 Railway Deployment${NC}"
        echo ""
        echo "Railway requires manual setup via dashboard:"
        echo ""
        echo "1. Go to: https://railway.app/dashboard"
        echo "2. Click 'New Project' → 'Deploy from GitHub'"
        echo "3. Select repository: ImpacterAI-Inc/digitalhuman"
        echo "4. Root: impacteragi-dashboard"
        echo "5. Add PostgreSQL database (in same project)"
        echo "6. Add environment variables (from .env.railway)"
        echo "7. Deploy!"
        echo ""
        echo "See DEPLOY_MANUAL.md for detailed instructions"
        echo ""
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}🚀 Render Deployment${NC}"
        echo ""
        echo "Render configuration file (render.yaml) is ready!"
        echo ""
        echo "1. Go to: https://render.com/dashboard"
        echo "2. Click 'New' → 'Blueprint'"
        echo "3. Connect your GitHub repository"
        echo "4. Select this repository"
        echo "5. Render will detect render.yaml automatically"
        echo "6. Add sensitive environment variables"
        echo "7. Deploy!"
        echo ""
        echo "See DEPLOY_MANUAL.md for detailed instructions"
        echo ""
        ;;
        
    4)
        echo ""
        echo -e "${BLUE}📖 Manual Deployment Instructions${NC}"
        echo ""
        echo "Full instructions are available in:"
        echo "  → DEPLOY_MANUAL.md (step-by-step guide)"
        echo "  → DEPLOYMENT_READY.md (technical details)"
        echo ""
        echo "Quick summary:"
        echo "1. Choose platform (Vercel/Railway/Render)"
        echo "2. Create account and connect GitHub"
        echo "3. Deploy from repository"
        echo "4. Add database"
        echo "5. Set environment variables"
        echo "6. Initialize database with Prisma"
        echo ""
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            Deployment Process Started             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Test credentials after deployment:${NC}"
echo "  Email: test@example.com"
echo "  Password: password123"
echo ""
echo -e "${YELLOW}For help, see: DEPLOY_MANUAL.md${NC}"
echo ""
