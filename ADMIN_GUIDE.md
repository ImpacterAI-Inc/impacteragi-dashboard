# 👨‍💼 ADMIN GUIDE - ImpacterAGI Dashboard

## 🔑 Admin Access

**Admin Login:**
- URL: https://dashboard.impacteragi.com/login
- Email: manny@impacteragi.com
- Password: ImpacterAGI2026!Admin
- Credits: 10,000 (initial)

---

## 💳 Managing User Credits

### View User Credits

**Via Database (Prisma Studio):**
```bash
cd /data/.openclaw/workspace/impacteragi-dashboard
npx prisma studio
```

This opens a web interface at http://localhost:5555 where you can:
- View all users
- See credit balances
- View transactions
- View all tasks

### Gift Credits (Manual via Database)

**Update user credits directly:**
```bash
# Connect to database
psql $DATABASE_URL

# Add credits to a user
UPDATE "User" SET "creditsBalance" = "creditsBalance" + 5000 WHERE email = 'user@example.com';

# Check new balance
SELECT email, "creditsBalance" FROM "User" WHERE email = 'user@example.com';
```

### Gift Credits (Via API - Future Feature)

When admin panel is built, you'll be able to:
1. Go to /admin/credits
2. Enter user email
3. Enter credit amount
4. Add optional note
5. Click "Gift Credits"

---

## 👥 User Management

### View All Users

**Prisma Studio:**
```bash
npx prisma studio
# Navigate to "User" table
```

**Via Database:**
```bash
psql $DATABASE_URL
SELECT id, email, "creditsBalance", "createdAt" FROM "User" ORDER BY "createdAt" DESC;
```

### Reset User Password

**Generate new password hash:**
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('NewPassword123!', 10));"
```

**Update in database:**
```bash
psql $DATABASE_URL
UPDATE "User" SET "passwordHash" = '<hash-from-above>' WHERE email = 'user@example.com';
```

### Delete User (with all data)

**WARNING: This deletes everything (tasks, transactions)**
```bash
psql $DATABASE_URL
DELETE FROM "User" WHERE email = 'user@example.com';
# Cascades to tasks and transactions automatically
```

---

## 💰 Monitoring Revenue

### View All Transactions

**Prisma Studio:**
```bash
npx prisma studio
# Navigate to "Transaction" table
# Filter by type: "purchase"
```

**Via Database:**
```sql
-- Total revenue
SELECT SUM(amount) as total_revenue FROM "Transaction" WHERE type = 'purchase';

-- Revenue by date
SELECT DATE("createdAt") as date, SUM(amount) as revenue 
FROM "Transaction" 
WHERE type = 'purchase' 
GROUP BY DATE("createdAt") 
ORDER BY date DESC;

-- Top customers
SELECT u.email, SUM(t.amount) as total_spent
FROM "Transaction" t
JOIN "User" u ON t."userId" = u.id
WHERE t.type = 'purchase'
GROUP BY u.email
ORDER BY total_spent DESC
LIMIT 10;
```

### Stripe Dashboard

**For detailed payment info:**
1. Go to https://dashboard.stripe.com
2. View all payments, refunds, disputes
3. Download reports for accounting

---

## 📊 Analytics Queries

### Active Users (Last 7 Days)

```sql
SELECT COUNT(DISTINCT "userId") as active_users
FROM "Task"
WHERE "createdAt" > NOW() - INTERVAL '7 days';
```

### Most Popular Tasks

```sql
SELECT "agentUsed", COUNT(*) as count
FROM "Task"
WHERE "agentUsed" IS NOT NULL
GROUP BY "agentUsed"
ORDER BY count DESC;
```

### Average Credits Used Per Task

```sql
SELECT "agentUsed", AVG("creditsUsed") as avg_credits
FROM "Task"
WHERE "creditsUsed" > 0
GROUP BY "agentUsed";
```

### Credit Utilization

```sql
-- Total credits purchased
SELECT SUM(credits) as purchased FROM "Transaction" WHERE type = 'purchase';

-- Total credits used
SELECT SUM("creditsUsed") as used FROM "Task";

-- Credits remaining (sum of all user balances)
SELECT SUM("creditsBalance") as remaining FROM "User";
```

---

## 🔧 Maintenance Tasks

### Database Backups

**Vercel/Railway/Render:** Auto-backups enabled

**Manual Backup:**
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

**Restore from Backup:**
```bash
psql $DATABASE_URL < backup-20260212.sql
```

### Clear Old Tasks (Optional)

**Delete completed tasks older than 30 days:**
```sql
DELETE FROM "Task" 
WHERE status = 'completed' 
AND "createdAt" < NOW() - INTERVAL '30 days';
```

### Recalculate User Credits (If Out of Sync)

```sql
-- This recalculates each user's balance from transactions and tasks
UPDATE "User" u
SET "creditsBalance" = (
  SELECT COALESCE(SUM(t.credits), 0) FROM "Transaction" t 
  WHERE t."userId" = u.id AND t.type = 'purchase'
) - (
  SELECT COALESCE(SUM(t."creditsUsed"), 0) FROM "Task" t 
  WHERE t."userId" = u.id
);
```

---

## 🚨 Troubleshooting

### User Can't Login

**Check:**
1. Verify email exists: `SELECT * FROM "User" WHERE email = 'user@example.com'`
2. Reset password (see above)
3. Check for typos in email

### Credits Not Deducting

**Check:**
1. Task status: `SELECT * FROM "Task" WHERE "userId" = '<user-id>' ORDER BY "createdAt" DESC`
2. Credit balance: `SELECT "creditsBalance" FROM "User" WHERE id = '<user-id>'`
3. Transactions: `SELECT * FROM "Transaction" WHERE "userId" = '<user-id>' ORDER BY "createdAt" DESC`

### Stripe Payment Not Creating Account

**Check:**
1. Webhook logs in Stripe dashboard
2. Application logs: `vercel logs` or platform-specific
3. Verify webhook secret is correct
4. Test webhook with Stripe CLI

### Email Not Sending

**Check:**
1. AWS SES credentials in environment variables
2. AWS SES sending limits: `aws ses get-send-quota`
3. Verify sender email: `aws ses verify-email-identity --email noreply@impacteragi.com`
4. Check application logs

---

## 📈 Scaling Considerations

### When to Upgrade

**Free Tier Limits:**
- Vercel: 100GB bandwidth, 100 builds/month
- Railway: 500 hours compute, 1GB storage
- Neon: 3GB storage, shared compute

**Upgrade When:**
- > 1000 users
- > 10,000 tasks/month
- Need faster database
- Need more storage

### Performance Optimization

**If slow:**
1. Check database indexes (already optimized)
2. Add caching (Redis)
3. Upgrade database plan
4. Use CDN for assets

---

## 🔐 Security Best Practices

### Rotate Secrets Regularly

**Every 90 days:**
1. Generate new NEXTAUTH_SECRET
2. Rotate AWS keys
3. Update Stripe webhook secret
4. Update environment variables
5. Redeploy

### Monitor Logs

**Weekly checks:**
- Failed login attempts
- Unusual credit transactions
- API errors
- Stripe webhook failures

### Database Access

**Restrict:**
- Only admin IPs can access database directly
- Use connection string with SSL
- Don't share DATABASE_URL

---

## 📞 Support

### User Support

**Common Issues:**
1. Forgot password → Reset via database (see above)
2. Credits missing → Check transactions, verify webhook
3. Task failed → Check logs, retry manually
4. Can't login → Verify email, reset password

### Technical Support

**Resources:**
- Vercel Support: https://vercel.com/support
- Railway Discord: https://railway.app/discord
- Stripe Support: https://support.stripe.com

**Documentation:**
- DEPLOY_NOW.md - Deployment guide
- ARCHITECTURE.md - System design
- This file - Admin operations

---

## 🎯 Quick Reference Commands

### Most Common Operations

```bash
# View users
npx prisma studio

# Add credits to user
psql $DATABASE_URL -c "UPDATE \"User\" SET \"creditsBalance\" = \"creditsBalance\" + 1000 WHERE email = 'user@example.com';"

# View recent transactions
psql $DATABASE_URL -c "SELECT * FROM \"Transaction\" ORDER BY \"createdAt\" DESC LIMIT 10;"

# Check revenue
psql $DATABASE_URL -c "SELECT SUM(amount) FROM \"Transaction\" WHERE type = 'purchase';"

# View active users (7 days)
psql $DATABASE_URL -c "SELECT COUNT(DISTINCT \"userId\") FROM \"Task\" WHERE \"createdAt\" > NOW() - INTERVAL '7 days';"

# Backup database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Check app logs
vercel logs --prod
# or
railway logs
```

---

## 🎉 Future Admin Features

### Coming Soon:
- [ ] Web-based admin panel at /admin
- [ ] One-click credit gifting
- [ ] User management UI
- [ ] Analytics dashboard
- [ ] Export reports to CSV
- [ ] Automated email campaigns
- [ ] User impersonation (support)
- [ ] A/B testing framework

---

*For urgent issues, check logs first, then database, then contact support.*  
*Always backup before making database changes!*
