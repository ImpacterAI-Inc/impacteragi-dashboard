# 🚀 DEPLOYMENT EXECUTION GUIDE

**Status:** Ready to deploy  
**Method:** Vercel + Railway Database  
**Time to Live:** 2-4 hours

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Infrastructure Accounts Needed
- [ ] Vercel account (free) - https://vercel.com/signup
- [ ] Railway account (free tier sufficient) - https://railway.app
- [ ] Stripe account (existing)
- [ ] AWS account (existing - for S3 & SES)

### 2. Domain Access
- [ ] Access to impacteragi.com DNS settings
- [ ] Ability to add CNAME record for dashboard.impacteragi.com

### 3. Credentials Needed
- [ ] Stripe Live Secret Key (sk_live_...)
- [ ] AWS Access Key ID
- [ ] AWS Secret Access Key
- [ ] S3 Bucket name (existing: impacteragi-digital-human)
- [ ] SES From Email (existing: noreply@impacteragi.com)

---

## 📋 STEP-BY-STEP DEPLOYMENT

### PHASE 1: Database Setup (15 minutes)

#### Option A: Railway (RECOMMENDED - Easiest)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Create new project
railway init

# 4. Add PostgreSQL
railway add --database postgres

# 5. Get DATABASE_URL
railway variables
# Copy the DATABASE_URL value
```

#### Option B: Supabase (Also Easy)

1. Go to https://supabase.com
2. Create new project
3. Wait for database to provision (~2 min)
4. Go to Settings → Database
5. Copy "Connection String" (URI mode)

#### Option C: AWS RDS (Production-grade)

```bash
# Create PostgreSQL instance in AWS Console
# Instance class: db.t3.micro (free tier eligible)
# Storage: 20 GB
# Public access: Yes
# Security group: Allow 5432 from 0.0.0.0/0
# Note the endpoint and credentials
# DATABASE_URL format:
# postgresql://username:password@endpoint:5432/database_name
```

**Save DATABASE_URL for next step!**

---

### PHASE 2: Environment Variables (10 minutes)

Create `.env.local` for testing:

```bash
# Copy production template
cp .env.production .env.local

# Edit with real values
nano .env.local
```

**Required values to update:**

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"  # From Phase 1
NEXTAUTH_SECRET="wo3S12PLQYeQZV5ST1SrGBt63y+/NnzMuWA65/MbsHY="  # Already generated
STRIPE_SECRET_KEY="sk_live_51S21n0..."  # From Stripe Dashboard
AWS_ACCESS_KEY_ID="AKIA..."  # From AWS IAM
AWS_SECRET_ACCESS_KEY="..."  # From AWS IAM
```

---

### PHASE 3: Database Initialization (5 minutes)

```bash
# Install dependencies (if not done)
npm install

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed test data
npm run db:seed

# Verify in Prisma Studio (optional)
npx prisma studio
# Visit http://localhost:5555 to see data
```

You should see:
- ✅ 2 users created (test@example.com, manny@impacteragi.com)
- ✅ 1 sample task
- ✅ 1 sample transaction

---

### PHASE 4: Local Testing (15 minutes)

```bash
# Test build
npm run build

# If build succeeds, start dev server
npm run dev

# Visit http://localhost:3000
```

**Test checklist:**
- [ ] Homepage loads
- [ ] Can navigate to /login
- [ ] Can login with test@example.com / password123
- [ ] Dashboard shows credit balance (1000)
- [ ] Chat interface appears
- [ ] Can type message
- [ ] Can submit task (should create with mock response)
- [ ] Task appears in history
- [ ] Can logout

**If any test fails, fix before proceeding!**

---

### PHASE 5: Vercel Deployment (15 minutes)

#### First Time Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
# Follow prompts in browser

# Link project (first deployment)
vercel link
# Choose: Create new project
# Name: impacteragi-dashboard

# Set environment variables in Vercel
# Go to: https://vercel.com/dashboard
# Select project → Settings → Environment Variables
# Add ALL variables from .env.production
```

**Add these environment variables in Vercel dashboard:**

```
DATABASE_URL = postgresql://...
NEXTAUTH_SECRET = wo3S12PLQYeQZV5ST1SrGBt63y+/NnzMuWA65/MbsHY=
NEXTAUTH_URL = https://impacteragi-dashboard.vercel.app (initial)
STRIPE_SECRET_KEY = sk_live_...
AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = AKIA...
AWS_SECRET_ACCESS_KEY = ...
AWS_S3_BUCKET = impacteragi-digital-human
AWS_SES_FROM_EMAIL = noreply@impacteragi.com
OPENCLAW_API_URL = http://localhost:8080 (placeholder)
OPENCLAW_API_KEY = placeholder
NEXT_PUBLIC_APP_NAME = ImpacterAGI
NEXT_PUBLIC_APP_URL = https://impacteragi-dashboard.vercel.app (initial)
```

#### Deploy to Staging

```bash
# Deploy to preview URL first
vercel

# Wait for deployment (~2 min)
# You'll get: https://impacteragi-dashboard-xyz123.vercel.app
```

**Test staging deployment:**
- Visit the preview URL
- Login with test credentials
- Create a test task
- Verify everything works

---

### PHASE 6: Stripe Webhook (10 minutes)

```bash
# 1. Go to Stripe Dashboard
# 2. Developers → Webhooks → Add endpoint
# 3. Endpoint URL: https://your-vercel-url.vercel.app/api/webhooks/stripe
# 4. Events to send: 
#    - checkout.session.completed
# 5. Add endpoint
# 6. Copy "Signing secret" (whsec_...)
```

**Update Vercel environment variable:**
```
STRIPE_WEBHOOK_SECRET = whsec_...
```

**Test webhook:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # Mac
# OR
scoop install stripe  # Windows

# Login
stripe login

# Test webhook locally first
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test event
stripe trigger checkout.session.completed
```

If successful, you'll see log output showing account creation.

---

### PHASE 7: Custom Domain (30 minutes)

#### In Vercel Dashboard:

1. Go to project → Settings → Domains
2. Add domain: `dashboard.impacteragi.com`
3. Vercel will show DNS records to add

#### In Your DNS Provider (for impacteragi.com):

Add CNAME record:
```
Type: CNAME
Name: dashboard
Value: cname.vercel-dns.com
TTL: 300 (or Auto)
```

**Wait for DNS propagation (5-30 minutes)**

Check status:
```bash
dig dashboard.impacteragi.com
# Should show CNAME to vercel-dns.com
```

#### Update Environment Variables:

Once domain is verified, update in Vercel:
```
NEXTAUTH_URL = https://dashboard.impacteragi.com
NEXT_PUBLIC_APP_URL = https://dashboard.impacteragi.com
```

**Redeploy:**
```bash
vercel --prod
```

**Update Stripe webhook URL to use custom domain:**
- https://dashboard.impacteragi.com/api/webhooks/stripe

---

### PHASE 8: Production Deployment (5 minutes)

```bash
# Deploy to production
vercel --prod

# Wait for deployment
# Your dashboard is now live at:
# https://dashboard.impacteragi.com
```

---

### PHASE 9: End-to-End Testing (30 minutes)

#### Test Complete User Flow:

1. **Purchase Flow Test:**
   ```bash
   # Go to impacteragi.com
   # Click "Buy Credits"
   # Use Stripe test card: 4242 4242 4242 4242
   # Complete purchase
   ```

2. **Check webhook:**
   - Verify Stripe webhook received (check Stripe Dashboard → Webhooks → Logs)
   - Check database: Did user account get created?
   ```bash
   npx prisma studio
   # Check Users table
   ```

3. **Email Test:**
   - Did welcome email send? (Check AWS SES sending statistics)
   - Did email contain login credentials?

4. **Login Test:**
   - Go to dashboard.impacteragi.com
   - Login with credentials from email
   - Verify credit balance shows

5. **Task Test:**
   - Type: "Find me 10 leads in Miami"
   - Submit
   - Wait for response (~30 sec with mock)
   - Verify:
     - Task appears as "completed"
     - Credits deducted
     - Result shows in chat
     - Task appears in history

6. **Mobile Test:**
   - Access dashboard on phone
   - Verify responsive design
   - Test chat interface
   - Test task submission

7. **Error Handling Test:**
   - Try to submit task with 0 credits
   - Should show error message
   - Try invalid login
   - Should show error

---

### PHASE 10: OpenClaw Integration (1-2 hours)

Edit `src/lib/agent-spawner.ts`:

```typescript
async function callOpenClawAgent(
  agentType: string,
  requestText: string
): Promise<AgentResponse> {
  try {
    console.log(`Calling OpenClaw agent: ${agentType}`)
    console.log(`Request: ${requestText}`)

    // IMPLEMENT REAL API CALL HERE
    const response = await axios.post(`${OPENCLAW_API_URL}/api/spawn`, {
      type: agentType,
      task: requestText,
      priority: 'normal',
    }, {
      headers: {
        'Authorization': `Bearer ${OPENCLAW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 2 minutes
    })

    // Handle response based on your OpenClaw API format
    return {
      status: 'success',
      result: response.data.result,
      fileData: response.data.fileData ? Buffer.from(response.data.fileData, 'base64') : undefined,
      fileName: response.data.fileName,
    }

  } catch (error) {
    console.error('OpenClaw API error:', error)
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'API call failed',
    }
  }
}
```

**Test integration:**
```bash
# Run locally first
npm run dev

# Submit real task
# Monitor logs
# Verify result appears correctly
```

**Deploy updated code:**
```bash
vercel --prod
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

### Functionality:
- [ ] Dashboard accessible at dashboard.impacteragi.com
- [ ] SSL certificate active (https://)
- [ ] User can purchase credits on impacteragi.com
- [ ] Stripe webhook creates account automatically
- [ ] Welcome email sends with credentials
- [ ] User can login with credentials
- [ ] Credit balance displays correctly
- [ ] Chat interface works
- [ ] User can submit task
- [ ] Task processes (mock or real)
- [ ] Result appears in chat
- [ ] Credits deduct correctly
- [ ] Task appears in history
- [ ] Mobile responsive
- [ ] Error messages clear and helpful

### Security:
- [ ] HTTPS enabled
- [ ] Environment variables secure (not exposed)
- [ ] CSRF protection active
- [ ] Rate limiting configured (optional but recommended)
- [ ] Database password strong
- [ ] API keys rotated if needed

### Monitoring:
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (optional: Sentry)
- [ ] Logs accessible in Vercel dashboard
- [ ] Database monitoring active
- [ ] Stripe webhook logs checked

### Documentation:
- [ ] Deployment documented
- [ ] Environment variables documented
- [ ] Integration guide created
- [ ] Admin credentials secure
- [ ] Backup strategy defined

---

## 🐛 TROUBLESHOOTING

### Build Fails

**Error: "Module not found"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: "Prisma Client not generated"**
```bash
npx prisma generate
```

**Error: TypeScript errors**
```bash
# Check tsconfig.json
# Verify all files have correct types
npm run lint
```

### Database Connection Fails

**Error: "Can't reach database server"**
- Check DATABASE_URL format
- Verify database is running
- Check firewall rules (allow 5432)
- Test connection: `psql $DATABASE_URL`

**Error: "Authentication failed"**
- Verify username/password in DATABASE_URL
- Check if database user exists
- Reset password if needed

### Stripe Webhook Not Working

**Check webhook logs in Stripe Dashboard:**
- Go to Developers → Webhooks → Your endpoint
- Check recent deliveries
- Look for errors

**Common issues:**
- Wrong endpoint URL
- Webhook secret mismatch
- API down during webhook call
- Database connection failed

**Test locally:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

### Login Not Working

**Error: "Invalid credentials"**
- Verify user exists in database (check with Prisma Studio)
- Test with known credentials: test@example.com / password123
- Check password hashing (bcrypt)

**Error: "Session error"**
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches actual URL
- Clear browser cookies and try again

### Credits Not Deducting

**Check:**
- Task status (should be "completed")
- Transaction record created
- User credits balance updated
- Logs for errors

**Debug:**
```bash
# Check Vercel logs
vercel logs

# Or in Vercel dashboard: Deployments → View Function Logs
```

### Agent Not Responding

**If using mock (initial deployment):**
- Should work out of the box
- Check `agent-spawner.ts` returns mock data

**If integrated with OpenClaw:**
- Check OPENCLAW_API_URL is correct
- Verify OPENCLAW_API_KEY is valid
- Test API endpoint separately
- Check timeouts (default 2 min)
- Monitor agent logs

---

## 📊 MONITORING & MAINTENANCE

### Daily Checks (Automated):

**Vercel Dashboard:**
- Deployment status
- Error rate
- Response times
- Usage stats

**Stripe Dashboard:**
- Webhook deliveries
- Payment success rate
- Failed charges

**Database:**
- Connection count
- Storage usage
- Query performance

### Weekly Tasks:

- Review error logs
- Check user feedback
- Monitor credit usage patterns
- Review agent performance
- Update documentation

### Monthly Tasks:

- Review and optimize costs
- Update dependencies (`npm update`)
- Database backup verification
- Security audit
- Performance optimization

---

## 🎉 SUCCESS!

**Your ImpacterAGI Consumer Dashboard is LIVE!**

**Next Steps:**

1. **Marketing:** Announce launch to customers
2. **Support:** Monitor first users closely
3. **Iterate:** Add features based on feedback
4. **Scale:** Add more agent types
5. **Optimize:** Improve based on usage data

**Key URLs:**

- Dashboard: https://dashboard.impacteragi.com
- Vercel: https://vercel.com/dashboard
- Railway: https://railway.app
- Stripe: https://dashboard.stripe.com
- Prisma Studio: `npx prisma studio`

**Test Credentials:**

- Email: test@example.com
- Password: password123
- Credits: 1000

**Admin Credentials:**

- Email: manny@impacteragi.com
- Password: ImpacterAGI2026!Admin
- Credits: 10000

---

## 📞 NEED HELP?

**Check these first:**
1. Vercel deployment logs
2. Stripe webhook logs
3. Database connection (Prisma Studio)
4. Browser console errors
5. This deployment guide

**Still stuck?**
- Review ARCHITECTURE.md
- Check OPENCLAW-INTEGRATION.md
- Review error logs in detail
- Test each component separately

**Remember:** 95% of issues are environment variables or database connections!

---

**🚀 REVENUE UNBLOCKED! Let's ship it! 💰**
