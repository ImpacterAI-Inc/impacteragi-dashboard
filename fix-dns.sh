#!/bin/bash
# DNS Fix for dashboard.impacteragi.com
# Run this if you have a Cloudflare API token with DNS Edit permission

set -e

ZONE_ID="52ee16ebf88e5a5d6ec45a3861cc53fd"
DOMAIN="dashboard.impacteragi.com"
TARGET="impacteragi-dashboard.pages.dev"

echo "🔍 Finding existing DNS records for $DOMAIN..."

# Get current DNS records
RECORDS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$DOMAIN" \
  -H "Authorization: Bearer $CLOUDFLARE_DNS_TOKEN" \
  -H "Content-Type: application/json")

echo "$RECORDS" | jq .

# Extract record IDs for A records
RECORD_IDS=$(echo "$RECORDS" | jq -r '.result[] | select(.type=="A") | .id')

if [ -n "$RECORD_IDS" ]; then
  echo "🗑️  Deleting old A records..."
  for id in $RECORD_IDS; do
    echo "Deleting record $id..."
    curl -s -X DELETE "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$id" \
      -H "Authorization: Bearer $CLOUDFLARE_DNS_TOKEN" \
      -H "Content-Type: application/json" | jq .
  done
else
  echo "ℹ️  No A records found to delete"
fi

echo "➕ Creating CNAME record..."
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_DNS_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "dashboard",
    "content": "'"$TARGET"'",
    "ttl": 1,
    "proxied": true
  }' | jq .

echo "✅ DNS update complete!"
echo ""
echo "🧪 Testing in 10 seconds..."
sleep 10

echo "Testing $DOMAIN..."
curl -I "https://$DOMAIN" 2>&1 | head -15

echo ""
echo "🎉 If you see HTTP/2 200, the fix is working!"
echo "If still 521, wait 1-2 more minutes for DNS propagation."
