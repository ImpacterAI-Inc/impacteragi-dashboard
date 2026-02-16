#!/bin/bash
# Quick DNS Update Script for Cloudflare
# This script updates dashboard.impacteragi.com to point to the EC2 server

set -e

echo "🌐 Cloudflare DNS Update Script"
echo "================================"
echo ""

# Configuration
DOMAIN="impacteragi.com"
SUBDOMAIN="dashboard"
EC2_IP="100.51.128.13"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"

# Check if API credentials are provided
if [ -z "$CLOUDFLARE_API_TOKEN" ] && [ -z "$CLOUDFLARE_API_KEY" ]; then
    echo "❌ ERROR: No Cloudflare credentials found!"
    echo ""
    echo "Please set ONE of the following:"
    echo ""
    echo "Option 1 - API Token (Recommended):"
    echo "  export CLOUDFLARE_API_TOKEN='your-token-here'"
    echo ""
    echo "Option 2 - API Key + Email:"
    echo "  export CLOUDFLARE_API_KEY='your-key-here'"
    echo "  export CLOUDFLARE_EMAIL='manny@impacteragi.com'"
    echo ""
    echo "To get an API token:"
    echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Create Token"
    echo "3. Use 'Edit zone DNS' template"
    echo "4. Select impacteragi.com zone"
    echo ""
    exit 1
fi

# Get Zone ID
echo "📍 Step 1: Finding zone ID for ${DOMAIN}..."

if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    AUTH_HEADER="Authorization: Bearer $CLOUDFLARE_API_TOKEN"
else
    AUTH_HEADER="X-Auth-Key: $CLOUDFLARE_API_KEY"
    EMAIL_HEADER="-H \"X-Auth-Email: $CLOUDFLARE_EMAIL\""
fi

ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}" \
    -H "$AUTH_HEADER" \
    ${EMAIL_HEADER} \
    -H "Content-Type: application/json")

ZONE_ID=$(echo $ZONE_RESPONSE | grep -oP '"id":"\K[^"]+' | head -1)

if [ -z "$ZONE_ID" ]; then
    echo "❌ ERROR: Could not find zone ID for ${DOMAIN}"
    echo "Response: $ZONE_RESPONSE"
    exit 1
fi

echo "✅ Found zone ID: $ZONE_ID"
echo ""

# Get existing DNS record
echo "📍 Step 2: Checking for existing DNS record..."

DNS_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?name=${FULL_DOMAIN}" \
    -H "$AUTH_HEADER" \
    ${EMAIL_HEADER} \
    -H "Content-Type: application/json")

RECORD_ID=$(echo $DNS_RESPONSE | grep -oP '"id":"\K[^"]+' | head -1)

if [ -n "$RECORD_ID" ]; then
    echo "✅ Found existing record: $RECORD_ID"
    echo "   Current content: $(echo $DNS_RESPONSE | grep -oP '"content":"\K[^"]+' | head -1)"
    echo ""
    echo "🔄 Step 3: Updating DNS record..."
    
    UPDATE_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${RECORD_ID}" \
        -H "$AUTH_HEADER" \
        ${EMAIL_HEADER} \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"A\",\"name\":\"${SUBDOMAIN}\",\"content\":\"${EC2_IP}\",\"ttl\":1,\"proxied\":true}")
    
    if echo $UPDATE_RESPONSE | grep -q '"success":true'; then
        echo "✅ DNS record updated successfully!"
    else
        echo "❌ ERROR: Failed to update DNS record"
        echo "Response: $UPDATE_RESPONSE"
        exit 1
    fi
else
    echo "ℹ️  No existing record found, creating new one..."
    echo ""
    echo "🔄 Step 3: Creating DNS record..."
    
    CREATE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
        -H "$AUTH_HEADER" \
        ${EMAIL_HEADER} \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"A\",\"name\":\"${SUBDOMAIN}\",\"content\":\"${EC2_IP}\",\"ttl\":1,\"proxied\":true}")
    
    if echo $CREATE_RESPONSE | grep -q '"success":true'; then
        echo "✅ DNS record created successfully!"
    else
        echo "❌ ERROR: Failed to create DNS record"
        echo "Response: $CREATE_RESPONSE"
        exit 1
    fi
fi

echo ""
echo "🎉 DNS UPDATE COMPLETE!"
echo ""
echo "Updated: ${FULL_DOMAIN} → ${EC2_IP}"
echo "Proxy: Enabled (Cloudflare DDoS protection)"
echo ""
echo "⏱️  DNS propagation typically takes 2-10 minutes"
echo ""
echo "Test with:"
echo "  curl -I https://${FULL_DOMAIN}"
echo ""
echo "Check propagation:"
echo "  https://dnschecker.org/#A/${FULL_DOMAIN}"
echo ""
