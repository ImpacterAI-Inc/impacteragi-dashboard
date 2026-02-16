# Deploy to Render.com with PostgreSQL

## Quick Deploy - ImpacterAGI Dashboard

This dashboard now uses **PostgreSQL** for persistent storage.

### 1. Prerequisites
- GitHub account
- Render.com account (free)

### 2. Deployment Steps

#### A. Push to GitHub
```bash
cd /data/.openclaw/workspace/impacteragi-dashboard
git remote add origin https://github.com/YOUR_USERNAME/impacteragi-dashboard.git
git push -u origin master
```

#### B. Deploy on Render.com
1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `impacteragi-dashboard`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### C. Add PostgreSQL Database
1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Name it: `impacteragi-db`
3. **Plan**: Free
4. Click **"Create Database"**
5. Copy the **Internal Database URL**

#### D. Set Environment Variables
In your Web Service settings → Environment:
```
DATABASE_URL=<paste-internal-database-url-here>
NODE_ENV=production
```

### 3. Alternative: Manual PostgreSQL Setup

If you have your own PostgreSQL:

```bash
# Set environment variable
export DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Run locally to test
npm install
npm run build
npm start
```

### 4. Testing the Deployment

Once deployed:
1. Visit your Render URL (e.g., `https://impacteragi-dashboard.onrender.com`)
2. **Signup** with email/password
3. **Login**
4. **Redeem code**: `BETA10K`
5. Verify credits show **10,000**
6. **Logout and login again** - credits should persist!
7. **Submit a task** - credits should deduct to **9,990**

### 5. PostgreSQL Schema

The tables are auto-created on first run:
- `users` - email, password_hash, credits, created_at
- `tasks` - id, email, description, status, credits_spent, created_at  
- `redeemed_codes` - email, code, redeemed_at

### 6. Success Criteria

✅ User signup works
✅ Login persists sessions
✅ Code redemption adds credits to database
✅ Credits persist across page reloads
✅ Task submission deducts credits from database
✅ All data survives server restarts

---

## Troubleshooting

**"DATABASE_URL not set"**  
→ Add `DATABASE_URL` environment variable in Render settings

**"Connection refused"**  
→ Use the Internal Database URL, not External

**"Table doesn't exist"**  
→ Tables auto-create on first API call. Just wait a moment.

---

## Cost: $0/month

Both Web Service and PostgreSQL on Render's free tier = **$0**

Free tier includes:
- 750 hours/month runtime (enough for 24/7)
- PostgreSQL with 1GB storage
- Automatic HTTPS
- Custom domain support
