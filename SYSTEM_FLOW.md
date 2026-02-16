# ImpacterAGI Dashboard - System Flow Diagram

## Complete Customer Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER PAYMENT FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. Customer Pays via Stripe
   └─> $10 payment on Stripe checkout page
       └─> Payment successful
           └─> Stripe triggers: checkout.session.completed event

2. Webhook Receives Event
   └─> POST /api/stripe/webhook
       ├─> Verify webhook signature (security)
       ├─> Extract customer email
       ├─> Calculate credits ($0.01 = 1 credit → $10 = 1,000 credits)
       └─> Process...

3. Account Creation
   └─> Check if user exists in DynamoDB
       ├─> If NEW user:
       │   ├─> Generate random password
       │   ├─> Hash password with bcrypt
       │   └─> Create user in ImpacterAGI_Users table
       └─> If EXISTING user:
           └─> Add credits to balance

4. Credits Added
   └─> Update user credits_balance in DynamoDB
       └─> Record transaction in ImpacterAGI_Transactions

5. Welcome Email Sent
   └─> AWS SES sends email to customer
       ├─> Subject: "Welcome to ImpacterAGI!"
       ├─> Body: "Your 1,000 credits are ready"
       └─> Link: https://dashboard.impacteragi.com/login

6. Customer Receives Email
   └─> Clicks login link
       └─> Lands on /login page

7. Customer Logs In
   └─> Enters email + password (from email or creates password)
       └─> POST /api/auth/login
           ├─> Verify password with bcrypt
           └─> Generate JWT token (7-day expiry)

8. Dashboard Loads
   └─> GET /api/user (with JWT token)
       └─> Returns: email, credits_balance, created_at
           └─> Dashboard shows: "1,000 credits available"

9. Customer Submits Task
   └─> Enters task description in form
       └─> POST /api/tasks
           ├─> Verify JWT token
           ├─> Check credits_balance >= 10
           ├─> Create task in ImpacterAGI_Tasks (status: pending)
           ├─> Deduct 10 credits from balance
           ├─> Record transaction (type: spend)
           └─> Return: task_id, credits_remaining

10. Task History Updates
    └─> GET /api/tasks
        └─> Returns all user tasks with status
            └─> Dashboard shows task with status badge

11. Admin Processes Task
    └─> node scripts/admin.js pending
        └─> Shows all pending tasks
            └─> Admin completes work
                └─> node scripts/admin.js update task_123 completed
                    └─> Task status updated to "completed"

12. Customer Sees Completed Task
    └─> Refresh dashboard
        └─> Task status: "completed" ✅
```

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE PAGES                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 NEXT.JS APPLICATION                        │  │
│  │                                                            │  │
│  │  Frontend (React):                                         │  │
│  │  ├─ /login           ─────┐                               │  │
│  │  ├─ /signup                │                               │  │
│  │  └─ /dashboard ────────────┼──> JWT Token Auth            │  │
│  │                             │                               │  │
│  │  API Routes:                │                               │  │
│  │  ├─ /api/auth/login  <─────┘                               │  │
│  │  ├─ /api/auth/signup                                       │  │
│  │  ├─ /api/user                                              │  │
│  │  ├─ /api/tasks                                             │  │
│  │  ├─ /api/transactions                                      │  │
│  │  └─ /api/stripe/webhook  <─── Stripe Events               │  │
│  │                             │                               │  │
│  └─────────────────────────────┼────────────────────────────┘  │
└────────────────────────────────┼─────────────────────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 ▼               ▼               ▼
         ┌─────────────┐  ┌──────────┐  ┌──────────────┐
         │   STRIPE    │  │   AWS    │  │     AWS      │
         │  WEBHOOKS   │  │ DYNAMODB │  │     SES      │
         │             │  │          │  │              │
         │ • checkout  │  │ • Users  │  │ • Welcome    │
         │   completed │  │ • Trans. │  │   emails     │
         │             │  │ • Tasks  │  │ • Password   │
         └─────────────┘  └──────────┘  │   reset      │
                                        └──────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                    ImpacterAGI_Users                             │
├─────────────────────────────────────────────────────────────────┤
│ Primary Key: email (String)                                      │
│                                                                  │
│ Fields:                                                          │
│  • email             : String                                    │
│  • password_hash     : String (bcrypt hashed)                    │
│  • credits_balance   : Number                                    │
│  • created_at        : String (ISO timestamp)                    │
│  • stripe_customer_id: String (optional)                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                ImpacterAGI_Transactions                          │
├─────────────────────────────────────────────────────────────────┤
│ Primary Key: transaction_id (String)                             │
│ GSI: user_email-timestamp-index                                  │
│                                                                  │
│ Fields:                                                          │
│  • transaction_id       : String (txn_timestamp_random)          │
│  • user_email           : String                                 │
│  • type                 : String (purchase | spend)              │
│  • amount               : Number (positive for purchase)         │
│  • timestamp            : String (ISO timestamp)                 │
│  • description          : String                                 │
│  • stripe_payment_intent: String (optional)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ImpacterAGI_Tasks                             │
├─────────────────────────────────────────────────────────────────┤
│ Primary Key: task_id (String)                                    │
│ GSI: user_email-created_at-index                                 │
│                                                                  │
│ Fields:                                                          │
│  • task_id       : String (task_timestamp_random)                │
│  • user_email    : String                                        │
│  • description   : String                                        │
│  • status        : String (pending | in-progress | completed)    │
│  • credits_spent : Number (10)                                   │
│  • created_at    : String (ISO timestamp)                        │
│  • updated_at    : String (ISO timestamp)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER AUTHENTICATION                          │
└─────────────────────────────────────────────────────────────────┘

SIGNUP:
  User → POST /api/auth/signup { email, password }
         ├─> Validate email format
         ├─> Check password length (min 8 chars)
         ├─> Check if user exists
         ├─> Hash password with bcrypt (10 rounds)
         ├─> Create user in DynamoDB
         └─> Generate JWT token (7-day expiry)
             └─> Return: { token, email, credits }

LOGIN:
  User → POST /api/auth/login { email, password }
         ├─> Get user from DynamoDB
         ├─> Compare password with bcrypt
         ├─> Generate JWT token (7-day expiry)
         └─> Return: { token, email, credits }

PROTECTED ROUTE:
  User → GET /api/user
         ├─> Extract JWT from Authorization header
         ├─> Verify JWT signature
         ├─> Check expiry
         ├─> Extract email from payload
         ├─> Get user from DynamoDB
         └─> Return user data

TOKEN STRUCTURE:
  JWT Payload:
    {
      "email": "user@example.com",
      "iat": 1707864000,  // issued at
      "exp": 1708468800   // expires (7 days later)
    }
```

---

## API Request/Response Examples

```
┌─────────────────────────────────────────────────────────────────┐
│                       API EXAMPLES                               │
└─────────────────────────────────────────────────────────────────┘

1. SIGNUP
   POST /api/auth/signup
   Body: {
     "email": "customer@example.com",
     "password": "securepass123"
   }
   Response: {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "email": "customer@example.com",
     "credits": 0
   }

2. LOGIN
   POST /api/auth/login
   Body: {
     "email": "customer@example.com",
     "password": "securepass123"
   }
   Response: {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "email": "customer@example.com",
     "credits": 1000
   }

3. GET USER
   GET /api/user
   Headers: {
     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
   }
   Response: {
     "email": "customer@example.com",
     "credits": 1000,
     "created_at": "2026-02-14T12:00:00Z"
   }

4. SUBMIT TASK
   POST /api/tasks
   Headers: {
     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
   }
   Body: {
     "description": "Create a marketing campaign for my product"
   }
   Response: {
     "task_id": "task_1707864000_abc123",
     "status": "pending",
     "credits_remaining": 990
   }

5. GET TASKS
   GET /api/tasks
   Headers: {
     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
   }
   Response: {
     "tasks": [
       {
         "task_id": "task_1707864000_abc123",
         "description": "Create a marketing campaign...",
         "status": "pending",
         "credits_spent": 10,
         "created_at": "2026-02-14T12:00:00Z",
         "updated_at": "2026-02-14T12:00:00Z"
       }
     ]
   }

6. STRIPE WEBHOOK
   POST /api/stripe/webhook
   Headers: {
     "stripe-signature": "t=1707864000,v1=..."
   }
   Body: {
     "type": "checkout.session.completed",
     "data": {
       "object": {
         "customer_email": "customer@example.com",
         "amount_total": 1000,  // $10.00 in cents
         "payment_intent": "pi_..."
       }
     }
   }
   Response: {
     "received": true
   }
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                     SECURITY ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────┘

Layer 1: HTTPS (Cloudflare)
   └─> All traffic encrypted with TLS

Layer 2: Password Security
   ├─> bcrypt hashing (10 rounds)
   ├─> Salt automatically included
   └─> Original password never stored

Layer 3: JWT Authentication
   ├─> Tokens signed with secret key
   ├─> 7-day expiration
   ├─> Verified on every protected route
   └─> Stored in browser localStorage

Layer 4: Webhook Verification
   ├─> Stripe signature verification
   ├─> Prevents replay attacks
   └─> Rejects unsigned requests

Layer 5: Input Validation
   ├─> Email format validation
   ├─> Password length requirements
   ├─> SQL injection safe (NoSQL)
   └─> XSS protection (React escaping)

Layer 6: Environment Variables
   ├─> No secrets in code
   ├─> All keys in .env.local
   └─> Different per environment
```

---

## Admin Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN TASK PROCESSING                         │
└─────────────────────────────────────────────────────────────────┘

Daily Routine:
  1. Check pending tasks
     └─> node scripts/admin.js pending
         └─> Displays all pending tasks with details

  2. Review task descriptions
     └─> Read what customer wants done

  3. Complete the work
     └─> Do the actual task (marketing, content, etc.)

  4. Update status to in-progress
     └─> node scripts/admin.js update task_123 in-progress

  5. Finish work and mark completed
     └─> node scripts/admin.js update task_123 completed

  6. (Optional) Email customer
     └─> "Your task is complete!"

  7. Check new users
     └─> node scripts/admin.js users
         └─> See who signed up today

  8. Check specific user
     └─> node scripts/admin.js user customer@example.com
         └─> See their credit balance and info
```

---

## Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PROCESS                            │
└─────────────────────────────────────────────────────────────────┘

Local Setup:
  ./quickstart.sh
  ├─> Check .env.local exists
  ├─> Verify AWS credentials
  ├─> Install npm dependencies
  ├─> Create DynamoDB tables
  └─> Test build

Local Testing:
  npm run dev
  └─> Visit http://localhost:3000
      ├─> Test signup
      ├─> Test login
      └─> Test dashboard (0 credits)

Production Deployment:
  1. Push to Git repository
  2. Connect to Cloudflare Pages
  3. Configure build:
     ├─> Build command: npm run build
     ├─> Build output: .next
     └─> Node version: 18
  4. Add environment variables
  5. Deploy!

Post-Deployment:
  1. Set up Stripe webhook
     └─> URL: https://dashboard.impacteragi.com/api/stripe/webhook
  2. Get webhook secret
  3. Add to Cloudflare env vars
  4. Redeploy
  5. Test with $1 payment
  6. Monitor logs
```

---

This visual guide shows exactly how everything works together! 🎯
