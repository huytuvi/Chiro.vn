#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HỆ THỐNG TỰ ĐỘNG HÓA GỬI EMAIL QUA RESEND — SIMON CHIROPRACTIC CENTER (CHIRO.VN)
Hỗ trợ kiểm tra chế độ test (+test), gửi kịch bản nuôi dưỡng 3 email, và xác nhận đơn hàng.
"""

import os
import sys
import json
import time
import argparse
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(BASE_DIR, "resend_config.txt")

# Đọc cấu hình từ resend_config.txt hoặc biến môi trường
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "Simon Center <hi@chiro.vn>")

if os.path.exists(CONFIG_FILE):
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("RESEND_API_KEY="):
                    RESEND_API_KEY = line.split("=", 1)[1].strip()
                elif line.startswith("SENDER_EMAIL="):
                    val = line.split("=", 1)[1].strip()
                    if "@" in val:
                        SENDER_EMAIL = f"Simon Center <{val}>" if not val.startswith("Simon") else val
    except Exception as e:
        print(f"⚠️ Không thể đọc resend_config.txt: {e}")

# ==============================================================================
# HÀM GỬI EMAIL QUA RESEND API
# ==============================================================================
def send_resend_email(to_email, subject, html_content):
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "SimonCenter-CRM/1.0"
    }
    payload = {
        "from": SENDER_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }

    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"✅ Đã gửi thành công tới: {to_email} | Subject: '{subject}' | Resend ID: {data.get('id')}")
            return {"success": True, "id": data.get("id")}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"❌ Lỗi HTTP {e.code} khi gửi tới {to_email}: {err_msg}")
        return {"success": False, "error": err_msg, "code": e.code}
    except Exception as e:
        print(f"❌ Lỗi kết nối khi gửi tới {to_email}: {e}")
        return {"success": False, "error": str(e)}

# ==============================================================================
# NỘI DUNG 3 EMAIL NUÔI DƯỠNG & 1 EMAIL XÁC NHẬN ĐƠN HÀNG
# ==============================================================================
def get_email_1_content(name="anh/chị"):
    return """
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; line-height: 1.7; color: #2D3748; padding: 25px 20px; background-color: #FAFAF9; border-radius: 12px; border: 1px solid #E2E8F0;">
  <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #8F1D35;">
    <h2 style="color: #8F1D35; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">SIMON CHIROPRACTIC CENTER</h2>
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #718096; text-transform: uppercase; font-weight: 600;">Trung tâm Đào tạo Nắn chỉnh Cột sống Chuyên biệt Quốc tế</p>
  </div>
  <div style="padding: 24px 0;">
    <p style="font-size: 15px; margin-bottom: 16px;">Dạ, em xin kính chào anh/chị,</p>
    <p style="font-size: 15px; margin-bottom: 16px;">
      Em là trợ lý chuyên môn tại <strong>Simon Chiropractic Center</strong>. Em xin đại diện Thầy Henrik Simon và toàn thể đội ngũ y khoa tại Trung tâm gửi lời cảm ơn chân thành nhất đến anh/chị vì đã dành thời gian đăng ký và đồng hành cùng chúng em.
    </p>
    <p style="font-size: 15px; margin-bottom: 16px;">
      Trong suốt nhiều năm thực hành lâm sàng và giảng dạy, trăn trở lớn nhất của Thầy Henrik Simon là làm sao để các bác sĩ, kỹ thuật viên y học cổ truyền, vật lý trị liệu và huấn luyện viên tại Việt Nam có thể tiếp cận được phương pháp <em>Specific Chiropractic</em> — nắn chỉnh chuyên biệt dựa trên giải phẫu cơ sinh học thực chứng, thay vì những kỹ thuật bẻ khớp theo cảm tính đang tràn lan.
    </p>
    <div style="background-color: #FFFFFF; border-left: 4px solid #8F1D35; padding: 16px 20px; margin: 20px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <p style="margin: 0; font-size: 14.5px; font-style: italic; color: #4A5568;">
        "Y thuật là cứu người. Trước khi học cách tạo ra chuyển động, người thực hành phải thấu hiểu sự bất động của từng đốt sống và tôn trọng tuyệt đối ranh giới an toàn của tủy sống."
      </p>
      <p style="margin: 6px 0 0 0; font-size: 13px; text-align: right; color: #8F1D35; font-weight: 600;">— Chuyên gia Henrik Simon</p>
    </div>
    <p style="font-size: 15px; margin-bottom: 16px;">
      Trong 2 ngày tới, em xin phép gửi đến hòm thư của anh/chị một bài phân tích chuyên sâu về <strong>hiện tượng giải phóng áp lực khớp (Cavitation) và ranh giới an toàn trong nắn chỉnh</strong>. Đây là nền tảng cốt lõi giúp anh/chị phân biệt rõ giữa "nắn chỉnh y khoa" và "bẻ khớp thương mại".
    </p>
    <p style="font-size: 15px; margin-bottom: 20px;">
      Nếu có bất kỳ thắc mắc nào về định hướng chuyên môn hoặc tài liệu, anh/chị có thể hồi âm trực tiếp email này hoặc nhắn tin cho em qua Zalo chuyên môn nhé ạ.
    </p>
    <p style="font-size: 15px; margin: 0; color: #4A5568;">
      Kính chúc anh/chị luôn dồi dào sức khỏe và giữ vững ngọn lửa với nghề y!<br><br>
      <strong>Đội ngũ Y khoa Simon Center</strong><br>
      <span style="font-size: 13px; color: #718096;">Chuyên gia Henrik Simon & Đội ngũ Chuyên môn</span>
    </p>
  </div>
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #A0AEC0;">
    <p style="margin: 0;">Simon Chiropractic Center • TP. Hồ Chí Minh • Hotline: 0389.609.938</p>
    <p style="margin: 4px 0 0 0;">Website chính thức: <a href="https://chiro.vn" style="color: #8F1D35; text-decoration: none; font-weight: 600;">chiro.vn</a></p>
  </div>
</div>
"""

def get_email_2_content():
    return """
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; line-height: 1.7; color: #2D3748; padding: 25px 20px; background-color: #FAFAF9; border-radius: 12px; border: 1px solid #E2E8F0;">
  <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #8F1D35;">
    <h2 style="color: #8F1D35; margin: 0; font-size: 22px; font-weight: 800;">SIMON CHIROPRACTIC CENTER</h2>
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #718096; text-transform: uppercase; font-weight: 600;">Góc Chuyên Môn Cùng Thầy Henrik Simon</p>
  </div>
  <div style="padding: 24px 0;">
    <p style="font-size: 15px; margin-bottom: 16px;">Dạ, em chào anh/chị,</p>
    <p style="font-size: 15px; margin-bottom: 16px;">
      Trong thực hành lâm sàng nắn chỉnh cột sống, câu hỏi mà Thầy Henrik Simon nhận được nhiều nhất từ các bác sĩ và học viên là: <em>"Tại sao khi nắn chỉnh lại phát ra tiếng rắc? Và có phải tiếng rắc càng to thì khớp càng được chỉnh về đúng vị trí hay không?"</em>
    </p>
    <div style="background-color: #FFFFFF; border-radius: 8px; padding: 18px; margin: 20px 0; border: 1px solid #E2E8F0;">
      <h3 style="color: #8F1D35; margin: 0 0 10px 0; font-size: 16px;">1. Bản chất của âm thanh: Hiện tượng Cavitation</h3>
      <p style="font-size: 14.5px; margin: 0 0 12px 0;">
        Giữa các diện khớp bao hoạt dịch (facet joints) luôn có một lớp dịch khớp. Khi tạo ra một lực đẩy chuyên biệt với tốc độ cao biên độ thấp (HVLA), khoang bao khớp mở rộng đột ngột khiến các chất khí hòa tan thoát ra tạo bọt khí và xẹp lại, tạo ra tiếng "pop".
      </p>
      <h3 style="color: #8F1D35; margin: 16px 0 10px 0; font-size: 16px;">2. Cạm bẫy lớn nhất: "Kêu to không đồng nghĩa với hiệu quả"</h3>
      <p style="font-size: 14.5px; margin: 0;">
        Nếu kỹ thuật viên dùng lực bừa bãi không có hướng lực giải phẫu chuẩn, ta rất dễ tác động vào những đốt sống vốn đã lỏng lẻo (Hypermobility), tạo ra tiếng kêu to nhưng lại làm dãn dây chằng của người bệnh.
      </p>
    </div>
    <p style="font-size: 15px; margin-bottom: 16px;">
      Đó là lý do vì sao trong Chiropractic chuyên biệt, chúng em luôn nhấn mạnh nguyên tắc: <strong>"Target the Fixation, Protect the Hypermobile segment"</strong>.
    </p>
    <p style="font-size: 15px; margin-bottom: 20px;">
      Ngày mai, em xin phép gửi thông tin chi tiết về lộ trình làm chủ trọn vẹn kỹ thuật Full-Spine cùng Thầy Henrik Simon nhé ạ.
    </p>
    <p style="font-size: 15px; margin: 0; color: #4A5568;">
      Kính chúc anh/chị một ngày làm việc tràn đầy năng lượng và bình an!<br><br>
      <strong>Đội ngũ Y khoa Simon Center</strong>
    </p>
  </div>
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #A0AEC0;">
    <p style="margin: 0;">Thông tin mang tính tham khảo y khoa chuyên môn • Simon Chiropractic Center</p>
    <p style="margin: 4px 0 0 0;"><a href="https://chiro.vn" style="color: #8F1D35; text-decoration: none; font-weight: 600;">chiro.vn</a></p>
  </div>
</div>
"""

def get_email_3_content():
    return """
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; line-height: 1.7; color: #2D3748; padding: 25px 20px; background-color: #FAFAF9; border-radius: 12px; border: 1px solid #E2E8F0;">
  <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #8F1D35;">
    <h2 style="color: #8F1D35; margin: 0; font-size: 22px; font-weight: 800;">SIMON CHIROPRACTIC CENTER</h2>
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #718096; text-transform: uppercase; font-weight: 600;">Khóa Đào Tạo Chuyên Sâu: The Full Online Collection</p>
  </div>
  <div style="padding: 24px 0;">
    <p style="font-size: 15px; margin-bottom: 16px;">Dạ, em xin kính chào anh/chị,</p>
    <p style="font-size: 15px; margin-bottom: 16px;">
      Bộ chương trình <strong>The Full Online Collection</strong> của Thầy Henrik Simon mang đến giải pháp trọn gói:
    </p>
    <div style="background-color: #FFFFFF; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #E2E8F0;">
      <ul style="margin: 0; padding-left: 20px; font-size: 14.5px; color: #4A5568;">
        <li style="margin-bottom: 10px;"><strong>150+ video cận cảnh với các góc quay khác nhau:</strong> Minh họa rõ nét điểm tiếp xúc và góc phát lực an toàn.</li>
        <li style="margin-bottom: 10px;"><strong>Hệ thống bài tập vi chuyển động (Micro-drills):</strong> Luyện cảm giác mô và tốc độ phát lực độc quyền trường phái Đức.</li>
        <li style="margin-bottom: 10px;"><strong>Phân tích X-Quang thực chiến:</strong> Nhận diện chống chỉ định tuyệt đối (Red Flags).</li>
        <li><strong>Đặc quyền hỗ trợ chuyên môn 1-1:</strong> Thầy Henrik Simon trực tiếp sửa tư thế qua video.</li>
      </ul>
    </div>
    <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-size: 13.5px; color: #7F1D1D;">Đặc quyền dành riêng cho học viên đăng ký sớm:</p>
      <p style="margin: 6px 0; font-size: 22px; font-weight: 800; color: #8F1D35;">12.900.000 VNĐ <span style="font-size: 14px; text-decoration: line-through; color: #9CA3AF;">19.500.000 VNĐ</span></p>
      <p style="margin: 0; font-size: 12.5px; color: #991B1B;">Sở hữu trọn đời tài liệu, cập nhật liên tục và cấp chứng chỉ hoàn thành.</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://chiro.vn" style="background-color: #8F1D35; color: #FFFFFF; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: bold; border-radius: 8px; display: inline-block;">
        Xem Chi Tiết Khóa Học & Đăng Ký Ngay ➔
      </a>
    </div>
    <p style="font-size: 15px; margin: 0; color: #4A5568;">
      Kính chúc anh/chị gặt hái nhiều thành công và uy tín trong sự nghiệp y khoa!<br><br>
      <strong>Đội ngũ Y khoa Simon Center</strong>
    </p>
  </div>
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #A0AEC0;">
    <p style="margin: 0;">Simon Chiropractic Center • Hotline: 0389.609.938</p>
    <p style="margin: 4px 0 0 0;"><a href="https://chiro.vn" style="color: #8F1D35; text-decoration: none; font-weight: 600;">https://chiro.vn</a></p>
  </div>
</div>
"""

def get_order_confirmation_content(customer_name, order_code, course_name, price):
    return f"""
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; line-height: 1.7; color: #2D3748; padding: 25px 20px; background-color: #FAFAF9; border-radius: 12px; border: 1px solid #E2E8F0;">
  <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #8F1D35;">
    <h2 style="color: #8F1D35; margin: 0; font-size: 22px; font-weight: 800;">SIMON CHIROPRACTIC CENTER</h2>
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #16A34A; text-transform: uppercase; font-weight: 700;">✓ XÁC NHẬN ĐĂNG KÝ THÀNH CÔNG</p>
  </div>
  <div style="padding: 24px 0;">
    <p style="font-size: 15px; margin-bottom: 16px;">Dạ, em xin kính chào anh/chị <strong>{customer_name}</strong>,</p>
    <p style="font-size: 15px; margin-bottom: 16px;">
      Simon Center xin trân trọng thông báo: Giao dịch đăng ký khóa học của anh/chị đã được ghi nhận thành công trên hệ thống.
    </p>
    <div style="background-color: #FFFFFF; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #E2E8F0;">
      <h3 style="color: #8F1D35; margin: 0 0 14px 0; font-size: 16px;">Thông Tin Chi Tiết Đơn Hàng:</h3>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #718096; width: 140px;">Mã tham chiếu đơn:</td><td style="padding: 6px 0; font-weight: bold; color: #8F1D35;">{order_code}</td></tr>
        <tr><td style="padding: 6px 0; color: #718096;">Khóa học đăng ký:</td><td style="padding: 6px 0; font-weight: 600; color: #1A202C;">{course_name}</td></tr>
        <tr><td style="padding: 6px 0; color: #718096;">Học phí xác nhận:</td><td style="padding: 6px 0; font-weight: bold; color: #16A34A;">{price}</td></tr>
        <tr><td style="padding: 6px 0; color: #718096;">Trạng thái:</td><td style="padding: 6px 0; font-weight: 700; color: #16A34A;">ĐÃ THANH TOÁN THÀNH CÔNG</td></tr>
      </table>
    </div>
    <h3 style="color: #1A202C; font-size: 16px; margin: 20px 0 10px 0;">3 Bước Kích Hoạt Tài Khoản Học Viện:</h3>
    <ol style="margin: 0; padding-left: 20px; font-size: 14.5px; color: #4A5568; line-height: 1.8;">
      <li><strong>Kết nối Zalo Ban Đào Tạo:</strong> Nhắn tin qua Zalo số <strong>0389.609.938</strong> kèm mã đơn hàng <code>{order_code}</code> để trợ lý gửi tài khoản học online.</li>
      <li><strong>Tham gia nhóm Chuyên môn:</strong> Tham gia cộng đồng kín học viên để học Case-Study lâm sàng cùng Thầy Henrik Simon.</li>
      <li><strong>Nhận giáo trình & mô hình:</strong> Bộ phận học vụ gửi chuyển phát nhanh về địa chỉ của anh/chị.</li>
    </ol>
    <div style="text-align: center; margin: 28px 0;">
      <a href="https://zalo.me/0389609938" style="background-color: #0284C7; color: #FFFFFF; text-decoration: none; padding: 12px 28px; font-size: 15px; font-weight: bold; border-radius: 8px; display: inline-block;">
        Nhắn Tin Zalo Kích Hoạt Khóa Học Ngay ➔
      </a>
    </div>
    <p style="font-size: 15px; margin: 0; color: #4A5568;">
      Kính chúc anh/chị có những trải nghiệm học tập đầy cảm hứng và giá trị.<br><br>
      <strong>Trân trọng,<br>Chuyên gia Henrik Simon & Đội ngũ Simon Center</strong>
    </p>
  </div>
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #A0AEC0;">
    <p style="margin: 0;">Simon Chiropractic Center • Hotline: 0389.609.938 • Website: <a href="https://chiro.vn" style="color: #8F1D35; text-decoration: none;">chiro.vn</a></p>
  </div>
</div>
"""

# ==============================================================================
# BƯỚC 5: GỬI CHUỖI 3 EMAIL CHO KHÁCH TEST (+TEST) HOẶC THEO LỊCH
# ==============================================================================
def trigger_sequence_for_lead(email, name="anh/chị"):
    print(f"\n🚀 BẮT ĐẦU CHUỖI EMAIL CHĂM SÓC CHO: {email}")
    is_test = "+test" in email.lower()

    # 1. Gửi Email 1 ngay lập tức
    sub1 = "[Simon Center] Dạ chào anh/chị — Cảm ơn anh/chị đã quan tâm đến Nắn chỉnh Cột sống Chuẩn Y khoa"
    send_resend_email(email, sub1, get_email_1_content(name))

    if is_test:
        print(f"🔥 Phát hiện chế độ TEST ('+test' trong {email}): GỬI NGAY CẢ 3 EMAIL!")
        time.sleep(1) # Tránh rate limit

        # 2. Gửi Email 2 ngay lập tức
        sub2 = "[Simon Center] Tiếng \"rắc\" khi nắn chỉnh: Khoa học giải thích điều gì và đâu là ranh giới an toàn?"
        send_resend_email(email, sub2, get_email_2_content())
        time.sleep(1)

        # 3. Gửi Email 3 ngay lập tức
        sub3 = "[Simon Center] Lộ trình làm chủ kỹ thuật Specific Chiropractic chuẩn Quốc tế cùng Thầy Henrik Simon"
        send_resend_email(email, sub3, get_email_3_content())
        print(f"🎉 ĐÃ HOÀN TẤT GỬI CẢ 3 EMAIL CHO {email}!")
    else:
        print(f"📅 Email thực tế: Đã gửi Email 1. Email 2 sẽ gửi sau 2 ngày, Email 3 sau 3 ngày.")

# ==============================================================================
# HTTP SERVER ĐỂ TRANG WEB (INDEX.HTML & ADMIN.HTML) GỌI TRỰC TIẾP
# ==============================================================================
class ResendProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_length).decode('utf-8')
        try:
            data = json.loads(post_body)
        except Exception:
            data = {}

        path = self.path
        response_data = {"status": "success"}

        if "/api/trigger-sequence" in path:
            email = data.get("email", "").strip()
            name = data.get("name", "anh/chị")
            if email:
                trigger_sequence_for_lead(email, name)
                response_data["message"] = f"Đã kích hoạt chuỗi email cho {email}"
            else:
                response_data = {"status": "error", "message": "Thiếu email"}

        elif "/api/order-confirmation" in path:
            email = data.get("email", "").strip()
            name = data.get("name", "Quý học viên")
            order_code = data.get("order_code", "SCC190900000000")
            course = data.get("course", "The Full Online Collection")
            price = data.get("price", "12.900.000 VNĐ")
            if email:
                sub = "[Simon Center] Xác nhận đăng ký thành công khóa học — Hướng dẫn kích hoạt bài giảng"
                res = send_resend_email(email, sub, get_order_confirmation_content(name, order_code, course, price))
                response_data["resend_id"] = res.get("id")
                response_data["message"] = f"Đã gửi email xác nhận đơn hàng tới {email}"
            else:
                response_data = {"status": "error", "message": "Thiếu email"}

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode("utf-8"))

def run_server(port=3000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, ResendProxyHandler)
    print(f"📡 Máy chủ Resend Automation đang chạy tại http://localhost:{port}")
    httpd.serve_forever()

# ==============================================================================
# MAIN CLI
# ==============================================================================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simon Center Resend Automation CLI")
    parser.add_argument("--test", help="Test gửi cả 3 email ngay lập tức cho địa chỉ email (chế độ +test)")
    parser.add_argument("--order", nargs=4, metavar=("EMAIL", "NAME", "ORDER_CODE", "PRICE"), help="Gửi email xác nhận đơn hàng")
    parser.add_argument("--serve", action="store_true", help="Chạy local proxy server cho index.html và admin.html")
    parser.add_argument("--port", type=int, default=3000, help="Port cho proxy server (mặc định 3000)")

    args = parser.parse_args()

    if args.test:
        trigger_sequence_for_lead(args.test)
    elif args.order:
        email, name, code, price = args.order
        sub = "[Simon Center] Xác nhận đăng ký thành công khóa học — Hướng dẫn kích hoạt bài giảng"
        send_resend_email(email, sub, get_order_confirmation_content(name, code, "The Full Online Collection", price))
    elif args.serve:
        run_server(args.port)
    else:
        parser.print_help()
