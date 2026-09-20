-- =============================================================================
-- SIMON CHIROPRACTIC CENTER – SUPABASE MIGRATION
-- Thêm cột: priority_code, summary_code, payment_code, goal, experience, format
-- vào bảng public.leads để hỗ trợ Danh Sách Chờ & Mã Chuyển Tiền
-- =============================================================================
-- HƯỚNG DẪN:
--   1. Mở Supabase Dashboard → SQL Editor
--   2. Copy toàn bộ script này, dán vào và bấm Run (Cmd/Ctrl + Enter)
-- =============================================================================

-- 1. Thêm các cột mới (IF NOT EXISTS để an toàn, không lỗi nếu đã tồn tại)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS priority_code TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS summary_code  TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_code  TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS goal          TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS experience    TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS format        TEXT;

-- 2. Backfill dữ liệu cũ từ các cột occupation/course cho các bản ghi Danh Sách Chờ
UPDATE public.leads
SET    priority_code = (regexp_match(course, 'WL[0-9]{12}'))[1]
WHERE  priority_code IS NULL
  AND  course ~* 'WL[0-9]{12}';

UPDATE public.leads
SET    summary_code = (regexp_match(
         COALESCE(course, '') || ' ' || COALESCE(occupation, ''),
         '\[MT:[0-9]\|KN:[0-9]\|HT:[0-9]\]'
       ))[1]
WHERE  summary_code IS NULL
  AND  (course ~* '\[MT:[0-9]\|KN:[0-9]\|HT:[0-9]\]'
        OR occupation ~* '\[MT:[0-9]\|KN:[0-9]\|HT:[0-9]\]');

UPDATE public.leads
SET    payment_code = email_status
WHERE  payment_code IS NULL
  AND  email_status ~* '^SCC[0-9]+';

-- 3. Cấp quyền đọc/ghi cho anon
GRANT SELECT, INSERT, UPDATE ON public.leads TO anon, authenticated;

-- 4. Kiểm tra kết quả
SELECT id, name, channel, priority_code, summary_code, payment_code
FROM   public.leads
ORDER  BY id DESC
LIMIT  10;
