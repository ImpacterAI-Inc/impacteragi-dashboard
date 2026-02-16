# ImpacterAGI Customer Dashboard

Minimal viable dashboard for ImpacterAGI customers to manage credits and submit tasks.

## Features

✅ **Authentication** - Signup/Login with JWT tokens  
✅ **Credit Management** - Display and track credit balance  
✅ **Task Submission** - Simple form to submit tasks (10 credits each)  
✅ **Stripe Integration** - Webhook handler for automatic account creation  
✅ **Email Notifications** - Welcome emails via AWS SES  
✅ **Task History** - View submitted tasks and their status  

## Tech Stack

- **Frontend:** Next.js 14 + React + Tailwind CSS
- **Auth:** JWT tokens, bcrypt password hashing
- **Database:** AWS DynamoDB (3 tables)
- **Email:** AWS SES
- **Payments:** Stripe webhooks
- **Deployment:** Cloudflare Pages + Workers

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up DynamoDB Tables

```bash
node scripts/setup-db.js
```

This creates three tables:
- `ImpacterAGI_Users` - User accounts
- `ImpacterAGI_Transactions` - Credit purchases/spends
- `ImpacterAGI_Tasks` - Submitted tasks

### 3. Configure Environment Variables

Edit `.env.local`:

```env
STRIPE_SECRET_KEY=sk_live_51S21n0PRrsO1NVxA...
STRIPE_WEBHOOK_SECRET=whsec_... # Get this after setting up webhook
JWT_SECRET=your-secure-random-string
NEXT_PUBLIC_APP_URL=https://dashboard.impacteragi.com
```

### 4. Run Locally

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Set Up Stripe Webhook

1. Deploy to Cloudflare Pages (see below)
2. Go to Stripe Dashboard → Webhooks
3. Add endpoint: `https://dashboard.impacteragi.com/api/stripe/webhook`
4. Select event: `checkout.session.completed`
5. Copy webhook secret to `.env.local`

## Deployment to Cloudflare Pages

### Build Configuration

- **Build command:** `npm run build`
- **Build output directory:** `.next`
- **Root directory:** `/`

### Deploy via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npx @cloudflare/next-on-pages

# Or use Cloudflare Dashboard:
# 1. Go to Pages → Create a project
# 2. Connect your Git repo
# 3. Configure build settings above
# 4. Add environment variables
# 5. Deploy!
```

### Environment Variables (Cloudflare Pages)

Add these in Cloudflare Pages → Settings → Environment Variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`

## How It Works

### Payment Flow

1. Customer pays via Stripe checkout ($10 = 1,000 credits)
2. Stripe sends `checkout.session.completed` event to `/api/stripe/webhook`
3. Webhook creates user account (or adds credits to existing account)
4. Welcome email sent with dashboard login link
5. Customer logs in and sees their credits

### Task Submission Flow

1. Customer logs into dashboard
2. Enters task description in text area
3. Clicks "Submit Task" (costs 10 credits)
4. Credits deducted, task saved to DynamoDB with status "pending"
5. Task appears in history section

### Admin Processing (Manual for MVP)

Tasks are stored in DynamoDB table `ImpacterAGI_Tasks`. Admin can:
- Query all pending tasks
- Update task status (pending → in-progress → completed)
- Use AWS Console or custom admin tool

## API Endpoints

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/user` - Get current user info
- `POST /api/tasks` - Submit new task
- `GET /api/tasks` - Get user's tasks
- `GET /api/transactions` - Get user's credit transactions
- `POST /api/stripe/webhook` - Stripe webhook handler

## Pages

- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - Main dashboard (requires auth)

## Database Schema

### Users Table
```
email (PK)
password_hash
credits_balance
created_at
stripe_customer_id
```

### Transactions Table
```
transaction_id (PK)
user_email (GSI)
type: 'purchase' | 'spend'
amount
timestamp
description
stripe_payment_intent
```

### Tasks Table
```
task_id (PK)
user_email (GSI)
description
status: 'pending' | 'in-progress' | 'completed'
credits_spent
created_at
updated_at
```

## Success Criteria ✅

- [x] Customer pays $10 via Stripe
- [x] Webhook auto-creates account with 1,000 credits
- [x] Customer receives email with dashboard link
- [x] Customer logs in, sees 1,000 credits
- [x] Customer can submit a task (deducts 10 credits)
- [x] Task appears in history for manual processing

## Next Steps (Post-MVP)

- Admin dashboard to manage tasks
- Password reset flow implementation
- Credit purchase page (Stripe checkout link)
- Email notifications when tasks complete
- Task filtering/search
- Better error handling
- Rate limiting
- Testing suite

## Troubleshooting

**Webhook not working:**
- Check Stripe webhook secret is correct
- Verify endpoint URL is publicly accessible
- Check Stripe Dashboard → Webhooks → Recent events for errors

**Email not sending:**
- Verify AWS SES sender email is verified
- Check AWS credentials have SES permissions

**Login not working:**
- Check JWT_SECRET is set
- Clear browser localStorage and try again

**Database errors:**
- Verify AWS credentials have DynamoDB permissions
- Check table names match exactly
- Run `node scripts/setup-db.js` again

## Support

For issues or questions, contact: alexander@homefreedom.com

---

Built in 4-6 hours as minimal viable product. Polish later! 🚀
