#!/usr/bin/env bash
# Restore the Supabase `leads` table from a backup file (JSON) — "break glass" tool.
# Upserts on primary key `id` (no duplicates). Runs ONLY when you confirm.
#
# Usage:
#   ./supabase_restore.sh                 # preview: show latest backup + row count
#   ./supabase_restore.sh --yes           # restore from the LATEST backup
#   ./supabase_restore.sh <file.json> --yes   # restore from a specific backup file
set -euo pipefail
cd "$(dirname "$0")"

DIR="./supabase_backup"
SUPABASE_URL=$(grep -E '^SUPABASE_URL=' .env | head -1 | cut -d= -f2-)
KEY=$(grep -E '^SUPABASE_ANON_KEY=' .env | head -1 | cut -d= -f2-)
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${KEY:-}" ]; then
  echo "❌ Thiếu SUPABASE_URL / SUPABASE_ANON_KEY trong .env"; exit 1
fi

# Resolve args: file (optional) + --yes (optional, any position)
FILE=""; CONFIRM=""
for a in "$@"; do
  case "$a" in
    --yes) CONFIRM="yes" ;;
    *.json) FILE="$a" ;;
  esac
done
[ -n "$FILE" ] || FILE=$(ls -1t "$DIR"/leads_*.json 2>/dev/null | head -1 || true)
[ -n "$FILE" ] && [ -f "$FILE" ] || { echo "❌ Không tìm thấy file backup (.json) trong $DIR"; exit 1; }

ROWS=$(grep -o '"id":' "$FILE" | wc -l | tr -d ' ')

if [ "$CONFIRM" != "yes" ]; then
  echo "📦 File backup: $FILE"
  echo "📊 Số dòng sẽ đổ vào Supabase: $ROWS (upsert theo id — KHÔNG trùng)"
  echo ""
  echo "➡️  Để thực hiện khôi phục, chạy lại lệnh:"
  echo "    $0 \"$FILE\" --yes"
  exit 0
fi

echo "⏳ Đang khôi phục $ROWS dòng từ $FILE vào Supabase..."
HTTP=$(curl -s -o /tmp/supabase_restore_resp.txt -w "%{http_code}" -m 120 \
  -X POST "$SUPABASE_URL/rest/v1/leads?on_conflict=id" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates,return=minimal" \
  --data-binary "@$FILE")

if [ "$HTTP" = "200" ] || [ "$HTTP" = "201" ] || [ "$HTTP" = "204" ]; then
  echo "✅ Khôi phục thành công ($ROWS dòng, HTTP $HTTP)."
  echo "ℹ️  Nếu sẽ tạo ĐƠN MỚI sau khi restore, vào Supabase SQL Editor chạy 1 lần để đồng bộ bộ đếm id:"
  echo "    SELECT setval(pg_get_serial_sequence('leads','id'), (SELECT COALESCE(MAX(id),1) FROM leads));"
else
  echo "❌ Lỗi (HTTP $HTTP):"; cat /tmp/supabase_restore_resp.txt; echo
  echo "Gợi ý: nếu 401/403 khi bảng còn dữ liệu cũ (anon không được UPDATE), restore hoạt động tốt nhất khi bảng trống (mất data)."
  exit 1
fi
