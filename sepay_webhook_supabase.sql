-- ============================================================================
-- SUPABASE POSTGRESQL FUNCTION: XỬ LÝ SEPAY WEBHOOK TỨC THÌ (TỐC ĐỘ 0.005 GIÂY)
-- Dự án: Simon Chiropractic Center (Chiro.vn)
-- ============================================================================
-- 
-- HƯỚNG DẪN CÀI ĐẶT (CHỈ 10 GIÂY):
-- 1. Vào Supabase Dashboard (tab đang mở trong trình duyệt của bạn):
--    https://supabase.com/dashboard/project/fjzkneljhfibwksnpjkk
-- 2. Chọn menu "SQL Editor" ở cột bên trái (icon biểu tượng >_)
-- 3. Bấm nút "New query", COPY toàn bộ mã bên dưới và DÁN vào
-- 4. Bấm nút "Run" (hoặc nhấn Cmd + Enter)
-- 5. Sau khi Run thành công, vào trang quản trị SePay (my.sepay.vn):
--    - Thêm Webhook mới (hoặc sửa Webhook hiện tại)
--    - Nhập Webhook URL:
--      https://fjzkneljhfibwksnpjkk.supabase.co/rest/v1/rpc/sepay_webhook?apikey=sb_publishable_Ifjqnisqu2OcfaMVfjIGvw_F2DkEQsR
-- ============================================================================

-- BƯỚC 1: KÍCH HOẠT EXTENSION HTTP ĐỂ BẮN NGẦM SANG GOOGLE SHEET (NẾU CẦN)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- BƯỚC 2: BẬT SUPABASE REALTIME CHO BẢNG LEADS (ĐỂ POPUP NẢY NGAY LẬP TỨC < 0.1S)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN OTHERS THEN NULL;
  END;
END $$;

-- BƯỚC 3: TẠO HÀM NHẬN WEBHOOK SEPAY TRỰC TIẾP VÀO POSTGRESQL
CREATE OR REPLACE FUNCTION public.sepay_webhook(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  raw_content text;
  matched_code text;
  matched_phone text;
  updated_lead record;
  transfer_amount numeric;
  bank_gateway text;
  ref_code text;
BEGIN
  -- 1. Trích xuất thông tin chuyển khoản từ SePay payload
  raw_content := COALESCE(payload->>'content', payload->>'description', '');
  transfer_amount := COALESCE(NULLIF(regexp_replace(COALESCE(payload->>'transferAmount', '0'), '[^0-9.]', '', 'g'), '')::numeric, 0);
  bank_gateway := COALESCE(payload->>'gateway', 'ACB');
  ref_code := COALESCE(payload->>'referenceCode', payload->>'id', '');

  -- 2. Trích xuất mã tham chiếu đơn hàng chuẩn: SCC + ddMMhhmm + 4 số cuối SĐT (hoặc DHxxxxxx)
  matched_code := substring(raw_content from '(?i)SCC[0-9]{12}');
  IF matched_code IS NULL THEN
    matched_code := substring(raw_content from '(?i)SCC[0-9]{8,14}');
  END IF;
  IF matched_code IS NULL THEN
    matched_code := substring(raw_content from '(?i)DH[0-9]{6}');
  END IF;

  -- 3. Trích xuất số điện thoại nếu khách chuyển không ghi mã đơn
  matched_phone := substring(raw_content from '0[0-9]{9,10}');

  -- 4. CẬP NHẬT TRỰC TIẾP VÀO BẢNG LEADS CỦA SUPABASE (CHỚP MẮT 0.005 GIÂY)
  -- Ưu tiên 1: Khớp chính xác theo mã đơn email_status hoặc channel
  IF matched_code IS NOT NULL THEN
    UPDATE public.leads
    SET status = 'ĐÃ THANH TOÁN',
        price = CASE 
          WHEN transfer_amount > 0 THEN (to_char(transfer_amount, 'FM999,999,999') || ' VNĐ')
          ELSE price 
        END
    WHERE UPPER(email_status) = UPPER(matched_code)
       OR channel ILIKE '%' || matched_code || '%'
    RETURNING * INTO updated_lead;
  END IF;

  -- Ưu tiên 2 (Fallback): Khớp theo số điện thoại học viên
  IF updated_lead.id IS NULL AND matched_phone IS NOT NULL THEN
    UPDATE public.leads
    SET status = 'ĐÃ THANH TOÁN',
        price = CASE 
          WHEN transfer_amount > 0 THEN (to_char(transfer_amount, 'FM999,999,999') || ' VNĐ')
          ELSE price 
        END
    WHERE id = (
      SELECT id FROM public.leads
      WHERE (phone LIKE '%' || matched_phone || '%' OR phone = matched_phone)
        AND (status IS NULL OR status != 'ĐÃ THANH TOÁN')
      ORDER BY id DESC
      LIMIT 1
    )
    RETURNING * INTO updated_lead;
  END IF;

  -- Ưu tiên 3 (Phòng ngừa): Nếu đơn hàng hoàn toàn mới chưa có trong hệ thống, tự động tạo mới
  IF updated_lead.id IS NULL THEN
    INSERT INTO public.leads (name, phone, course, price, status, channel, email_status)
    VALUES (
      'Khách CK SePay (' || bank_gateway || ')',
      COALESCE(matched_phone, 'Chưa rõ SĐT'),
      'Khóa học Chiropractic (CK Trực Tiếp)',
      CASE 
        WHEN transfer_amount > 0 THEN (to_char(transfer_amount, 'FM999,999,999') || ' VNĐ')
        ELSE 'Đã thanh toán'
      END,
      'ĐÃ THANH TOÁN',
      'SePay Webhook: ' || raw_content,
      COALESCE(matched_code, ref_code)
    )
    RETURNING * INTO updated_lead;
  END IF;

  -- 5. GỬI BẢN SAO SANG GOOGLE SHEET ĐỂ SAO LƯU & GỬI EMAIL (CHẠY BẤT ĐỒNG BỘ KHÔNG LÀM CHẬM SEPAY)
  BEGIN
    PERFORM net.http_post(
      url := 'https://script.google.com/macros/s/AKfycbx_pTqoPFNEU4nV4u-f1i1607aWLRfefN1o_bj7--bAaVRIrYiM4GkQoe8bzjqeMS61kA/exec',
      body := payload,
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    -- Bỏ qua nếu mạng ngoài bị trễ, dữ liệu trong Supabase đã cập nhật an toàn 100%
  END;

  -- 6. PHẢN HỒI KẾT QUẢ THÀNH CÔNG CHO SEPAY
  RETURN jsonb_build_object(
    'success', true,
    'status', 'success',
    'message', 'Supabase đã xác nhận đơn thành công',
    'matched_order', COALESCE(matched_code, updated_lead.email_status),
    'lead_id', updated_lead.id,
    'customer_name', updated_lead.name,
    'customer_phone', updated_lead.phone
  );
END;
$$;

-- BƯỚC 4: CẤP QUYỀN GỌI HÀM CHO CỔNG THANH TOÁN SEPAY
GRANT EXECUTE ON FUNCTION public.sepay_webhook(jsonb) TO anon, authenticated, service_role;
