# 🚀 MANUAL DEPLOYMENT GUIDE - ImpacterAGI Dashboard

## FASTEST METHOD: Vercel Web Dashboard (5 minutes)

### Step 1: Go to Vercel
1. Open browser: https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import from GitHub: `ImpacterAI-Inc/digitalhuman`
4. Root Directory: `impacteragi-dashboard`
5. Click "Deploy"

### Step 2: While it's deploying, set up Neon database
1. Open: https://neon.tech/
2. Create free account
3. Create new project: "ImpacterAGI"
4. Copy the connection string (looks like: `postgresql://...@...neon.tech/...`)

### Step 3: Add environment variables in Vercel
Go to: Project Settings → Environment Variables

Add these:

```
DATABASE_URL = postgresql://[YOUR_NEON_CONNECTION_STRING]
NEXTAUTH_URL = https://[your-project].vercel.app
NEXTAUTH_SECRET = wo3S12PLQYeQZV5ST1SrGBt63y+/NnzMuWA65/MbsHY=

AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = AKIASRFT6HLQ3B7NC6XW
AWS_SECRET_ACCESS_KEY = np8zV54HipHYTLU706/Jl0ucvqStOyDTFpJg9MsM
AWS_S3_BUCKET = impacteragi-digital-human
AWS_SES_FROM_EMAIL = noreply@impacteragi.com

STRIPE_SECRET_KEY = sk_test_[GET_FROM_STRIPE_DASHBOARD]
STRIPE_WEBHOOK_SECRET = whsec_[WILL_SET_AFTER_WEBHOOK]

OPENCLAW_API_URL = http://localhost:8080
OPENCLAW_API_KEY = development

NEXT_PUBLIC_APP_NAME = ImpacterAGI
NEXT_PUBLIC_APP_URL = https://[your-project].vercel.app
```

### Step 4: Redeploy
- Go to Deployments tab
- Click on latest deployment → "..." → "Redeploy"

### Step 5: Initialize Database
Open Vercel dashboard → Project → Console, run:
```bash
npx prisma db push
npx prisma db seed
```

### Step 6: Test
Visit: https://[your-project].vercel.app

**Login credentials:**
- Email: test@example.com
- Password: password123

---

## ALTERNATIVE: Railway (includes database)

### Step 1: Railway Dashboard
1. Go to: https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose: `ImpacterAI-Inc/digitalhuman`
5. Root directory: `impacteragi-dashboard`

### Step 2: Add PostgreSQL
1. Click "+ New" in your project
2. Select "Database" → "PostgreSQL"
3. Wait for provisioning (~1 min)

### Step 3: Connect Database
Railway automatically connects the database.
The DATABASE_URL is set automatically.

### Step 4: Add other environment variables
In Variables tab, add:

```
NEXTAUTH_URL = https://[your-app].railway.app
NEXTAUTH_SECRET = wo3S12PLQYeQZV5ST1SrGBt63y+/NnzMuWA65/MbsHY=
AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = AKIASRFT6HLQ3B7NC6XW
AWS_SECRET_ACCESS_KEY = np8zV54HipHYTLU706/Jl0ucvqStOyDTFpJg9MsM
AWS_S3_BUCKET = impacteragi-digital-human
AWS_SES_FROM_EMAIL = noreply@impacteragi.com
STRIPE_SECRET_KEY = sk_test_placeholder
OPENCLAW_API_URL = http://localhost:8080
OPENCLAW_API_KEY = development
NEXT_PUBLIC_APP_NAME = ImpacterAGI
```

### Step 5: Deploy
Railway deploys automatically!

### Step 6: Initialize Database
In Railway console:
```bash
npx prisma db push
npx prisma db seed
```

---

## GET STRIPE KEYS

1. Go to: https://dashboard.stripe.com/
2. Login/create account
3. Get test keys:
   - Developers → API Keys
   - Copy "Secret key" (starts with `sk_test_`)
4. For webhook secret:
   - Developers → Webhooks → Add endpoint
   - URL: `https://[your-app-url]/api/webhooks/stripe`
   - Events: Select `checkout.session.completed`
   - Copy signing secret (starts with `whsec_`)

---

## WHAT'S INCLUDED

✅ Full authentication (login/signup)
✅ Credit system (balance tracking, deduction)
✅ Stripe payment integration
✅ Chat interface with AI
✅ Task management
✅ Database schema ready
✅ API routes for everything
✅ Responsive UI

---

## TEST ACCOUNTS (after seed)

**Regular User:**
- Email: test@example.com
- Password: password123
- Credits: 1000

**Admin:**
- Email: manny@impacteragi.com
- Password: ImpacterAGI2026!Admin
- Credits: 10000

---

## TROUBLESHOOTING

**Build fails?**
- Check all environment variables are set
- Ensure DATABASE_URL is valid

**Database connection fails?**
- Run `npx prisma db push` in console
- Check DATABASE_URL format

**Login doesn't work?**
- Run database seed: `npx prisma db seed`
- Check NEXTAUTH_SECRET is set

**Stripe not working?**
- Update STRIPE_SECRET_KEY with real key
- Set up webhook with correct URL
- Update STRIPE_WEBHOOK_SECRET

---

## TOTAL TIME: 15-20 MINUTES

That's it! You'll have a fully functional dashboard with:
- Customer login
- Credit purchase via Stripe
- AI chat interface
- Credit tracking and deduction
- Professional UI

🎉 **READY TO GO!**
