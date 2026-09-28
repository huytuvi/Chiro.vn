#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HỆ THỐNG TỰ ĐỘNG HÓA GỬI EMAIL QUA RESEND — SIMON CHIROPRACTIC CENTER (CHIRO.VN)
Đã tối ưu gửi DUY NHẤT 1 EMAIL tri ân kèm đường link đọc sách online & tải PDF cho học viên.
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

import ssl

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
        try:
            ctx = ssl.create_default_context()
        except Exception:
            ctx = ssl._create_unverified_context()

        try:
            resp_handle = urllib.request.urlopen(req, context=ctx)
        except urllib.error.URLError as u_err:
            if "CERTIFICATE_VERIFY_FAILED" in str(u_err):
                ctx = ssl._create_unverified_context()
                resp_handle = urllib.request.urlopen(req, context=ctx)
            else:
                raise u_err

        with resp_handle as resp:
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
# EMAIL CHÍNH THỨC DUY NHẤT: CHÚC MỪNG, TRI ÂN & TẶNG SÁCH ĐỌC ONLINE / TẢI PDF
# ==============================================================================
def get_email_1_content(name="anh/chị"):
    return f"""
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; line-height: 1.7; color: #2D3748; padding: 30px 24px; background-color: #FAFAF9; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
  
  <!-- HEADER -->
  <div style="text-align: center; padding-bottom: 22px; border-bottom: 2px solid #8F1D35;">
    <h2 style="color: #8F1D35; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">SIMON CHIROPRACTIC CENTER</h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #718096; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Thư Cảm Ơn & Tri Ân Học Viên / Khách Hàng Tin Tưởng</p>
  </div>

  <!-- BODY CONTENT -->
  <div style="padding: 26px 0;">
    <p style="font-size: 16px; font-weight: bold; color: #1A202C; margin-bottom: 16px;">Dạ, em xin kính chào {name},</p>
    
    <p style="font-size: 15px; margin-bottom: 16px; color: #2D3748;">
      Em đại diện cho <strong>Bác sĩ Henrik Simon</strong> và toàn thể đội ngũ y khoa tại <strong>Simon Center (Chiro.vn)</strong> xin gửi lời <strong>cảm ơn sâu sắc và lời chúc mừng chân thành nhất</strong> đến {name} vì đã tin tưởng đăng ký đồng hành cùng chúng em!
    </p>

    <p style="font-size: 15px; margin-bottom: 16px; color: #2D3748;">
      Sự tin tưởng của {name} là động lực vô cùng to lớn để Bác sĩ Henrik Simon tiếp tục sứ mệnh lan tỏa phương pháp nắn chỉnh cột sống chuyên biệt chuẩn Y Khoa Đức (<em>American Specific Chiropractic / DISC Institute</em>) tại Việt Nam.
    </p>

    <!-- GIFT BOX -->
    <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 22px; margin: 24px 0; text-align: center; box-shadow: 0 2px 6px rgba(16,185,129,0.08);">
      <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 800; color: #065F46;">🎁 MÓN QUÀ TRI ÂN ĐẶC QUYỀN DÀNH TẶNG BẠN</p>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #047857; line-height: 1.6;">
        Để bày tỏ lòng biết ơn, Thầy Henrik Simon xin gửi tặng bạn cuốn sách chuyên khảo độc quyền:<br/>
        <strong style="font-size: 15px; color: #064E3B;">CHIROPRATIK — CHỮA LÀNH BẰNG ĐÔI BÀN TAY</strong><br/>
        <span style="font-size: 12.5px; color: #059669;">(Biên soạn dựa trên giáo trình gốc <em>Lehrbuch Chiropraktik</em> — Thieme Verlag)</span>
      </p>

      <!-- BIG ACCESSIBLE LINK BUTTON -->
      <a href="https://chiro.vn/doc-sach.html" style="background-color: #059669; color: #FFFFFF; text-decoration: none; padding: 14px 28px; font-size: 15px; font-weight: 800; border-radius: 10px; display: inline-block; box-shadow: 0 4px 10px rgba(5,150,105,0.25);">
        📖 XEM SÁCH ONLINE & TẢI BẢN PDF VỀ MÁY ➔
      </a>
      
      <p style="margin: 14px 0 0 0; font-size: 12px; color: #047857;">
        * Nhấn vào đường link trên: Bạn có thể đọc sách trực tiếp trên trình duyệt, hoặc bấm nút <strong>"TẢI SÁCH PDF"</strong> ở góc trên màn hình để tải về máy tùy thích.
      </p>
    </div>

    <p style="font-size: 15px; margin-bottom: 20px; color: #2D3748;">
      Nếu cần hỗ trợ thêm bất kỳ thông tin nào về khóa học hoặc lịch tư vấn 1-1 cùng Thầy Henrik Simon, {name} cứ hồi âm trực tiếp email này hoặc nhắn tin Zalo cho đội ngũ chuyên môn nhé ạ.
    </p>

    <p style="font-size: 15px; margin: 0; color: #4A5568;">
      Kính chúc {name} luôn dồi dào sức khỏe, bình an và gặt hái nhiều giá trị tuyệt vời!<br><br>
      <strong style="color: #8F1D35;">Trân trọng & Tri ân,</strong><br>
      <strong>Bác sĩ Henrik Simon & Đội ngũ Simon Center</strong><br>
      <span style="font-size: 13px; color: #718096;">Chiro.vn • Hotline/Zalo: 0389.609.938</span>
    </p>
  </div>

  <!-- FOOTER -->
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #A0AEC0;">
    <p style="margin: 0;">Simon Chiropractic Center • TP. Hồ Chí Minh</p>
    <p style="margin: 4px 0 0 0;">Website chính thức: <a href="https://chiro.vn" style="color: #8F1D35; text-decoration: none; font-weight: 600;">chiro.vn</a></p>
  </div>
</div>
"""

def send_welcome_book_email(to_email, name="anh/chị"):
    subject = f"🎁 [Chiro.vn] Cảm ơn bạn đã tin tưởng chọn Simon Center — Nhận ngay Sách Quà Tặng Đặc Quyền!"
    return send_resend_email(to_email, subject, get_email_1_content(name))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gửi email tri ân tặng sách Chiro.vn")
    parser.add_argument("--email", required=True, help="Email người nhận")
    parser.add_argument("--name", default="anh/chị", help="Tên người nhận")
    args = parser.parse_args()

    send_welcome_book_email(args.email, args.name)
