#!/bin/bash

# ImpacterAGI Dashboard Launch Script

echo "=========================================="
echo "🚀 Starting ImpacterAGI Dashboard"
echo "=========================================="

# Navigate to dashboard directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -q -r requirements.txt

# Create necessary directories
mkdir -p data logs

echo ""
echo "=========================================="
echo "✅ Dashboard Ready!"
echo "=========================================="
echo ""

# Start the application
python3 app.py
