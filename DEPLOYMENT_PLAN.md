# 🚀 DEPLOYMENT EXECUTION PLAN

**Target:** Get dashboard LIVE in 2-4 hours
**Method:** Vercel (frontend) + Railway (database) - FASTEST PATH TO REVENUE

---

## ✅ Phase 1: Infrastructure Setup (30 min)

### 1.1 Database (Railway) - 10 min
```bash
# Using Railway CLI or web UI
railway login
railway init
railway add postgresql
# Note the DATABASE_URL
```

### 1.2 Environment Variables - 10 min
```bash
# Generate secrets
openssl rand -base64 32  # NEXTAUTH_SECRET

# Collect:
- DATABASE_URL (from Railway)
- STRIPE_SECRET_KEY (from Stripe dashboard)
- STRIPE_WEBHOOK_SECRET (setup later)
- AWS credentials (existing)
```

### 1.3 Initialize Database - 10 min
```bash
npm install
npx prisma db push
npx prisma db seed  # Create test user
```

---

## ✅ Phase 2: Local Testing (30 min)

### 2.1 Test Build
```bash
npm run build
npm run start
```

### 2.2 Test Features
- [ ] Login works
- [ ] Credit display
- [ ] Chat interface
- [ ] Task creation
- [ ] Mock agent response

---

## ✅ Phase 3: Vercel Deployment (20 min)

### 3.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 3.2 Deploy
```bash
vercel login
vercel --prod
```

### 3.3 Configure Environment Variables in Vercel
- All variables from .env
- Set production values

---

## ✅ Phase 4: Stripe Webhook (15 min)

### 4.1 Configure Webhook Endpoint
- URL: https://dashboard.impacteragi.com/api/webhooks/stripe
- Events: `checkout.session.completed`
- Get webhook secret

### 4.2 Update Vercel
- Add STRIPE_WEBHOOK_SECRET
- Redeploy

---

## ✅ Phase 5: DNS & Domain (30 min)

### 5.1 Add Custom Domain in Vercel
- dashboard.impacteragi.com
- Add DNS records as instructed

### 5.2 Wait for SSL
- Auto-provisioned by Vercel

---

## ✅ Phase 6: Testing End-to-End (45 min)

### 6.1 Create Test Purchase
- Use Stripe test mode
- Buy credits on impacteragi.com
- Verify webhook creates account

### 6.2 Test Dashboard
- Login with credentials
- Create task
- Verify credits deduct
- Check task history

### 6.3 Test Mobile
- Access on phone
- Verify responsive design

---

## ✅ Phase 7: OpenClaw Integration (1-2 hours)

### 7.1 Implement Real Agent Calls
Edit `src/lib/agent-spawner.ts`:

```typescript
async function callOpenClawAgent(
  agentType: string,
  requestText: string
): Promise<AgentResponse> {
  try {
    // Option 1: Direct API call
    const response = await axios.post(`${OPENCLAW_API_URL}/api/spawn`, {
      type: agentType,
      task: requestText,
      userId: 'system',
    }, {
      headers: {
        'Authorization': `Bearer ${OPENCLAW_API_KEY}`,
      },
      timeout: 120000, // 2 min timeout
    })

    return {
      status: 'success',
      result: response.data,
    }

    // Option 2: Route to existing systems
    // if (agentType === 'lead-generation') {
    //   return callNYCScraperAgent(requestText)
    // }

  } catch (error) {
    console.error('OpenClaw API error:', error)
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'API call failed',
    }
  }
}
```

### 7.2 Test Agent Integration
- Try 2-3 task types
- Verify results return correctly
- Check file uploads to S3

---

## ✅ Phase 8: Production Hardening (30 min)

### 8.1 Security
- [ ] Rate limiting enabled
- [ ] CSRF protection verified
- [ ] Input sanitization
- [ ] Authentication working

### 8.2 Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking (Sentry optional)
- [ ] Logs accessible

### 8.3 Performance
- [ ] Build size optimized
- [ ] Images optimized
- [ ] API routes fast (<500ms)

---

## 🎯 Success Checklist

Before calling it DONE:

- [ ] Dashboard accessible at dashboard.impacteragi.com
- [ ] SSL working (https://)
- [ ] User can buy credits and receive email
- [ ] User can login
- [ ] Credits display correctly
- [ ] Chat interface working
- [ ] At least ONE task type works end-to-end
- [ ] Credits deduct properly
- [ ] Task history shows
- [ ] Files download from S3
- [ ] Mobile responsive
- [ ] No critical errors in logs

---

## 📊 Timeline

| Phase | Time | Status |
|-------|------|--------|
| Infrastructure | 30 min | 🔧 |
| Local Testing | 30 min | ⏳ |
| Vercel Deploy | 20 min | ⏳ |
| Stripe Webhook | 15 min | ⏳ |
| DNS/Domain | 30 min | ⏳ |
| E2E Testing | 45 min | ⏳ |
| OpenClaw Integration | 1-2 hrs | ⏳ |
| Production Hardening | 30 min | ⏳ |
| **TOTAL** | **4-5 hrs** | |

---

## 🚨 Blockers to Watch

1. **DNS propagation** - Can take 1-24 hours (use Vercel subdomain first)
2. **AWS SES sandbox** - May need to request production access
3. **Stripe webhook** - Must be exact URL
4. **OpenClaw API** - Need actual endpoint/integration method

---

## 💡 Quick Wins

For MVP, can launch with:
- ✅ Mock agents (already working)
- ✅ Manual credit top-ups (admin panel)
- ✅ Email notifications (SES ready)
- ⏳ Real agents (add incrementally)

**Strategy:** Launch with mock, add real agents one by one, don't wait for all!

---

## 📝 Next Steps

1. **NOW:** Finish npm install, test build locally
2. **NEXT:** Setup Railway database
3. **THEN:** Deploy to Vercel
4. **AFTER:** Configure Stripe webhook
5. **FINALLY:** Add custom domain

**EXECUTE! 🚀**
