#!/bin/bash
# Test script to verify credit persistence fix

echo "================================"
echo "CREDIT PERSISTENCE TEST"
echo "================================"
echo ""

# Start local Cloudflare Pages dev server in background
echo "Starting local server..."
cd /data/.openclaw/workspace/impacteragi-dashboard
npx wrangler pages dev out --port 8788 --compatibility-date=2024-01-01 &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 5

BASE_URL="http://localhost:8788"

echo ""
echo "TEST 1: Create new user account"
echo "-------------------------------"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}')
echo "Response: $SIGNUP_RESPONSE"

# Extract token
TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "❌ FAILED: No token received"
  kill $SERVER_PID
  exit 1
fi

echo ""
echo "TEST 2: Check initial credits (should be 0)"
echo "-------------------------------------------"
USER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/user" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $USER_RESPONSE"

INITIAL_CREDITS=$(echo $USER_RESPONSE | grep -o '"credits":[0-9]*' | cut -d':' -f2)
echo "Credits: $INITIAL_CREDITS"

if [ "$INITIAL_CREDITS" != "0" ]; then
  echo "❌ FAILED: Initial credits should be 0, got $INITIAL_CREDITS"
  kill $SERVER_PID
  exit 1
fi

echo ""
echo "TEST 3: Redeem BETA10K code"
echo "----------------------------"
REDEEM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/redeem" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"BETA10K"}')
echo "Response: $REDEEM_RESPONSE"

REDEEMED_CREDITS=$(echo $REDEEM_RESPONSE | grep -o '"credits":[0-9]*' | cut -d':' -f2)
echo "Credits after redemption: $REDEEMED_CREDITS"

if [ "$REDEEMED_CREDITS" != "10000" ]; then
  echo "❌ FAILED: Should have 10,000 credits, got $REDEEMED_CREDITS"
  kill $SERVER_PID
  exit 1
fi

echo ""
echo "TEST 4: Check credits persistence (GET /api/user)"
echo "-------------------------------------------------"
USER_RESPONSE2=$(curl -s -X GET "$BASE_URL/api/user" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $USER_RESPONSE2"

PERSISTED_CREDITS=$(echo $USER_RESPONSE2 | grep -o '"credits":[0-9]*' | cut -d':' -f2)
echo "Credits from /api/user: $PERSISTED_CREDITS"

if [ "$PERSISTED_CREDITS" != "10000" ]; then
  echo "❌ FAILED: Credits not persisted! Should be 10,000, got $PERSISTED_CREDITS"
  kill $SERVER_PID
  exit 1
fi

echo ""
echo "TEST 5: Submit a task (costs 10 credits)"
echo "----------------------------------------"
TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test task"}')
echo "Response: $TASK_RESPONSE"

TASK_CREDITS=$(echo $TASK_RESPONSE | grep -o '"credits":[0-9]*' | cut -d':' -f2)
echo "Credits after task: $TASK_CREDITS"

if [ "$TASK_CREDITS" != "9990" ]; then
  echo "❌ FAILED: Should have 9,990 credits after task, got $TASK_CREDITS"
  kill $SERVER_PID
  exit 1
fi

echo ""
echo "TEST 6: Verify final credits persistence"
echo "----------------------------------------"
USER_RESPONSE3=$(curl -s -X GET "$BASE_URL/api/user" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $USER_RESPONSE3"

FINAL_CREDITS=$(echo $USER_RESPONSE3 | grep -o '"credits":[0-9]*' | cut -d':' -f2)
echo "Final credits: $FINAL_CREDITS"

if [ "$FINAL_CREDITS" != "9990" ]; then
  echo "❌ FAILED: Final credits should be 9,990, got $FINAL_CREDITS"
  kill $SERVER_PID
  exit 1
fi

echo ""
echo "TEST 7: Prevent double redemption"
echo "----------------------------------"
DOUBLE_REDEEM=$(curl -s -X POST "$BASE_URL/api/redeem" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"BETA10K"}')
echo "Response: $DOUBLE_REDEEM"

if echo "$DOUBLE_REDEEM" | grep -q "already redeemed"; then
  echo "✅ PASS: Double redemption prevented"
else
  echo "❌ FAILED: Should prevent double redemption"
  kill $SERVER_PID
  exit 1
fi

# Clean up
kill $SERVER_PID

echo ""
echo "================================"
echo "✅ ALL TESTS PASSED!"
echo "================================"
echo ""
echo "✅ Users persist across requests"
echo "✅ Credits persist across requests"
echo "✅ Code redemption works"
echo "✅ Task submission deducts credits"
echo "✅ Double redemption prevented"
echo ""
echo "READY FOR PRODUCTION DEPLOYMENT"
