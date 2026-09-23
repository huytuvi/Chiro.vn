#!/usr/bin/env bash
# Daily backup of the Supabase `leads` table -> ./supabase_backup/ (JSON + CSV).
# Keeps only the 2 most recent backups of each type; older ones are deleted.
set -euo pipefail
cd "$(dirname "$0")"

DIR="./supabase_backup"
mkdir -p "$DIR"

# Read Supabase config from .env (no shell-sourcing, safe against special chars)
SUPABASE_URL=$(grep -E '^SUPABASE_URL=' .env | head -1 | cut -d= -f2-)
KEY=$(grep -E '^SUPABASE_ANON_KEY=' .env | head -1 | cut -d= -f2-)
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${KEY:-}" ]; then
  echo "$(date '+%F %T') FAILED: missing SUPABASE_URL / SUPABASE_ANON_KEY in .env"; exit 1
fi

TS=$(date '+%Y%m%d_%H%M%S')
JSON="$DIR/leads_$TS.json"
CSV="$DIR/leads_$TS.csv"
Q="$SUPABASE_URL/rest/v1/leads?select=*&order=created_at.asc"

# 1) JSON
curl -s -m 60 "$Q" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -o "$JSON"
# validate: a good response is a JSON array starting with '['
if ! head -c1 "$JSON" 2>/dev/null | grep -q '\['; then
  echo "$(date '+%F %T') FAILED: invalid response, keeping old backups"; rm -f "$JSON"; exit 1
fi

# 2) CSV (Supabase returns CSV with Accept: text/csv)
curl -s -m 60 "$Q" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Accept: text/csv" -o "$CSV"

# 3) Retention: keep only the 2 newest of each type, delete the rest
ls -1t "$DIR"/leads_*.json 2>/dev/null | tail -n +3 | xargs -r rm -f
ls -1t "$DIR"/leads_*.csv  2>/dev/null | tail -n +3 | xargs -r rm -f

echo "$(date '+%F %T') OK -> $JSON ($(wc -c < "$JSON") bytes)"
