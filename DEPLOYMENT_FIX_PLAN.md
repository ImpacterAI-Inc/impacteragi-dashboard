# Dashboard.impacteragi.com Deployment Fix Plan

## Current Situation

**Problem:** DNS points to Cloudflare (104.21.55.113) but returns HTTP 521 (Web Server Down)

**Analysis:**
- ✅ Domain: dashboard.impacteragi.com is in Cloudflare DNS
- ✅ App: Next.js dashboard is built and ready (.next/ directory)
- ✅ Credentials: Have Cloudflare login (manny@impacteragi.com / koKing2028$)
- ❌ Issue: No origin server configured (Pages project not set up)

## Solution: Deploy to Cloudflare Pages

**Best Approach:** Deploy the built Next.js app to Cloudflare Pages and link custom domain.

## Step-by-Step Execution Plan

### Phase 1: Get Cloudflare API Token (5 minutes)

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Login: manny@impacteragi.com / koKing2028$
3. Click "Create Token"
4. Use template: "Edit Cloudflare Workers"
5. Permissions needed:
   - Account > Cloudflare Pages > Edit
   - Zone > Zone > Read (for DNS)
6. Copy the token (starts with: `...`)
7. Save it securely

### Phase 2: Deploy Dashboard (2 minutes)

```bash
cd /data/.openclaw/workspace/impacteragi-dashboard

# Set API token
export CLOUDFLARE_API_TOKEN="your-token-here"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"

# Deploy
npx wrangler pages deploy .next \
  --project-name=impacteragi-dashboard \
  --branch=main
```

### Phase 3: Connect Custom Domain (3 minutes)

1. Go to: https://dash.cloudflare.com
2. Navigate to: Workers & Pages → impacteragi-dashboard
3. Go to: Settings → Custom domains
4. Click "Add custom domain"
5. Enter: dashboard.impacteragi.com
6. Click "Activate domain"
7. Cloudflare will automatically configure DNS

### Phase 4: Add Environment Variables (5 minutes)

In Cloudflare Pages dashboard → Settings → Environment variables:

```env
STRIPE_SECRET_KEY=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
JWT_SECRET=<generate-new-32-char-hex>
NEXT_PUBLIC_APP_URL=https://dashboard.impacteragi.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<from-aws>
AWS_SECRET_ACCESS_KEY=<from-aws>
```

### Phase 5: Set Up Stripe Webhook (5 minutes)

1. Go to: https://dashboard.stripe.com/webhooks
2. Add endpoint: https://dashboard.impacteragi.com/api/stripe/webhook
3. Events: `checkout.session.completed`
4. Copy webhook secret
5. Add to Cloudflare Pages environment: `STRIPE_WEBHOOK_SECRET`
6. Redeploy (Settings → Deployments → Retry deployment)

### Phase 6: Verification (5 minutes)

```bash
# Test DNS
curl -I https://dashboard.impacteragi.com

# Should return 200 OK, not 521

# Test signup
curl -X POST https://dashboard.impacteragi.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Should return success
```

## Alternative: Quick Manual Deploy via UI

If CLI doesn't work, use Cloudflare Dashboard:

1. Go to: https://dash.cloudflare.com
2. Workers & Pages → Create application → Pages → Upload assets
3. Upload the `.next/` directory contents
4. Name: impacteragi-dashboard
5. Deploy
6. Add custom domain: dashboard.impacteragi.com
7. Add environment variables in Settings

## Timeline

- **Phase 1**: 5 min (API token)
- **Phase 2**: 2 min (Deploy)
- **Phase 3**: 3 min (Custom domain)
- **Phase 4**: 5 min (Environment variables)
- **Phase 5**: 5 min (Stripe webhook)
- **Phase 6**: 5 min (Verification)

**Total**: ~25 minutes end-to-end

## Status

- [x] Build complete (.next/ directory ready)
- [ ] Cloudflare API token obtained
- [ ] Deploy to Pages
- [ ] Custom domain configured
- [ ] Environment variables set
- [ ] Stripe webhook configured
- [ ] System verified

## Next Actions

**IMMEDIATE:** Need to obtain Cloudflare API token to proceed with automated deployment.

**OPTIONS:**
1. Get API token manually via browser
2. Use Cloudflare UI for manual upload
3. Request human to provide API token

Once token is available, deployment takes ~2 minutes.
