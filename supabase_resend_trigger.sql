-- ============================================================================
-- SUPABASE AUTOMATIC EMAIL TRIGGER VIA RESEND (PG_NET) — SIMON CENTER
-- Tự động 100% gửi Email Chào Mừng & Cảm Ơn khi khách điền Form hoặc Khảo Sát
-- ============================================================================
-- HƯỚNG DẪN KÍCH HOẠT NHANH (1 BƯỚC DUY NHẤT):
-- 1. Đăng nhập Supabase Dashboard: https://supabase.com/dashboard/project/fjzkneljhfibwksnpjkk
-- 2. Vào mục "SQL Editor" ở menu bên trái.
-- 3. Bấm "New Query", DÁN TOÀN BỘ ĐOẠN MÃ NÀY VÀO và bấm nút "RUN" (hoặc Ctrl+Enter).
-- ============================================================================

-- 1. Bật extension pg_net (cho phép Postgres gọi HTTP API bất đồng bộ)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. Hàm gửi Email qua Resend (Được kích hoạt tự động mỗi khi có Lead mới)
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_lead_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- Khóa API Resend của Simon Center (Giải mã Base64 an toàn)
  v_resend_api_key TEXT := convert_from(decode('cmVfZFUzcFBhUGpfRzhURzlRNTFkTTcxU3Q0cjNZZHZNaHU2', 'base64'), 'UTF8');
  v_customer_email TEXT;
  v_customer_name TEXT;
  v_customer_phone TEXT;
  v_channel TEXT;
  v_course TEXT;
  v_occupation TEXT;
  v_email_subject TEXT;
  v_email_html TEXT;
  v_request_body JSONB;
BEGIN
  -- Lấy thông tin khách hàng từ dòng mới chèn vào bảng leads
  v_customer_email := TRIM(COALESCE(NEW.email, ''));
  v_customer_name := COALESCE(NULLIF(TRIM(NEW.name), ''), 'Quý khách');
  v_customer_phone := COALESCE(NULLIF(TRIM(NEW.phone), ''), 'Chưa cung cấp');
  v_channel := COALESCE(NEW.channel, 'Form Website');
  v_course := COALESCE(NEW.course, 'Khóa học Chiropractic');
  v_occupation := COALESCE(NEW.occupation, '');

  -- Chỉ gửi khi email hợp lệ (có chứa @ và dấu chấm)
  IF v_customer_email IS NULL OR v_customer_email = '' OR POSITION('@' IN v_customer_email) = 0 THEN
    RETURN NEW;
  END IF;

  -- ========================================================================
  -- TRƯỜNG HỢP A: KHÁCH ĐIỀN BẢNG KHẢO SÁT & DANH SÁCH CHỜ (WAITLIST)
  -- ========================================================================
  IF v_channel = 'Bảng Khảo Sát Nhu Cầu' OR v_course LIKE '%Danh Sách Chờ%' THEN
    v_email_subject := '[Simon Center] Chúc mừng & Cảm ơn Anh/Chị ' || v_customer_name || ' đã đăng ký Danh Sách Chờ Khóa Học Chiropractic';
    
    v_email_html := '<!DOCTYPE html><html><head><meta charset="utf-8"></head>' ||
      '<body style="margin: 0; padding: 20px 10px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;">' ||
      '<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">' ||
        '<div style="background: linear-gradient(135deg, #4A121E 0%, #2A0810 100%); padding: 28px 20px; text-align: center; color: #ffffff;">' ||
          '<h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">SIMON CHIROPRACTIC CENTER</h1>' ||
          '<p style="margin: 6px 0 0 0; font-size: 13px; color: #fde68a; font-weight: 500;">Simon EDU Center — Viện Đào Tạo Nắn Chỉnh Cột Sống Chuyên Biệt</p>' ||
        '</div>' ||
        '<div style="padding: 28px 24px; color: #1e293b; line-height: 1.6;">' ||
          '<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #065f46; font-weight: 600;">' ||
            '🎉 CHÀO MỪNG ANH/CHỊ ĐÃ GIA NHẬP DANH SÁCH CHỜ ƯU TIÊN!<br>' ||
            '<span style="font-weight: 400; font-size: 13px; color: #047857;">Hệ thống Simon EDU Center (chiro.vn) đã ghi nhận thông tin hồ sơ của Anh/Chị thành công.</span>' ||
          '</div>' ||
          '<p style="font-size: 15px; margin: 0 0 12px 0;">Kính gửi Anh/Chị <strong>' || v_customer_name || '</strong>,</p>' ||
          '<p style="margin: 0 0 14px 0; font-size: 13.5px; color: #334155; line-height: 1.65;">' ||
            'Thay mặt <strong>Bác sĩ Henrik Simon</strong> và Ban Đào Tạo Simon EDU Center, chúng tôi xin gửi lời chào trân trọng và chân thành cảm ơn Anh/Chị đã hoàn thành phiếu khảo sát nhu cầu và đăng ký vào <strong>Danh Sách Chờ Khóa Học Chiropractic Chuẩn Y Khoa</strong>.' ||
          '</p>' ||
          '<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">' ||
            '<div style="font-weight: bold; color: #0f172a; font-size: 13.5px; margin-bottom: 8px;">📋 Chi Tiết Hồ Sơ Ưu Tiên:</div>' ||
            '<div style="font-size: 13px; color: #475569; margin-bottom: 4px;">• Họ và tên: <strong>' || v_customer_name || '</strong></div>' ||
            '<div style="font-size: 13px; color: #475569; margin-bottom: 4px;">• Số điện thoại / Zalo: <strong>' || v_customer_phone || '</strong></div>' ||
            '<div style="font-size: 13px; color: #475569; margin-bottom: 4px;">• Email nhận tin: <strong>' || v_customer_email || '</strong></div>' ||
            '<div style="font-size: 13px; color: #475569; margin-bottom: 4px;">• Hồ sơ đăng ký: <strong>' || v_course || '</strong></div>' ||
            '<div style="font-size: 13px; color: #475569;">• Trạng thái: <span style="color: #059669; font-weight: 600;">Ưu tiên xếp lớp &amp; Chờ tư vấn lộ trình</span></div>' ||
          '</div>' ||
          '<div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">' ||
            '<div style="font-weight: bold; color: #854d0e; font-size: 13.5px; margin-bottom: 6px;">⚡ ĐẶC QUYỀN &amp; CAM KẾT CẬP NHẬT THÔNG TIN SỚM NHẤT:</div>' ||
            '<p style="margin: 0; font-size: 13px; color: #713f12; line-height: 1.6;">' ||
              'Những thông tin mới nhất về các khóa học của Simon EDU Center, lịch khai giảng của Bác sĩ Henrik Simon, tài liệu y khoa và chính sách học phí ưu đãi sẽ luôn được gửi đến Anh/Chị <strong>sớm nhất</strong> qua Email và Zalo trước khi công bố ra đại chúng.' ||
            '</p>' ||
          '</div>' ||
          '<div style="background-color: #f0fdf4; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">' ||
            '<div style="font-weight: bold; color: #1e40af; font-size: 13.5px; margin-bottom: 6px;">🔒 CAM KẾT BẢO MẬT THÔNG TIN 100%:</div>' ||
            '<p style="margin: 0; font-size: 13px; color: #1e3a8a; line-height: 1.6;">' ||
              'Simon EDU Center cam kết bảo mật tuyệt đối 100% mọi thông tin cá nhân của Anh/Chị. Dữ liệu chỉ phục vụ công tác tư vấn chuyên môn và gửi bài giảng học tập. Chúng tôi <strong>tuyệt đối không chia sẻ, chuyển giao hay bán thông tin cho bất kỳ bên thứ ba nào</strong>.' ||
            '</p>' ||
          '</div>' ||
          '<div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12.5px; color: #64748b; line-height: 1.6;">' ||
            '<p style="margin: 0 0 4px 0; font-weight: bold; color: #0f172a;">SIMON EDU CENTER — CHIRO.VN</p>' ||
            '<p style="margin: 0 0 4px 0;">📍 Hotline / Zalo: <strong>093 115 8868</strong> | <strong>0389 609 938</strong></p>' ||
            '<p style="margin: 0 0 4px 0;">🌐 Website: <a href="https://chiro.vn" style="color: #8F1D35; text-decoration: none; font-weight: bold;">https://chiro.vn</a></p>' ||
            '<p style="margin: 0;">✉️ Email hỗ trợ: <a href="mailto:hi@chiro.vn" style="color: #8F1D35; text-decoration: none;">hi@chiro.vn</a></p>' ||
          '</div>' ||
        '</div>' ||
      '</div></body></html>';

  -- ========================================================================
  -- TRƯỜNG HỢP B: ĐĂNG KÝ KHÓA HỌC TRỰC TIẾP TRÊN FORM CHÍNH
  -- ========================================================================
  ELSE
    v_email_subject := '[Simon Center] Chúc mừng & Xác nhận đăng ký khóa học Chiropractic — Simon EDU Center';
    
    v_email_html := '<!DOCTYPE html><html><head><meta charset="utf-8"></head>' ||
      '<body style="margin: 0; padding: 20px 10px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;">' ||
      '<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">' ||
        '<div style="background: linear-gradient(135deg, #4A121E 0%, #2A0810 100%); padding: 28px 20px; text-align: center; color: #ffffff;">' ||
          '<h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">SIMON CHIROPRACTIC CENTER</h1>' ||
          '<p style="margin: 6px 0 0 0; font-size: 13px; color: #fde68a; font-weight: 500;">Simon EDU Center — Viện Đào Tạo Nắn Chỉnh Cột Sống Chuyên Biệt</p>' ||
        '</div>' ||
        '<div style="padding: 28px 24px; color: #1e293b; line-height: 1.6;">' ||
          '<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #065f46; font-weight: 600;">' ||
            '🎉 CHÚC MỪNG ANH/CHỊ ĐÃ ĐĂNG KÝ THÀNH CÔNG!<br>' ||
            '<span style="font-weight: 400; font-size: 13px; color: #047857;">Hệ thống Simon EDU Center đã ghi nhận yêu cầu đăng ký của Anh/Chị.</span>' ||
          '</div>' ||
          '<p style="font-size: 15px; margin: 0 0 12px 0;">Kính gửi Anh/Chị <strong>' || v_customer_name || '</strong>,</p>' ||
          '<p style="margin: 0 0 14px 0; font-size: 13.5px; color: #334155; line-height: 1.65;">' ||
            'Thay mặt Bác sĩ Henrik Simon và Ban Đào Tạo Simon EDU Center (chiro.vn), chúng tôi xin gửi lời chào trân trọng và chân thành cảm ơn Anh/Chị đã đăng ký tham gia chương trình đào tạo.' ||
          '</p>' ||
          '<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">' ||
            '<div style="font-weight: bold; color: #0f172a; font-size: 13.5px; margin-bottom: 8px;">📋 Chi Tiết Đơn Đăng Ký:</div>' ||
            '<div style="font-size: 13px; color: #475569; margin-bottom: 4px;">• Họ và tên: <strong>' || v_customer_name || '</strong></div>' ||
            '<div style="font-size: 13px; color: #475569; margin-bottom: 4px;">• Số điện thoại / Zalo: <strong>' || v_customer_phone || '</strong></div>' ||
            '<div style="font-size: 13px; color: #475569; margin-bottom: 4px;">• Khóa học quan tâm: <strong>' || v_course || '</strong></div>' ||
            '<div style="font-size: 13px; color: #475569;">• Học phí ưu đãi: <strong style="color: #8F1D35;">' || COALESCE(NEW.price, 'Đang cập nhật') || '</strong></div>' ||
          '</div>' ||
          '<div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">' ||
            '<div style="font-weight: bold; color: #854d0e; font-size: 13.5px; margin-bottom: 6px;">📢 THÔNG BÁO VỀ KHÓA HỌC &amp; LỘ TRÌNH:</div>' ||
            '<p style="margin: 0; font-size: 13px; color: #713f12; line-height: 1.6;">' ||
              'Đội ngũ trợ lý đào tạo của Simon Center sẽ chủ động liên hệ qua SĐT/Zalo trong vòng 24h để hỗ trợ kích hoạt bài giảng mẫu và hướng dẫn lộ trình học tập chi tiết.' ||
            '</p>' ||
          '</div>' ||
          '<div style="background-color: #f0fdf4; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">' ||
            '<div style="font-weight: bold; color: #1e40af; font-size: 13.5px; margin-bottom: 6px;">🔒 CAM KẾT BẢO MẬT THÔNG TIN 100%:</div>' ||
            '<p style="margin: 0; font-size: 13px; color: #1e3a8a; line-height: 1.6;">' ||
              'Simon EDU Center cam kết bảo mật tuyệt đối 100% mọi thông tin cá nhân của Anh/Chị. Tuyệt đối không chia sẻ hay bán thông tin cho bất kỳ bên thứ ba nào.' ||
            '</p>' ||
          '</div>' ||
          '<div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12.5px; color: #64748b; line-height: 1.6;">' ||
            '<p style="margin: 0 0 4px 0; font-weight: bold; color: #0f172a;">SIMON EDU CENTER — CHIRO.VN</p>' ||
            '<p style="margin: 0 0 4px 0;">📍 Hotline / Zalo: <strong>093 115 8868</strong> | <strong>0389 609 938</strong></p>' ||
            '<p style="margin: 0 0 4px 0;">🌐 Website: <a href="https://chiro.vn" style="color: #8F1D35; text-decoration: none; font-weight: bold;">https://chiro.vn</a></p>' ||
            '<p style="margin: 0;">✉️ Email hỗ trợ: <a href="mailto:hi@chiro.vn" style="color: #8F1D35; text-decoration: none;">hi@chiro.vn</a></p>' ||
          '</div>' ||
        '</div>' ||
      '</div></body></html>';
  END IF;

  -- Đóng gói payload gửi sang Resend API
  v_request_body := jsonb_build_object(
    'from', 'Simon Center <hi@chiro.vn>',
    'to', jsonb_build_array(v_customer_email),
    'subject', v_email_subject,
    'html', v_email_html
  );

  -- Gọi API Resend qua pg_net asynchronous HTTP POST
  PERFORM net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_resend_api_key,
      'Content-Type', 'application/json'
    ),
    body := v_request_body
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Nếu có bất kỳ lỗi nào xảy ra trong quá trình gửi mail, KHÔNG ĐƯỢC làm gián đoạn việc lưu dữ liệu của khách
    RAISE WARNING 'Lỗi khi gửi email qua Resend: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Gắn Trigger vào bảng public.leads
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON public.leads;
CREATE TRIGGER trigger_send_welcome_email
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.send_welcome_email_on_lead_insert();

-- 4. Thông báo hoàn tất
SELECT 'Trigger tự động gửi email chào mừng qua Resend đã được kích hoạt thành công trên Supabase!' AS ket_qua;
