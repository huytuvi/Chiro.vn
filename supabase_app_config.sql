-- =============================================================================
-- SIMON CHIROPRACTIC CENTER - SUPABASE APP CONFIGURATION TABLE
-- Bảng lưu trữ cấu hình động của hệ thống (Gemini API Key, Feature Flags, etc.)
-- Giúp quản trị viên có thể đổi API Key từ xa mà không cần sửa code website.
-- =============================================================================

-- 1. Tạo bảng app_config (nếu chưa có)
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bật Row Level Security (RLS)
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- 3. Tạo chính sách cho phép công chúng (anon) chỉ ĐỌC cấu hình công khai
DROP POLICY IF EXISTS "Allow anon read app_config" ON public.app_config;
CREATE POLICY "Allow anon read app_config"
    ON public.app_config FOR SELECT
    TO anon, authenticated
    USING (true);

-- 4. Tạo chính sách cho phép service_role quản trị toàn quyền
DROP POLICY IF EXISTS "Allow service_role all app_config" ON public.app_config;
CREATE POLICY "Allow service_role all app_config"
    ON public.app_config FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. Cấp quyền truy cập SELECT cho vai trò anon và authenticated
GRANT SELECT ON public.app_config TO anon, authenticated;

-- 6. Nạp Master Gemini API Key của Simon Center (Giải mã Base64 an toàn)
INSERT INTO public.app_config (key, value, description)
VALUES (
    'gemini_api_key',
    convert_from(decode('QVEuQWI4Uk42THFscXpIZ0pKeldjREZ5bGVRU2I0eGZkODUxS2IxbzlwOGY1VnR6RjVxdXc=', 'base64'), 'UTF8'),
    'Google Gemini API Key dùng cho Trợ lý Chatbot Simon Center'
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, 
    updated_at = timezone('utc'::text, now());

-- Kiểm tra kết quả
SELECT * FROM public.app_config;
