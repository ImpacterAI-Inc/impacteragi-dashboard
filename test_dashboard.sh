#!/bin/bash

# ImpacterAGI Dashboard - Quick Test Script

echo "🧪 Testing ImpacterAGI Dashboard..."
echo ""

# Check Python version
echo "✅ Checking Python version..."
python3 --version || { echo "❌ Python 3 not found"; exit 1; }

# Check if in correct directory
if [ ! -f "app.py" ]; then
    echo "❌ Not in dashboard directory"
    echo "Run: cd /data/.openclaw/workspace/impacteragi-dashboard"
    exit 1
fi

echo "✅ In correct directory"

# Check all required files
echo ""
echo "✅ Checking required files..."
files=(
    "app.py"
    "config.py"
    "auth.py"
    "system_manager.py"
    "requirements.txt"
    ".env"
    "templates/login.html"
    "templates/dashboard.html"
    "static/css/style.css"
    "static/js/dashboard.js"
)

missing=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file MISSING"
        missing=$((missing + 1))
    fi
done

if [ $missing -gt 0 ]; then
    echo ""
    echo "❌ $missing files missing!"
    exit 1
fi

echo ""
echo "✅ All files present"

# Check if virtual environment exists
echo ""
if [ -d "venv" ]; then
    echo "✅ Virtual environment found"
else
    echo "⚠️  Virtual environment not found (will be created on first run)"
fi

# Check port availability
echo ""
echo "✅ Checking if port 5000 is available..."
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 5000 is in use"
    echo "   Either stop the running service or change FLASK_PORT in .env"
else
    echo "✅ Port 5000 is available"
fi

# Show configuration
echo ""
echo "📋 Current Configuration:"
echo "========================="
grep "ADMIN_EMAIL=" .env | cut -d= -f2 | sed 's/^/  Username: /'
echo "  Password: (check .env file)"
grep "FLASK_PORT=" .env | cut -d= -f2 | sed 's/^/  Port: /' || echo "  Port: 5000 (default)"

# Get IP address
echo ""
echo "🌐 Access URLs:"
echo "=============="
echo "  Local:   http://localhost:5000"
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -n "$IP" ]; then
    echo "  Network: http://$IP:5000"
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "🚀 Ready to start!"
echo ""
echo "Run: ./start_dashboard.sh"
echo ""
