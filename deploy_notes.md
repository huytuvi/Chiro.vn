# 🚀 DEPLOY NOTES — chiro.vn (VPS Ubuntu, production)

Static landing pages + Express API server + SQLite "second brain" (`brain.db`).

---

## 1. Kiến trúc / What this server does
- **Express** (`server.js`) phục vụ web tĩnh trong thư mục **`public/`** (chỉ `public/` được expose ra ngoài — `.env`, `brain.db`, `*.py`, `google-sheets-script.js`, backup… **không** bao giờ bị serve).
- Cổng lắng nghe: **`process.env.PORT` → mặc định `3000`**, bind `0.0.0.0`.
- Kết nối `brain.db` (SQLite, **read-only**). Nếu thiếu `brain.db`, web vẫn chạy, chỉ các API dữ liệu trả `503`.

### Routes
| Route | Mô tả | Bảo vệ |
|---|---|---|
| `GET /` | Landing page (`public/index.html`) | công khai |
| `GET /admin` | Trang quản trị (`public/admin.html`) | công khai (trang), API bên dưới có khoá |
| `GET /api/health` | Trạng thái server + db | công khai |
| `GET /api/products` | Danh mục khoá học (brain.db) | công khai |
| `GET /api/business` | Thông tin doanh nghiệp | công khai |
| `GET /api/admin/customers` | Danh sách khách hàng | 🔒 `ADMIN_SECRET_KEY` |
| `GET /api/admin/orders` | Đơn hàng | 🔒 `ADMIN_SECRET_KEY` |
| `GET /api/admin/stats` | Thống kê nhanh | 🔒 `ADMIN_SECRET_KEY` |

Gọi API admin bằng header `x-admin-key: <ADMIN_SECRET_KEY>` (hoặc `?key=...`).

---

## 2. Biến môi trường cần set trên VPS (`.env`)
Tạo file `.env` tại thư mục gốc dự án (xem mẫu đầy đủ trong `.env.example`):

| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| `PORT` | không | Cổng lắng nghe (mặc định `3000`) |
| `NODE_ENV` | nên | `production` |
| `ADMIN_SECRET_KEY` | **có** | Khoá bảo vệ `/api/admin/*` (đặt chuỗi dài, ngẫu nhiên) |
| `SUPABASE_URL` | có | URL Supabase |
| `SUPABASE_ANON_KEY` | có | Anon/publishable key (an toàn cho trình duyệt) |
| `GOOGLE_SHEET_URL` | có | Web App Google Apps Script (backup lớp 2) |
| `RESEND_API_KEY` | có (nếu gửi email) | Khoá Resend — chỉ dùng phía server |
| `SENDER_EMAIL` | có | Email gửi đi (vd `admin@chiro.vn`) |
| `REPLY_TO_EMAIL` | không | Email nhận reply |
| `BRAIN_DB_PATH` | không | Đường dẫn `brain.db` (mặc định `./brain.db`) |

> `.env`, `brain.db`, `resend_config.txt` **không** nằm trong git → phải copy thủ công lên VPS (dùng `scp`).

---

## 3. Cài đặt & chạy trên VPS Ubuntu

```bash
# 3.1 Cài Node.js 20 LTS (nếu chưa có)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
# better-sqlite3 thường có sẵn binary; nếu phải build:
sudo apt-get install -y build-essential python3

# 3.2 Lấy code
git clone git@github.com:<owner>/<repo>.git chiro
cd chiro

# 3.3 Cài dependencies (production)
npm ci --omit=dev    # hoặc: npm install --production

# 3.4 Đưa các file bí mật / dữ liệu (KHÔNG có trong git) lên VPS
#     Từ máy local:
#     scp .env brain.db resend_config.txt user@<vps-ip>:~/chiro/
cp .env.example .env   # rồi sửa lại giá trị thật

# 3.5 Chạy thử
npm start              # → http://0.0.0.0:3000
curl http://localhost:3000/api/health
```

### Chạy nền bền vững với PM2 (khuyến nghị)
```bash
sudo npm install -g pm2
pm2 start server.js --name chiro
pm2 save
pm2 startup            # chạy lệnh nó in ra để tự khởi động khi reboot
pm2 logs chiro
```

### Reverse proxy Nginx + HTTPS (trỏ domain chiro.vn về VPS)
```nginx
server {
    server_name chiro.vn www.chiro.vn;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d chiro.vn -d www.chiro.vn   # cấp SSL Let's Encrypt
```
> Trỏ DNS A record `chiro.vn` → IP VPS. (Không còn dùng GitHub Pages/`CNAME` nữa khi đã chạy trên VPS.)

---

## 4. Cổng đang lắng nghe
- **App Express:** `PORT` (mặc định **3000**), bind `0.0.0.0`.
- **Public qua Nginx:** 80 (HTTP) → 443 (HTTPS) reverse-proxy về `127.0.0.1:3000`.
- Mở firewall: `sudo ufw allow 'Nginx Full'` (KHÔNG cần mở 3000 ra ngoài nếu đã có Nginx).

---

## 5. ⚠️ Bảo mật — việc cần làm ngay
- `.env` và `brain.db` **từng được commit** trong lịch sử git trước đây → các giá trị cũ (đặc biệt `ADMIN_SECRET_KEY`) vẫn còn trong history trên remote. **Nên đổi (rotate) `ADMIN_SECRET_KEY`** và cập nhật lại cả trong `.env` lẫn Google Apps Script (`google-sheets-script.js`).
- `SUPABASE_ANON_KEY` là publishable key → an toàn để lộ; bảo vệ dữ liệu bằng RLS trên Supabase.
- `RESEND_API_KEY` chỉ dùng phía server, không nhúng vào trang web.
