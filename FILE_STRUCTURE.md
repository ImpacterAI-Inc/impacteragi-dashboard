# ImpacterAGI Dashboard - File Structure

## Core Application Files

### Root Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `wrangler.toml` - Cloudflare Pages configuration
- `.env.local` - Environment variables (not in git)
- `.gitignore` - Git ignore rules

### Application Code (`/app`)
```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Home (redirects to /login)
├── globals.css             # Global styles
├── login/
│   └── page.tsx            # Login page
├── signup/
│   └── page.tsx            # Signup page
├── dashboard/
│   └── page.tsx            # Main customer dashboard
└── api/
    ├── auth/
    │   ├── login/
    │   │   └── route.ts    # POST /api/auth/login
    │   └── signup/
    │       └── route.ts    # POST /api/auth/signup
    ├── stripe/
    │   └── webhook/
    │       └── route.ts    # POST /api/stripe/webhook
    ├── tasks/
    │   └── route.ts        # GET/POST /api/tasks
    ├── transactions/
    │   └── route.ts        # GET /api/transactions
    └── user/
        └── route.ts        # GET /api/user
```

### Library Code (`/lib`)
```
lib/
├── auth.ts     # JWT token auth, password hashing
├── db.ts       # DynamoDB client and CRUD operations
└── email.ts    # AWS SES email sending
```

### Scripts (`/scripts`)
```
scripts/
├── setup-db.js  # Create DynamoDB tables
└── admin.js     # CLI tool for managing tasks/users
```

### Documentation
- `README.md` - Project overview and features
- `DEPLOYMENT.md` - Complete deployment guide
- `CHECKLIST.md` - Quick start and go-live checklists
- `SUMMARY.md` - Project summary and completion report
- `FILE_STRUCTURE.md` - This file

### Deployment Scripts
- `deploy.sh` - Deploy to Cloudflare Pages
- `quickstart.sh` - Automated local setup

---

## Key Files Explained

### `/app/api/stripe/webhook/route.ts`
**Most critical file for revenue!**
- Receives Stripe `checkout.session.completed` events
- Creates user accounts automatically
- Adds credits to accounts ($0.01 = 1 credit)
- Sends welcome emails
- Records transactions

### `/app/dashboard/page.tsx`
**Main customer interface**
- Shows credit balance
- Task submission form
- Task history with status
- Protected by JWT auth

### `/lib/db.ts`
**All database operations**
- User CRUD operations
- Transaction recording
- Task management
- DynamoDB queries with GSI indexes

### `/lib/auth.ts`
**Security layer**
- Password hashing with bcrypt
- JWT token generation (7-day expiry)
- Token validation
- Request authentication

### `/scripts/admin.js`
**Admin CLI tool**
- View pending tasks
- Update task status
- View users and their credits
- Query transactions

---

## Environment Variables

Required in `.env.local`:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=<random-32-char-string>
NEXT_PUBLIC_APP_URL=https://dashboard.impacteragi.com
```

AWS credentials (via environment or ~/.aws/credentials):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- Region: us-east-1

---

## Build Output

After `npm run build`:
```
.next/
├── static/          # Static assets
├── server/          # Server-side code
└── types/           # TypeScript types
```

Deploy the `.next` folder to Cloudflare Pages.

---

## Total File Count

**Application files:** ~25 files
- TypeScript/React: 15 files
- Configuration: 7 files
- Scripts: 2 files
- Documentation: 5 files

**Lines of code:** ~3,500 lines
- Frontend: ~1,500 lines
- Backend API: ~800 lines
- Database layer: ~400 lines
- Auth/Email: ~300 lines
- Scripts: ~300 lines
- Config: ~200 lines

---

## Dependencies

**Production:**
- next (16.1.6) - React framework
- react (18.2.0) - UI library
- @aws-sdk/client-dynamodb - DynamoDB client
- @aws-sdk/client-ses - Email sending
- stripe - Payment webhooks
- jsonwebtoken - JWT auth
- bcryptjs - Password hashing

**Development:**
- typescript - Type checking
- tailwindcss - Styling
- autoprefixer - CSS processing

**Total package size:** ~50MB

---

## API Routes

All routes under `/api`:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/user` | Get current user info |
| POST | `/api/tasks` | Submit new task |
| GET | `/api/tasks` | Get user's tasks |
| GET | `/api/transactions` | Get user's transactions |
| POST | `/api/stripe/webhook` | Stripe webhook handler |

---

## Pages

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Home (redirects to login) | No |
| `/login` | Login page | No |
| `/signup` | Signup page | No |
| `/dashboard` | Main dashboard | Yes |

---

## Database Tables

### ImpacterAGI_Users
**Primary Key:** email (String)

Fields:
- email
- password_hash
- credits_balance
- created_at
- stripe_customer_id (optional)

### ImpacterAGI_Transactions
**Primary Key:** transaction_id (String)  
**GSI:** user_email-timestamp-index

Fields:
- transaction_id
- user_email
- type (purchase | spend)
- amount
- timestamp
- description
- stripe_payment_intent (optional)

### ImpacterAGI_Tasks
**Primary Key:** task_id (String)  
**GSI:** user_email-created_at-index

Fields:
- task_id
- user_email
- description
- status (pending | in-progress | completed)
- credits_spent
- created_at
- updated_at

---

## Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Stripe webhook signature verification
- ✅ Environment variables for secrets
- ✅ No SQL injection (DynamoDB)
- ✅ XSS protection (React)
- ✅ HTTPS required (Cloudflare)

---

## Build & Deploy

```bash
# Install
npm install

# Develop
npm run dev          # http://localhost:3000

# Build
npm run build        # Creates .next/

# Deploy
./deploy.sh          # Deploys to Cloudflare Pages
```

---

## Admin Commands

```bash
# Setup database
node scripts/setup-db.js

# View pending tasks
node scripts/admin.js pending

# View all users
node scripts/admin.js users

# Get user info
node scripts/admin.js user email@example.com

# Update task status
node scripts/admin.js update task_123 completed
```

---

This structure provides:
- Clear separation of concerns
- Easy to navigate
- Simple to deploy
- Secure by default
- Ready for production

**Total development time:** ~4 hours ⏱️  
**Status:** ✅ Production Ready
