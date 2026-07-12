#!/bin/sh
# Performance benchmark for EPG XML endpoints
BASE="${1:-http://localhost:3000}"
COUNTRIES="de us gb fr"

echo "FreeEPG Benchmark — $BASE"
echo "========================="

for cc in $COUNTRIES; do
  START=$(date +%s%3N)
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/epg/$cc.xml.gz" -H "Accept-Encoding: gzip")
  END=$(date +%s%3N)
  MS=$((END - START))
  echo "$cc.xml.gz — ${MS}ms — HTTP $STATUS"
done

echo ""
echo "Health check:"
curl -s "$BASE/api/health" | head -c 200
echo ""
