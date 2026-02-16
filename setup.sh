#!/bin/bash

# Quick Setup Script for Local Development
# Run this after cloning the repo

set -e

echo "🚀 Setting up ImpacterAGI Dashboard for local development..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if PostgreSQL is available
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your credentials:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - Stripe keys"
    echo "   - AWS credentials"
    echo "   - OpenClaw API URL and key"
    echo ""
    read -p "Press Enter when you've updated .env..."
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=\"postgresql://" .env 2>/dev/null; then
    echo "⚠️  DATABASE_URL not configured in .env"
    echo ""
    echo "Quick PostgreSQL setup options:"
    echo ""
    echo "Option 1: Local PostgreSQL"
    echo "  brew install postgresql (Mac)"
    echo "  sudo apt install postgresql (Linux)"
    echo "  createdb impacteragi"
    echo "  DATABASE_URL=\"postgresql://localhost:5432/impacteragi\""
    echo ""
    echo "Option 2: Docker PostgreSQL"
    echo "  docker run --name impacteragi-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=impacteragi -p 5432:5432 -d postgres:15"
    echo "  DATABASE_URL=\"postgresql://postgres:password@localhost:5432/impacteragi\""
    echo ""
    echo "Option 3: Cloud (Recommended for production)"
    echo "  AWS RDS, Heroku Postgres, Railway, etc."
    echo ""
    read -p "Press Enter when database is ready..."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# Push database schema
echo "🗄️  Setting up database schema..."
npx prisma db push
echo "✅ Database schema created"
echo ""

# Create a test user
echo "👤 Creating test user..."
cat > create-test-user.js << 'EOF'
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'test@example.com'
  const password = 'password123'
  
  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } })
  
  if (existing) {
    console.log('Test user already exists:', email)
    return
  }
  
  // Create user
  const passwordHash = await bcrypt.hash(password, 10)
  
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      creditsBalance: 1000, // Start with 1000 test credits
    },
  })
  
  console.log('✅ Test user created!')
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('Credits: 1000')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
EOF

node create-test-user.js
rm create-test-user.js
echo ""

# All done!
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Open http://localhost:3000"
echo ""
echo "3. Login with:"
echo "   Email: test@example.com"
echo "   Password: password123"
echo ""
echo "4. Try asking: 'Find me 10 leads in Miami'"
echo ""
echo "⚠️  Remember to integrate OpenClaw API in src/lib/agent-spawner.ts"
echo ""
echo "📚 See OPENCLAW-INTEGRATION.md for integration guide"
echo ""
