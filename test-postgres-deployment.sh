#!/bin/bash

set -e

echo "🚀 ImpacterAGI Dashboard - PostgreSQL Deployment Test"
echo "=================================================="
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Stop any running containers
echo "🛑 Stopping any existing containers..."
docker-compose -f docker-compose-postgres.yml down -v 2>/dev/null || true

# Build and start
echo "🔨 Building and starting services..."
docker-compose -f docker-compose-postgres.yml up -d --build

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if ! docker-compose -f docker-compose-postgres.yml ps | grep -q "Up"; then
    echo "❌ Services failed to start. Check logs:"
    docker-compose -f docker-compose-postgres.yml logs
    exit 1
fi

echo "✅ Services are running!"
echo ""

# Get the app URL
APP_URL="http://localhost:3000"
echo "🌐 Dashboard URL: $APP_URL"
echo ""

# Run tests
echo "🧪 Running automated tests..."
echo ""

sleep 3

# Test 1: Health check
echo "Test 1: Health check..."
if curl -s -o /dev/null -w "%{http_code}" "$APP_URL" | grep -q "200"; then
    echo "✅ Dashboard is accessible"
else
    echo "❌ Dashboard is not accessible"
    docker-compose -f docker-compose-postgres.yml logs app
    exit 1
fi

# Test 2: Signup
echo ""
echo "Test 2: User Signup..."
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123"

SIGNUP_RESPONSE=$(curl -s -X POST "$APP_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ Signup successful! Token: ${TOKEN:0:20}..."
else
    echo "❌ Signup failed"
    echo "Response: $SIGNUP_RESPONSE"
    exit 1
fi

# Test 3: Code Redemption
echo ""
echo "Test 3: Redeem BETA10K code..."
REDEEM_RESPONSE=$(curl -s -X POST "$APP_URL/api/redeem" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"code":"BETA10K"}')

CREDITS=$(echo $REDEEM_RESPONSE | grep -o '"credits":[0-9]*' | cut -d':' -f2)

if [ "$CREDITS" = "10000" ]; then
    echo "✅ Code redeemed! Credits: $CREDITS"
else
    echo "❌ Code redemption failed"
    echo "Response: $REDEEM_RESPONSE"
    exit 1
fi

# Test 4: Persistence Check (Login again)
echo ""
echo "Test 4: Login and check credits persist..."
LOGIN_RESPONSE=$(curl -s -X POST "$APP_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

LOGIN_CREDITS=$(echo $LOGIN_RESPONSE | grep -o '"credits":[0-9]*' | cut -d':' -f2)

if [ "$LOGIN_CREDITS" = "10000" ]; then
    echo "✅ Credits persist! Still showing: $LOGIN_CREDITS"
else
    echo "❌ Credits did not persist"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 5: Task Submission
echo ""
echo "Test 5: Submit task and verify credit deduction..."
TASK_RESPONSE=$(curl -s -X POST "$APP_URL/api/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"description":"Test task for credit deduction"}')

TASK_CREDITS=$(echo $TASK_RESPONSE | grep -o '"credits":[0-9]*' | cut -d':' -f2)

if [ "$TASK_CREDITS" = "9990" ]; then
    echo "✅ Task submitted! Credits deducted to: $TASK_CREDITS"
else
    echo "❌ Task submission failed or credits not deducted correctly"
    echo "Response: $TASK_RESPONSE"
    exit 1
fi

# Test 6: Final persistence check
echo ""
echo "Test 6: Final persistence check (login after task)..."
FINAL_LOGIN=$(curl -s -X POST "$APP_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

FINAL_CREDITS=$(echo $FINAL_LOGIN | grep -o '"credits":[0-9]*' | cut -d':' -f2)

if [ "$FINAL_CREDITS" = "9990" ]; then
    echo "✅ Final check passed! Credits still: $FINAL_CREDITS"
else
    echo "❌ Final persistence check failed"
    echo "Response: $FINAL_LOGIN"
    exit 1
fi

echo ""
echo "=================================================="
echo "🎉 ALL TESTS PASSED!"
echo "=================================================="
echo ""
echo "✅ User signup works"
echo "✅ Login persists sessions"
echo "✅ Code redemption adds 10,000 credits"
echo "✅ Credits persist across logins"
echo "✅ Task submission deducts credits (10 → 9,990)"
echo "✅ Credits survive server operations"
echo ""
echo "📊 PostgreSQL is WORKING and persisting data!"
echo ""
echo "Dashboard is running at: $APP_URL"
echo "Test user: $TEST_EMAIL"
echo "Test password: $TEST_PASSWORD"
echo ""
echo "To stop the services, run:"
echo "  docker-compose -f docker-compose-postgres.yml down"
echo ""
echo "To view logs, run:"
echo "  docker-compose -f docker-compose-postgres.yml logs -f"
