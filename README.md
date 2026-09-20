# SIMON CHIROPRACTIC CENTER (CHIRO.VN) - DỰ ÁN HỆ THỐNG LANDING PAGE & CRM BỘ NÃO THỨ 2

Dự án Landing Page đào tạo Nắn Chỉnh Cột Sống Chuyên Biệt (Specific Chiropractic) chuẩn Y khoa từ Bác sĩ Henrik Simon, tích hợp Hệ thống quản trị CRM, Bộ não thứ 2 (SQLite Brain), Cổng thanh toán tự động SePay VietQR và Hệ thống lưu trữ dữ liệu 2 lớp (Supabase + Google Sheets).

---

## 🚀 HƯỚNG DẪN DEPLOY VÀ VẬN HÀNH CƠ BẢN

### 1. Cấu hình Biến Môi Trường (Environment Variables)
Tạo file `.env` tại thư mục gốc dự án theo mẫu `.env.example`:
```env
SUPABASE_URL=https://fjzkneljhfibwksnpjkk.supabase.co
SUPABASE_ANON_KEY=sb_publishable_Ifjqnisqu2OcfaMVfjIGvw_F2DkEQsR
GOOGLE_SHEET_URL=https://script.google.com/macros/s/AKfycbx_pTqoPFNEU4nV4u-f1i1607aWLRfefN1o_bj7--bAaVRIrYiM4GkQoe8bzjqeMS61kA/exec
ADMIN_SECRET_KEY=SIMON_SEC_2026_@CHIRO_ADMIN
```

### 2. Triển khai Web Front-End (Vercel / Netlify / Cloudflare Pages)
- **Static Hosting:** Dự án là tập hợp các file HTML/JS/CSS thuần (`index.html`, `admin.html`), có thể deploy trực tiếp lên Vercel, Netlify hoặc GitHub Pages.
- **Tên miền tùy chỉnh:** Trỏ CNAME / A Record tên miền `chiro.vn` về hosting.

### 3. Cấu hình Database & CRM Lớp 1 (Supabase)
- Chạy script SQL [`supabase_add_waitlist_columns.sql`](./supabase_add_waitlist_columns.sql) trong **Supabase SQL Editor** để khởi tạo các cột quản lý Danh Sách Chờ & Mã Chuyển Tiền.

### 4. Cấu hình Backup Lớp 2 (Google Sheets & Apps Script)
- Mở file Google Sheet sở hữu bởi `chiroeduvn@gmail.com`.
- Dán mã từ [`google-sheets-script.js`](./google-sheets-script.js) vào Google Apps Script Editor.
- Triển khai dưới dạng **Web App**, phân quyền **Anyone** (Bất kỳ ai).

### 5. Đồng bộ Bộ Não Thứ 2 (`brain.db`)
- Chạy lệnh đồng bộ định kỳ để nạp dữ liệu CRM từ JSON/Supabase vào SQLite:
```bash
python3 sync_crm_to_brain.py
```

---

## 🔒 TÍNH NĂNG BẢO MẬT & CỨNG HÓA HỆ THỐNG
- **Dữ liệu nhạy cảm:** Đã che giấu API keys và mật khẩu quản trị vào file `.env`.
- **Chống nhập sai Data:** Form đã tích hợp bộ kiểm tra định dạng Số điện thoại (9-11 chữ số) và Email hợp lệ trước khi gửi.
- **Sao lưu An toàn:** Đã tạo bản sao lưu dữ liệu `brain_backup.db`.
