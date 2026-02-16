#!/bin/bash

# 🚀 ImpacterAGI Dashboard - Complete Deployment Script
# This script handles the ENTIRE deployment from start to finish

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}"
echo "================================================================"
echo "🚀 ImpacterAGI Consumer Dashboard - Full Deployment"
echo "================================================================"
echo -e "${NC}"
echo ""
echo -e "${YELLOW}This script will:${NC}"
echo "  1. Check prerequisites"
echo "  2. Setup database (Railway)"
echo "  3. Configure environment variables"
echo "  4. Initialize database with Prisma"
echo "  5. Test build locally"
echo "  6. Deploy to Vercel"
echo "  7. Guide you through post-deployment steps"
echo ""
read -p "Ready to proceed? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}PHASE 1: Prerequisites Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Found $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found!${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ Found v$NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found!${NC}"
    exit 1
fi

# Check if Railway CLI is installed
echo -n "Checking Railway CLI... "
if command -v railway &> /dev/null; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${YELLOW}⚠ Not found. Installing...${NC}"
    npm install -g @railway/cli
    echo -e "${GREEN}✓ Installed${NC}"
fi

# Check if Vercel CLI is installed
echo -n "Checking Vercel CLI... "
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${YELLOW}⚠ Not found. Installing...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✓ Installed${NC}"
fi

echo ""
echo -e "${GREEN}✓ All prerequisites met!${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}PHASE 2: Database Setup (Railway)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}Option 1: Railway (Recommended - Easiest)${NC}"
echo -e "${YELLOW}Option 2: Supabase (Also easy)${NC}"
echo -e "${YELLOW}Option 3: AWS RDS (Most control)${NC}"
echo -e "${YELLOW}Option 4: I already have a DATABASE_URL${NC}"
echo ""
read -p "Choose option (1-4): " -n 1 -r DB_OPTION
echo ""

DATABASE_URL=""

if [[ $DB_OPTION == "1" ]]; then
    echo ""
    echo "Setting up Railway PostgreSQL..."
    echo ""
    echo "1. Login to Railway (browser will open)"
    railway login
    
    echo ""
    echo "2. Initialize Railway project"
    railway init
    
    echo ""
    echo "3. Adding PostgreSQL database..."
    railway add postgres
    
    echo ""
    echo "4. Getting DATABASE_URL..."
    echo ""
    DATABASE_URL=$(railway variables | grep DATABASE_URL | cut -d'=' -f2-)
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}✗ Could not get DATABASE_URL automatically${NC}"
        echo "Please run: railway variables"
        echo "Then copy the DATABASE_URL value"
        read -p "Paste DATABASE_URL here: " DATABASE_URL
    else
        echo -e "${GREEN}✓ Got DATABASE_URL${NC}"
    fi
    
elif [[ $DB_OPTION == "2" ]]; then
    echo ""
    echo -e "${YELLOW}Setup Supabase:${NC}"
    echo "1. Go to https://supabase.com"
    echo "2. Create new project"
    echo "3. Wait for database to provision"
    echo "4. Go to Settings → Database"
    echo "5. Copy 'Connection String' (URI mode)"
    echo ""
    read -p "Paste DATABASE_URL here: " DATABASE_URL
    
elif [[ $DB_OPTION == "3" ]]; then
    echo ""
    echo -e "${YELLOW}Setup AWS RDS:${NC}"
    echo "1. Create PostgreSQL instance in AWS Console"
    echo "2. Instance: db.t3.micro (free tier)"
    echo "3. Enable public access"
    echo "4. Configure security group (allow 5432)"
    echo "5. Format: postgresql://user:pass@endpoint:5432/dbname"
    echo ""
    read -p "Paste DATABASE_URL here: " DATABASE_URL
    
else
    echo ""
    read -p "Paste your DATABASE_URL here: " DATABASE_URL
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}✗ DATABASE_URL is required!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Database configured!${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}PHASE 3: Environment Variables${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Creating .env.local for testing..."
echo ""

# Create .env.local
cat > .env.local <<EOF
# Database
DATABASE_URL="$DATABASE_URL"

# NextAuth (already generated)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="wo3S12PLQYeQZV5ST1SrGBt63y+/NnzMuWA65/MbsHY="

# Stripe (you'll need to update these)
STRIPE_SECRET_KEY="sk_test_placeholder"
STRIPE_WEBHOOK_SECRET="whsec_placeholder"

# AWS
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="placeholder"
AWS_SECRET_ACCESS_KEY="placeholder"
AWS_S3_BUCKET="impacteragi-digital-human"
AWS_SES_FROM_EMAIL="noreply@impacteragi.com"

# OpenClaw
OPENCLAW_API_URL="http://localhost:8080"
OPENCLAW_API_KEY="placeholder"

# App Config
NEXT_PUBLIC_APP_NAME="ImpacterAGI"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF

echo -e "${GREEN}✓ Created .env.local${NC}"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT: Update these values in .env.local:${NC}"
echo "  - STRIPE_SECRET_KEY (from Stripe dashboard)"
echo "  - AWS_ACCESS_KEY_ID (from AWS IAM)"
echo "  - AWS_SECRET_ACCESS_KEY (from AWS IAM)"
echo ""
read -p "Press Enter after you've updated .env.local..."
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}PHASE 4: Database Initialization${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Installing dependencies..."
npm install --quiet

echo ""
echo "Pushing database schema..."
npx prisma db push

echo ""
echo "Generating Prisma client..."
npx prisma generate

echo ""
echo "Seeding test data..."
npm run db:seed

echo ""
echo -e "${GREEN}✓ Database initialized!${NC}"
echo ""
echo "Test credentials created:"
echo "  Email: test@example.com"
echo "  Password: password123"
echo "  Credits: 1000"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}PHASE 5: Local Build Test${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Build successful!${NC}"
else
    echo ""
    echo -e "${RED}✗ Build failed!${NC}"
    echo "Please fix errors before deploying."
    exit 1
fi

echo ""
read -p "Start local dev server to test? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}Starting dev server...${NC}"
    echo ""
    echo "Visit: http://localhost:3000"
    echo "Login with: test@example.com / password123"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop when ready to deploy${NC}"
    echo ""
    npm run dev
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}PHASE 6: Vercel Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "1. Login to Vercel (browser will open)"
vercel login

echo ""
echo "2. Deploying to Vercel..."
echo ""

read -p "Deploy to production? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Deploying to PRODUCTION...${NC}"
    vercel --prod
else
    echo ""
    echo -e "${BLUE}Deploying to STAGING...${NC}"
    vercel
fi

echo ""
echo -e "${GREEN}✓ Deployed to Vercel!${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}PHASE 7: Post-Deployment Steps${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
echo ""
echo "1. ${BOLD}Configure Environment Variables in Vercel:${NC}"
echo "   https://vercel.com/dashboard"
echo "   → Your Project → Settings → Environment Variables"
echo ""
echo "   Add these from .env.production:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL (use your Vercel URL)"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_WEBHOOK_SECRET (get after webhook setup)"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - AWS_S3_BUCKET"
echo "   - AWS_SES_FROM_EMAIL"
echo "   - OPENCLAW_API_URL"
echo "   - OPENCLAW_API_KEY"
echo ""
echo "2. ${BOLD}Setup Stripe Webhook:${NC}"
echo "   https://dashboard.stripe.com/webhooks"
echo "   - Add endpoint: https://your-vercel-url/api/webhooks/stripe"
echo "   - Select event: checkout.session.completed"
echo "   - Copy webhook secret and add to Vercel env vars"
echo ""
echo "3. ${BOLD}Add Custom Domain (Optional):${NC}"
echo "   Vercel Dashboard → Domains"
echo "   - Add: dashboard.impacteragi.com"
echo "   - Configure DNS: CNAME → cname.vercel-dns.com"
echo ""
echo "4. ${BOLD}Test End-to-End:${NC}"
echo "   - Buy credits on impacteragi.com (test mode)"
echo "   - Check if account created"
echo "   - Login to dashboard"
echo "   - Submit a task"
echo "   - Verify result appears"
echo ""
echo "5. ${BOLD}OpenClaw Integration:${NC}"
echo "   Edit: src/lib/agent-spawner.ts"
echo "   Replace mock implementation with real API calls"
echo "   See: OPENCLAW-INTEGRATION.md"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}Your dashboard is deployed! 🎉${NC}"
echo ""
echo "Next: Complete the post-deployment steps above"
echo ""
echo "Documentation:"
echo "  - DEPLOYMENT_READY.md - Full status report"
echo "  - DEPLOYMENT_EXECUTION.md - Detailed guide"
echo "  - QUICK_REFERENCE.md - Command cheat sheet"
echo ""
echo -e "${YELLOW}💰 REVENUE UNBLOCKED! Now configure and test! 🚀${NC}"
echo ""
