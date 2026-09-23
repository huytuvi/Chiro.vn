#!/usr/bin/env bash
# Lightweight keep-alive: pings Supabase so a Free-tier project never hits the
# 7-day inactivity pause. Independent of the daily backup (belt-and-suspenders).
set -euo pipefail
cd "$(dirname "$0")"

SUPABASE_URL=$(grep -E '^SUPABASE_URL=' .env | head -1 | cut -d= -f2-)
KEY=$(grep -E '^SUPABASE_ANON_KEY=' .env | head -1 | cut -d= -f2-)
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${KEY:-}" ]; then
  echo "$(date '+%F %T') keepalive FAILED: missing SUPABASE_URL / SUPABASE_ANON_KEY"; exit 1
fi

code=$(curl -s -o /dev/null -w "%{http_code}" -m 30 \
  "$SUPABASE_URL/rest/v1/leads?select=id&limit=1" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY")
echo "$(date '+%F %T') keepalive HTTP $code"
