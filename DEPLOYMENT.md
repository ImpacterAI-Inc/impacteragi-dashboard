# Deployment Guide - ImpacterAGI Dashboard

## Complete Deployment Checklist

### Prerequisites
- [x] AWS account with DynamoDB access
- [x] AWS SES sender email verified (alexander@homefreedom.com)
- [x] Stripe account with live API keys
- [x] Cloudflare account with Pages access

---

## Step 1: Set Up DynamoDB Tables (5 minutes)

```bash
# Make sure AWS credentials are configured
# export AWS_ACCESS_KEY_ID=...
# export AWS_SECRET_ACCESS_KEY=...

cd /data/.openclaw/workspace/impacteragi-dashboard
node scripts/setup-db.js
```

**Expected output:**
```
Creating DynamoDB tables...
✓ ImpacterAGI_Users created
✓ ImpacterAGI_Transactions created
✓ ImpacterAGI_Tasks created
All tables ready!
```

**Verify in AWS Console:**
- Go to DynamoDB → Tables
- Should see 3 tables with "ImpacterAGI_" prefix

---

## Step 2: Configure Environment Variables (2 minutes)

Create `.env.local`:

```env
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_PLACEHOLDER_WILL_UPDATE_AFTER_DEPLOY
JWT_SECRET=$(openssl rand -hex 32)  # Generate secure random string
NEXT_PUBLIC_APP_URL=https://dashboard.impacteragi.com
```

---

## Step 3: Test Locally (5 minutes)

```bash
npm run dev
```

Visit http://localhost:3000

**Test flow:**
1. Go to /signup
2. Create account: test@example.com / password123
3. Login
4. Should see "0 credits" on dashboard
5. Try submitting task → should say "Insufficient credits"

✅ If this works, auth system is functional!

---

## Step 4: Deploy to Cloudflare Pages (10 minutes)

### Option A: Via Cloudflare Dashboard (Recommended)

1. **Push to Git** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ImpacterAGI Dashboard"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create Pages Project:**
   - Go to: https://dash.cloudflare.com/
   - Pages → Create a project → Connect to Git
   - Select your repository
   
3. **Configure Build:**
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Root directory: `/`
   - Node version: 18

4. **Add Environment Variables:**
   Go to Settings → Environment Variables → Add:
   - `STRIPE_SECRET_KEY` = `sk_live_51S21n0PRrsO1NVxA...`
   - `JWT_SECRET` = (your generated secret)
   - `NEXT_PUBLIC_APP_URL` = `https://dashboard.impacteragi.com`
   - Leave `STRIPE_WEBHOOK_SECRET` empty for now

5. **Deploy:**
   - Click "Save and Deploy"
   - Wait 2-3 minutes for build

6. **Configure Custom Domain:**
   - Go to Custom domains
   - Add: `dashboard.impacteragi.com`
   - Update DNS as instructed

### Option B: Via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
chmod +x deploy.sh
./deploy.sh
```

---

## Step 5: Set Up Stripe Webhook (5 minutes)

**⚠️ CRITICAL: Do this BEFORE customers can pay**

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/webhooks

2. **Add Endpoint:**
   - Click "+ Add endpoint"
   - URL: `https://dashboard.impacteragi.com/api/stripe/webhook`
   - Events to send: Select `checkout.session.completed`
   - Click "Add endpoint"

3. **Get Webhook Secret:**
   - Click on the newly created endpoint
   - Click "Reveal" under "Signing secret"
   - Copy the value (starts with `whsec_`)

4. **Update Environment Variable:**
   - Go back to Cloudflare Pages
   - Settings → Environment Variables
   - Add/Update: `STRIPE_WEBHOOK_SECRET` = `whsec_...`
   - Click "Save"
   - Trigger a new deployment (or it'll pick up on next deploy)

---

## Step 6: Test Full Payment Flow (15 minutes)

### Create Test Payment

Use Stripe test mode first!

1. **Create Checkout Session** (via Stripe Dashboard or CLI):
   ```bash
   stripe checkout sessions create \
     --mode payment \
     --line-items "price_data[product_data][name]=ImpacterAGI Credits,price_data[unit_amount]=1000,price_data[currency]=usd,quantity=1" \
     --customer-email "test@example.com" \
     --success-url "https://dashboard.impacteragi.com/dashboard?session_id={CHECKOUT_SESSION_ID}"
   ```

2. **Complete Payment:**
   - Use test card: `4242 4242 4242 4242`
   - Exp: Any future date
   - CVC: Any 3 digits

3. **Check Webhook:**
   - Go to Stripe → Webhooks → Recent events
   - Should see `checkout.session.completed` with 200 response

4. **Check Email:**
   - test@example.com should receive welcome email
   - Click login link

5. **Check Dashboard:**
   - Login with email (webhook creates random password, so use "forgot password" or check DB)
   - Should see 1,000 credits ($10 = 1,000 credits)

6. **Submit Task:**
   - Enter task description
   - Click Submit
   - Should deduct 10 credits
   - Task appears in history

### Verify in Database

```bash
# Check user was created
aws dynamodb get-item \
  --table-name ImpacterAGI_Users \
  --key '{"email":{"S":"test@example.com"}}'

# Check transaction
aws dynamodb query \
  --table-name ImpacterAGI_Transactions \
  --index-name user_email-timestamp-index \
  --key-condition-expression "user_email = :email" \
  --expression-attribute-values '{":email":{"S":"test@example.com"}}'
```

---

## Step 7: Go Live! (2 minutes)

1. **Update Stripe Payment Links:**
   - Make sure your Stripe checkout links use LIVE mode
   - Point success_url to: `https://dashboard.impacteragi.com/dashboard`

2. **Test with Real Card:**
   - Use a real $1 payment to test (refund after)
   - Verify webhook works in production
   - Check email delivery
   - Check credits appear

3. **Monitor:**
   - Stripe Dashboard → Webhooks (watch for errors)
   - Cloudflare Pages → Logs
   - AWS SES → Email sending statistics

---

## Troubleshooting

### Webhook Not Working
```bash
# Check webhook endpoint is accessible
curl -X POST https://dashboard.impacteragi.com/api/stripe/webhook

# Should return: {"error":"No signature"}
# This means endpoint is reachable!
```

**Common issues:**
- Webhook secret mismatch → Update in Cloudflare
- Endpoint not public → Check DNS/deployment
- Wrong event type → Must be `checkout.session.completed`

### Email Not Sending
- Check AWS SES → Sending limits
- Verify sender email is verified
- Check SES region matches code (us-east-1)
- Look in SES → Suppression list

### Login Not Working
- Check JWT_SECRET is set in Cloudflare
- Clear browser localStorage
- Try incognito mode
- Check browser console for errors

### Credits Not Showing
- Check DynamoDB table for user
- Verify webhook was called (Stripe dashboard)
- Check Cloudflare logs for errors

---

## Admin: Processing Tasks

Tasks are in DynamoDB. To view:

```bash
# Get all pending tasks
aws dynamodb scan \
  --table-name ImpacterAGI_Tasks \
  --filter-expression "#status = :status" \
  --expression-attribute-names '{"#status":"status"}' \
  --expression-attribute-values '{":status":{"S":"pending"}}'
```

To update task status:

```bash
aws dynamodb update-item \
  --table-name ImpacterAGI_Tasks \
  --key '{"task_id":{"S":"task_123..."}}' \
  --update-expression "SET #status = :status" \
  --expression-attribute-names '{"#status":"status"}' \
  --expression-attribute-values '{":status":{"S":"completed"}}'
```

---

## Monitoring Checklist

Daily checks:
- [ ] Stripe webhook success rate
- [ ] Email delivery rate (AWS SES)
- [ ] DynamoDB read/write capacity (should be on-demand)
- [ ] Cloudflare Pages error rate
- [ ] Pending tasks count

---

## Success! 🎉

Your dashboard is now live and customers can:
✅ Pay via Stripe
✅ Automatically get account with credits
✅ Login and see balance
✅ Submit tasks
✅ Track task history

**Next Steps:**
1. Build admin panel to process tasks
2. Add password reset flow
3. Add more payment options
4. Set up monitoring/alerts

**Time to complete:** 4-6 hours (as promised!)

---

For issues: alexander@homefreedom.com
