-- ============================================================================
-- SUPABASE AUTOMATIC WELCOME EMAIL TRIGGER VIA RESEND (PG_NET)
-- ============================================================================
-- Hướng dẫn kích hoạt trên Supabase:
-- 1. Vào Supabase Dashboard -> Project của bạn -> SQL Editor.
-- 2. Thay 'YOUR_RESEND_API_KEY' bằng API key Resend của bạn (bắt đầu bằng re_...).
-- 3. Bấm RUN để thực thi.
-- 4. Mỗi khi có dòng mới được thêm vào bảng 'leads' (Đăng ký form hoặc Khảo sát),
--    Supabase sẽ tự động gọi API Resend để gửi Email chúc mừng & cảm ơn đến khách hàng!
-- ============================================================================

-- Bật extension pg_net (nếu chưa bật)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Tạo hàm gửi Email qua Resend
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_lead_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- Thay khóa API Resend của bạn vào đây:
  v_resend_api_key TEXT := 'YOUR_RESEND_API_KEY';
  v_customer_email TEXT;
  v_customer_name TEXT;
  v_course_or_channel TEXT;
  v_email_subject TEXT;
  v_email_html TEXT;
  v_request_body JSONB;
BEGIN
  -- Lấy thông tin khách hàng từ dòng mới chèn
  v_customer_email := TRIM(COALESCE(NEW.email, ''));
  v_customer_name := COALESCE(NEW.name, 'Quý học viên');
  v_course_or_channel := COALESCE(NEW.course, NEW.channel, 'Khóa học Chiropractic');

  -- Chỉ gửi khi email hợp lệ (có chứa @ và dấu chấm)
  IF v_customer_email IS NULL OR v_customer_email = '' OR POSITION('@' IN v_customer_email) = 0 THEN
    RETURN NEW;
  END IF;

  -- Tiêu đề Email
  v_email_subject := '[Simon Center] Chào mừng & Cảm ơn Anh/Chị ' || v_customer_name || ' đã quan tâm khóa học Chiropractic — Simon EDU Center';

  -- Nội dung Email HTML chuẩn Y khoa & Chuyên nghiệp
  v_email_html := '<!DOCTYPE html>' ||
    '<html><head><meta charset="utf-8"></head>' ||
    '<body style="margin: 0; padding: 20px 10px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;">' ||
    '<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">' ||
      '<div style="background: linear-gradient(135deg, #4A121E 0%, #2A0810 100%); padding: 28px 20px; text-align: center; color: #ffffff;">' ||
        '<h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">SIMON CHIROPRACTIC CENTER</h1>' ||
        '<p style="margin: 6px 0 0 0; font-size: 13px; color: #fde68a; font-weight: 500;">Simon EDU Center — Viện Đào Tạo Nắn Chỉnh Cột Sống Chuyên Biệt</p>' ||
      '</div>' ||
      '<div style="padding: 28px 24px; color: #1e293b; line-height: 1.6;">' ||
        '<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #065f46; font-weight: 600;">' ||
          '🎉 CHÀO MỪNG & CẢM ƠN ANH/CHỊ ĐÃ ĐĂNG KÝ THÀNH CÔNG!<br>' ||
          '<span style="font-weight: 400; font-size: 13px; color: #047857;">Hệ thống Simon EDU Center đã ghi nhận thông tin quan tâm khóa học của Anh/Chị.</span>' ||
        '</div>' ||
        '<p style="font-size: 15px; margin: 0 0 12px 0;">Kính gửi Anh/Chị <strong>' || v_customer_name || '</strong>,</p>' ||
        '<p style="margin: 0 0 14px 0; font-size: 13.5px; color: #334155; line-height: 1.65;">' ||
          'Thay mặt Bác sĩ Henrik Simon và Ban Đào Tạo Simon EDU Center (chiro.vn), chúng tôi xin gửi lời chào trân trọng và chân thành cảm ơn Anh/Chị đã quan tâm đến chương trình đào tạo Nắn chỉnh Cột sống Chiropractic chuẩn Y khoa.' ||
        '</p>' ||
        '<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">' ||
          '<div style="font-weight: bold; color: #0f172a; font-size: 13.5px; margin-bottom: 8px;">📋 Thông tin ghi nhận:</div>' ||
          '<div style="font-size: 13px; color: #475569; margin-bottom: 4px;">• Họ và tên: <strong>' || v_customer_name || '</strong></div>' ||
          '<div style="font-size: 13px; color: #475569; margin-bottom: 4px;">• Số điện thoại / Zalo: <strong>' || COALESCE(NEW.phone, 'Chưa cung cấp') || '</strong></div>' ||
          '<div style="font-size: 13px; color: #475569; margin-bottom: 4px;">• Khóa học / Chương trình: <strong>' || v_course_or_channel || '</strong></div>' ||
          '<div style="font-size: 13px; color: #475569;">• Trạng thái hồ sơ: <span style="color: #059669; font-weight: 600;">' || COALESCE(NEW.status, 'Đã tiếp nhận') || '</span></div>' ||
        '</div>' ||
        '<div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">' ||
          '<div style="font-weight: bold; color: #854d0e; font-size: 13.5px; margin-bottom: 6px;">📢 CẬP NHẬT THÔNG TIN MỚI NHẤT DÀNH CHO BẠN:</div>' ||
          '<p style="margin: 0; font-size: 13px; color: #713f12; line-height: 1.6;">' ||
            'Anh/Chị sẽ luôn là những người đầu tiên được cung cấp những thông tin mới nhất về các khóa học của Simon EDU Center, lịch khai giảng, bộ tài liệu y khoa và ưu đãi đào tạo sớm nhất.' ||
          '</p>' ||
        '</div>' ||
        '<div style="background-color: #f0fdf4; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">' ||
          '<div style="font-weight: bold; color: #1e40af; font-size: 13.5px; margin-bottom: 6px;">🔒 CAM KẾT BẢO MẬT THÔNG TIN 100%:</div>' ||
          '<p style="margin: 0; font-size: 13px; color: #1e3a8a; line-height: 1.6;">' ||
            'Simon EDU Center cam kết bảo mật tuyệt đối 100% mọi thông tin cá nhân của Anh/Chị. Thông tin chỉ được sử dụng cho mục đích đào tạo và tư vấn lộ trình học tập.' ||
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

  -- Đóng gói payload gửi sang Resend API
  v_request_body := jsonb_build_object(
    'from', 'Simon EDU Center <hi@chiro.vn>',
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
    -- Nếu có lỗi mạng hoặc API, không chặn quá trình insert của khách
    RAISE WARNING 'Lỗi khi gửi email qua Resend: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Gắn Trigger vào bảng leads
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON public.leads;
CREATE TRIGGER trigger_send_welcome_email
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.send_welcome_email_on_lead_insert();
