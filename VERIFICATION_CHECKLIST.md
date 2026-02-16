# ✅ POST-DEPLOYMENT VERIFICATION CHECKLIST

Run through this checklist after deployment to ensure everything works correctly.

---

## 📋 PHASE 1: Deployment Verification

### Platform Status
- [ ] Deployment completed successfully (green checkmark in dashboard)
- [ ] No build errors in logs
- [ ] App URL is accessible
- [ ] Homepage loads without errors

**If any fail:** Check build logs, verify environment variables

---

## 📋 PHASE 2: Database Verification

### Database Connection
- [ ] Database is provisioned and running
- [ ] `DATABASE_URL` environment variable is set correctly
- [ ] Ran `npx prisma db push` successfully
- [ ] Ran `npx prisma db seed` successfully

**Test command (in platform console):**
```bash
npx prisma db push --skip-generate
```
Should output: "Your database is now in sync with your schema."

### Database Content
- [ ] Test user exists: `test@example.com`
- [ ] Admin user exists: `manny@impacteragi.com`
- [ ] Both users have starting credit balances

**Verify (optional):**
```bash
npx prisma studio
```
Opens database GUI - check Users table

---

## 📋 PHASE 3: Authentication Testing

### Login Flow
- [ ] Can access `/login` page
- [ ] Login form displays correctly
- [ ] Can login with: `test@example.com` / `password123`
- [ ] After login, redirects to `/dashboard`
- [ ] Can logout successfully
- [ ] After logout, redirects to homepage

### Session Management
- [ ] After login, session persists on page refresh
- [ ] Unauthenticated users can't access `/dashboard`
- [ ] Unauthenticated users redirect to `/login`

**If auth fails:** Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set correctly

---

## 📋 PHASE 4: Dashboard Functionality

### Dashboard Page (`/dashboard`)
- [ ] Dashboard loads successfully
- [ ] User email displays in header
- [ ] Credit balance displays at top (should show 1000 for test user)
- [ ] Credit meter is visible and styled correctly
- [ ] Chat interface renders
- [ ] "ImpacterAGI" welcome message appears in chat
- [ ] Task history section visible (empty initially)

### UI Elements
- [ ] Navigation menu works
- [ ] Responsive design works on mobile
- [ ] No console errors in browser developer tools
- [ ] All images and icons load correctly

---

## 📋 PHASE 5: Chat Interface Testing

### Basic Chat
- [ ] Can type message in chat input
- [ ] Send button is clickable
- [ ] After sending, user message appears in chat
- [ ] System shows "Working on it..." response
- [ ] No JavaScript errors in console

### Task Creation (Basic Test)
- [ ] Send message: "Write a hello world program"
- [ ] Task creates successfully (API call succeeds)
- [ ] Task ID is returned
- [ ] System polls for task status
- [ ] Credit balance updates after task completes

**Expected behavior:**
- User message appears
- System "working" message appears
- Task processes (may take 30-60 seconds)
- Result message appears with output
- Credits deduct from balance

**If task fails:** Check `OPENCLAW_API_URL` and agent connectivity

---

## 📋 PHASE 6: API Endpoints Testing

### Test with cURL or browser:

#### Get Credit Balance
```bash
curl https://[your-app-url]/api/credits/balance \
  -H "Cookie: next-auth.session-token=[your-session-cookie]"
```
**Expected:** `{ "credits": 1000 }`

#### Create Task
```bash
curl https://[your-app-url]/api/tasks/create \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=[your-session-cookie]" \
  -d '{"requestText": "Test task"}'
```
**Expected:** `{ "taskId": "...", "estimatedCost": 10 }`

#### List Tasks
```bash
curl https://[your-app-url]/api/tasks/list \
  -H "Cookie: next-auth.session-token=[your-session-cookie]"
```
**Expected:** `{ "tasks": [...] }`

---

## 📋 PHASE 7: Payment Integration (Optional - If Stripe Configured)

### Stripe Checkout
- [ ] `/pricing` or payment page loads
- [ ] Stripe checkout button works
- [ ] Clicking button opens Stripe Checkout
- [ ] Can see test credit packages

### Test Payment
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Any future date, any CVC
- [ ] Payment succeeds
- [ ] Redirects back to dashboard
- [ ] Credits added to account balance

### Webhook
- [ ] Webhook endpoint accessible: `[your-app-url]/api/webhooks/stripe`
- [ ] Webhook registered in Stripe dashboard
- [ ] Test webhook sends successfully
- [ ] Credits update after successful payment

**If webhooks fail:** Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

---

## 📋 PHASE 8: AWS Integration

### S3 File Uploads (When Task Completes)
- [ ] Task results can include file URLs
- [ ] File URLs start with S3 bucket URL
- [ ] Files are accessible (or have signed URLs)

### SES Email Sending (If Enabled)
- [ ] Welcome email sends on signup
- [ ] Credit purchase confirmation emails work
- [ ] Emails come from `noreply@impacteragi.com`

**Check AWS environment variables:**
- [ ] `AWS_REGION` set correctly
- [ ] `AWS_ACCESS_KEY_ID` set correctly
- [ ] `AWS_SECRET_ACCESS_KEY` set correctly
- [ ] `AWS_S3_BUCKET` set correctly

---

## 📋 PHASE 9: Performance & Security

### Performance
- [ ] Page load time < 3 seconds
- [ ] No slow queries or timeouts
- [ ] API responses < 1 second (for balance/list endpoints)
- [ ] Chat interface is responsive

### Security
- [ ] Can't access `/dashboard` without login
- [ ] Can't access other users' data
- [ ] API endpoints require authentication
- [ ] Passwords are hashed (not stored in plain text)
- [ ] NEXTAUTH_SECRET is secure (not default value)
- [ ] No sensitive data in browser console
- [ ] No sensitive data exposed in HTML source

---

## 📋 PHASE 10: Final Checks

### Environment Variables
- [ ] All critical env vars are set (see list below)
- [ ] `NEXTAUTH_URL` matches actual deployment URL
- [ ] `NEXT_PUBLIC_APP_URL` matches actual deployment URL
- [ ] No placeholder values remaining

### Critical Environment Variables:
```
✓ DATABASE_URL (actual connection string)
✓ NEXTAUTH_URL (actual app URL)
✓ NEXTAUTH_SECRET (generated secret)
✓ AWS_REGION
✓ AWS_ACCESS_KEY_ID
✓ AWS_SECRET_ACCESS_KEY
✓ AWS_S3_BUCKET
✓ STRIPE_SECRET_KEY (real or test key)
```

### Documentation
- [ ] `README.md` updated with deployment URL
- [ ] Team knows how to access dashboard
- [ ] Test credentials shared securely

### Monitoring
- [ ] Platform monitoring/alerts configured
- [ ] Database backup enabled (if production)
- [ ] Error tracking set up (optional: Sentry)

---

## 🎯 SUCCESS CRITERIA

Your deployment is **SUCCESSFUL** if you can:

1. ✅ Login with test credentials
2. ✅ See credit balance (1000 credits)
3. ✅ Send a chat message
4. ✅ Task creates successfully
5. ✅ Credits deduct after task completion
6. ✅ Task history updates
7. ✅ (Optional) Purchase credits via Stripe

---

## 🚨 TROUBLESHOOTING

### Issue: Can't login
**Fix:**
- Run `npx prisma db seed` again
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

### Issue: Credits don't show
**Fix:**
- Check database seed ran successfully
- Query database directly to verify user exists
- Check API endpoint `/api/credits/balance` directly

### Issue: Chat doesn't work
**Fix:**
- Check browser console for errors
- Verify `/api/tasks/create` endpoint works
- Check `OPENCLAW_API_URL` is set

### Issue: Build fails
**Fix:**
- Check all required env vars are set
- Review build logs for specific error
- Try rebuilding after fixing env vars

### Issue: Database connection fails
**Fix:**
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:5432/db`
- Check database is running
- Test connection with `npx prisma db push`

---

## 📊 METRICS TO MONITOR

After deployment, watch these metrics:

### Platform Metrics
- Deployment success rate
- Build time
- Uptime/downtime

### Application Metrics
- Page load times
- API response times
- Error rates
- User signups
- Tasks created
- Credits purchased

### Database Metrics
- Connection pool usage
- Query performance
- Storage usage

---

## ✅ VERIFICATION COMPLETE!

If you've checked all boxes above, your deployment is **FULLY FUNCTIONAL** and ready for users! 🎉

**Next steps:**
- [ ] Share URL with team
- [ ] Test with real users
- [ ] Set up custom domain (if not done)
- [ ] Configure Stripe with live keys (for production)
- [ ] Set up monitoring/alerting
- [ ] Plan scaling strategy

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Platform:** ☐ Vercel  ☐ Railway  ☐ Render  ☐ Other  
**URL:** _____________  
**Database:** _____________  

**Status:** ☐ All Checks Passed  ☐ Partial  ☐ Failed  

**Notes:**
___________________________________
___________________________________
___________________________________
