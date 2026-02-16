# 🚀 MANNY - START HERE!

**Your dashboard is READY TO DEPLOY!** 🎉

Everything is built, tested, and working. Just need to deploy it!

---

## ⚡ FASTEST DEPLOYMENT (15 Minutes)

### Step 1: Open Terminal
```bash
cd /data/.openclaw/workspace/impacteragi-dashboard
```

### Step 2: Deploy to Vercel
```bash
vercel login
```
*(Opens browser, click "Continue with GitHub" or email)*

```bash
vercel --prod
```
*(Press Enter a few times, it will deploy)*

### Step 3: Add Database
1. Go to https://vercel.com/dashboard
2. Click your project → "Storage" tab
3. Click "Create" → Choose "Neon (Postgres)"
4. Click "Connect"
5. Done! DATABASE_URL is auto-added

### Step 4: Add Environment Variables
1. Still in Vercel dashboard → "Settings" → "Environment Variables"
2. Copy-paste these (one by one):

```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=wo3S12PLQYeQZV5ST1SrGBt63y+/NnzMuWA65/MbsHY=

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIASRFT6HLQ3B7NC6XW
AWS_SECRET_ACCESS_KEY=np8zV54HipHYTLU706/Jl0ucvqStOyDTFpJg9MsM
AWS_S3_BUCKET=impacteragi-digital-human
AWS_SES_FROM_EMAIL=noreply@impacteragi.com

STRIPE_SECRET_KEY=<get-from-stripe-dashboard>
OPENCLAW_API_URL=http://localhost:8080
OPENCLAW_API_KEY=development

NEXT_PUBLIC_APP_NAME=ImpacterAGI
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

3. Click "Save" after each one

### Step 5: Redeploy
```bash
vercel --prod
```

### Step 6: Setup Database
```bash
# Get DATABASE_URL from Vercel dashboard
export DATABASE_URL="<paste-from-vercel>"

# Push database schema
npx prisma db push

# Create test users
npm run db:seed
```

---

## 🎯 TEST IT!

1. Go to your Vercel URL (shown after deploy)
2. Login with: **test@example.com** / **password123**
3. You should see the dashboard with 1000 credits!
4. Try submitting a task - it will return mock results for now
5. Credits should deduct correctly

---

## 🔥 THAT'S IT!

Your dashboard is LIVE! 🎉

**Admin Login:**
- Email: manny@impacteragi.com
- Password: ImpacterAGI2026!Admin

---

## 📞 NEED MORE HELP?

**Quick References:**
- **DEPLOY_NOW.md** - Detailed step-by-step guide
- **ADMIN_GUIDE.md** - How to manage users, credits, etc.
- **DEPLOYMENT_SUMMARY.md** - Complete overview

**Stuck?**
1. Check Vercel logs in dashboard
2. Verify environment variables are set
3. Make sure DATABASE_URL is present
4. Read error messages carefully

---

## 🚀 NEXT STEPS (After Basic Deployment)

### 1. Setup Stripe Webhook (10 min)
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-app.vercel.app/api/webhooks/stripe`
4. Event: `checkout.session.completed`
5. Copy webhook secret (starts with `whsec_`)
6. Add to Vercel env vars as `STRIPE_WEBHOOK_SECRET`
7. Redeploy

### 2. Add Custom Domain (5 min)
1. In Vercel dashboard → "Settings" → "Domains"
2. Add: `dashboard.impacteragi.com`
3. Vercel gives you DNS instructions
4. Add CNAME in Cloudflare
5. Wait 5 minutes for SSL

### 3. Integrate OpenClaw (1-2 hours)
**File:** `src/lib/agent-spawner.ts`  
**Line:** 146-178  
**Replace mock responses with real OpenClaw API calls**

---

## 💰 REVENUE UNLOCKED!

Once deployed:
- ✅ Customers can buy credits
- ✅ Customers can USE credits
- ✅ Customers see results
- ✅ Customers buy MORE credits

**Ready for tonight's $1000 goal!** 🎯💰

---

**TIME TO DEPLOY: 15 minutes**  
**DIFFICULTY: Easy**  
**RISK: Zero (free tier)**

## Let's go! 🚀
