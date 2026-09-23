# PROJECT HANDOFF — chiro.vn (Simon Chiropractic Center)

> Tài liệu bàn giao cho agent/lập trình viên tiếp theo. Đọc file này TRƯỚC KHI sửa gì.
> Secrets (password/key thật) nằm ở **`CREDENTIALS.local.md`** (gitignored, cùng thư mục) và trong **`.env`**.
> Cập nhật lần cuối: 2026-09-23.

---

## 1. TỔNG QUAN
Landing page + admin CRM + chatbot cho trung tâm đào tạo Chiropractic (chiro.vn).
**Đã chuyển từ GitHub Pages → VPS thật** (production). Thêm AI agent (goClaw) điều khiển website qua MCP + Telegram.

- **Ngôn ngữ:** Node.js (Express) + HTML/CSS/JS tĩnh (Tailwind qua CDN). Không có build step.
- **Repo GitHub:** `git@github.com:huytuvi/Chiro.vn.git` (nhánh `main`).
- **Thư mục local (Mac):** `/Users/huybui/Desktop/Chiro_course`

---

## 2. HẠ TẦNG (VPS)
- **VPS:** Ubuntu 24.04 — IP `103.97.126.91`, SSH `root@…` cổng **2018**, xác thực bằng SSH key `~/.ssh/id_ed25519` (trên máy Mac). *(Chi tiết ở CREDENTIALS.local.md)*
- **Thư mục app:** `/var/www/chiro`  (KHÔNG phải /opt/my-website)
- **goClaw:** `/opt/goclaw` (Docker Compose)
- **DNS/CDN:** Cloudflare (proxied 🟠), SSL mode **Full** (origin dùng cert self-signed ở `/etc/nginx/ssl/`).

### Domain → dịch vụ
| Domain | Trỏ về | Dịch vụ |
|---|---|---|
| `chiro.vn`, `www.chiro.vn` | VPS | Website Express (:3000) |
| `app.chiro.vn` | VPS | goClaw Dashboard (:18790) |
| `app.chiro.vn/<mcp-secret>/mcp` | VPS | MCP server (:3001) — xem CREDENTIALS |

### Cổng (đều bind 127.0.0.1 trừ nginx)
- **3000** — Express website (PM2)
- **3001** — MCP server (systemd)
- **18790** — goClaw (Docker)
- **5432** — Postgres của goClaw (Docker)
- **80/443** — Nginx (public)

### Tiến trình chạy nền
| Dịch vụ | Quản lý bởi | Lệnh kiểm tra |
|---|---|---|
| Website `chiro` | **PM2** (user root) | `pm2 list` · `pm2 logs chiro` |
| `mcp-server` | **systemd** | `systemctl status mcp-server` |
| goClaw + postgres | **Docker Compose** (`/opt/goclaw`) | `docker ps` |
| Nginx | systemd | `systemctl status nginx` · `nginx -t` |

Cả PM2 và mcp-server đều đã `enable` → tự chạy lại khi reboot.

---

## 3. CẤU TRÚC THƯ MỤC (`/var/www/chiro` = repo)
```
public/                     # Web tĩnh (CHỈ thư mục này được nginx/Express serve ra ngoài)
  index.html                # Landing page (hero title có id="hero-headline" để MCP sửa)
  admin.html                # CRM admin panel (có màn hình đăng nhập)
  chuyen-gia-henrik-simon.html
  lo-trinh-khoa-hoc.html
  admin-confirm.html
  chatbot.js, logo.png
server.js                   # Express: serve public/, API, kết nối brain.db
package.json
mcp/
  server.js                 # MCP server (streamable-http, :3001) — 3 tool
  README.md, test-crm.mjs, test-client.mjs
brain.db                    # SQLite "bộ não AI" (KHÔNG commit — gitignored)
.env                        # Secrets (KHÔNG commit)
admin-auth.json             # Mật khẩu admin (hashed, KHÔNG commit)
resend_config.txt           # Key Resend cho script Python (KHÔNG commit)
supabase_backup.sh          # Cron backup Supabase leads → supabase_backup/
supabase_keepalive.sh       # Cron ping chống Supabase pause
supabase_restore.sh         # Đổ backup ngược vào Supabase (thủ công, có --yes)
supabase_backup/            # Dữ liệu backup (.json/.csv, giữ 2 bản mới nhất — gitignored)
*.py                        # Script tiện ích local (email, sync brain.db) — KHÔNG serve
google-sheets-script.js     # Mã Google Apps Script (dán vào Apps Script, không serve)
deploy_notes.md, PROJECT_HANDOFF.md, CREDENTIALS.local.md
```
⚠️ **Bảo mật quan trọng:** Express chỉ serve `public/`. TUYỆT ĐỐI không cấu hình serve thư mục gốc (sẽ lộ `.env`, `brain.db`, `.py`, `google-sheets-script.js`…).

---

## 4. DỮ LIỆU (3 kho, mỗi kho 1 vai trò)
| Kho | Vai trò | Nguồn sự thật cho |
|---|---|---|
| **Supabase** (Postgres cloud, bảng `leads`) | Dữ liệu giao dịch sống | **Đơn/khách/thanh toán/doanh thu** |
| **Google Sheets** (qua Apps Script) | Backup song song lớp 2 | (bản sao đơn hàng) |
| **brain.db** (SQLite) | "Bộ não AI" — kiến thức | **Kiến thức y khoa, brand voice, sản phẩm, ghi chú** |

**Nguyên tắc:** giao dịch → Supabase; kiến thức AI → brain.db. KHÔNG nhét dữ liệu khách (PII) vào brain.db.

### Supabase `leads` (các cột chính)
`id, created_at, time_str, name, phone, email, price` (chuỗi "2.000 VNĐ"), `course, occupation, channel, status` ("ĐÃ THANH TOÁN" | "Chờ thanh toán"), `email_status, priority_code, summary_code, payment_code, goal, experience, format`

### brain.db (các bảng)
`products(8), customers(0), orders(0), business, knowledge(353), medical_knowledge(+FTS), german_knowledge(396), brand_voice, voice_evaluations`
> ⚠️ `customers`/`orders` trong brain.db = 0 (KHÔNG dùng để báo cáo). Số liệu thật ở Supabase.

---

## 5. WEBSITE (Express `server.js`)
- Serve `public/`, cổng `process.env.PORT || 3000`, bind 0.0.0.0.
- Routes: `/` (landing), `/admin` (CRM), `/api/health`, `/api/products`, `/api/business` (công khai), `/api/admin/{customers,orders,stats}` (khoá).
- **Đăng nhập admin:** `/admin` có màn hình login. Mật khẩu lưu **hashed** trong `admin-auth.json` (scrypt), đổi được qua nút "🔑 Đổi Mật Khẩu" hoặc `POST /api/admin/change-password`. Xác thực qua `POST /api/admin/login` (trả về khoá tích hợp Apps Script cho các lệnh gọi Google Sheet).
- Frontend gọi thẳng Supabase (anon key) + Google Apps Script — KHÔNG qua Express cho phần đọc/ghi lead.

---

## 6. AI: goClaw + MCP
- **goClaw** (Docker, `/opt/goclaw`) tại `app.chiro.vn`. Agents: `support` ("Hỗ trợ"), `mycoder` ("MyCoder"/"SimonCoder" — dùng cho lệnh quản trị), `little-fox`.
- **MCP server** (`mcp/server.js`): transport `streamable-http`, `enableJsonResponse: true`, bind `127.0.0.1:3001`. Dùng `dotenv` đọc `.env`.
  - **Tools:** `update_hero(new_title)` (sửa `#hero-headline` trong public/index.html), `crm_stats(period)` (đọc **Supabase leads**, không phải brain.db), `add_note(title, content)` (ghi vào brain.db `knowledge`).
  - Trong goClaw tool tên là `mcp_biz__update_hero`, `mcp_biz__crm_stats`, `mcp_biz__add_note` (tool_prefix = `biz`).
- **QUAN TRỌNG — goClaw chặn SSRF:** không cho URL MCP là `127.0.0.1`/private IP. Vì vậy goClaw gọi MCP qua **URL công khai bí mật**: `https://app.chiro.vn/<mcp-secret>/mcp` (nginx proxy path bí mật → 127.0.0.1:3001). Xem giá trị ở CREDENTIALS.
- **Cấp tool cho agent:** goClaw cần bản ghi trong bảng `mcp_agent_grants` (Postgres). Đặt profile "Full" chưa đủ. Đã cấp cho `support` và `mycoder`. Nếu tạo agent mới muốn dùng tool → phải cấp grant (qua Dashboard hoặc INSERT vào `mcp_agent_grants`).
- Nếu agent "từ chối gọi tool / bịa là không có tool" → do persona/system prompt; sửa trong SOUL.md/System Prompt của agent.

---

## 7. BACKUP / CHỐNG MẤT DỮ LIỆU (cron trên VPS)
| Script | Cron | Việc |
|---|---|---|
| `supabase_backup.sh` | `0 2 * * *` (2h sáng) | Tải bảng leads → `supabase_backup/leads_<ts>.json` + `.csv`; giữ **2 bản mới nhất**, xoá cũ |
| `supabase_keepalive.sh` | `0 3 */3 * *` (mỗi 3 ngày) | Ping Supabase chống pause gói Free (7 ngày im lặng) |
| `supabase_restore.sh` | thủ công | Đổ backup ngược vào Supabase (upsert theo `id`, chống trùng). Chạy: `./supabase_restore.sh --yes` |
- Xem cron: `crontab -l`. Log: `supabase_backup/*.log`.
- Supabase Free bị pause ≠ mất data → vào Dashboard bấm **Restore project**.

---

## 8. QUY TRÌNH CẬP NHẬT (deploy code mới lên VPS)
Từ máy Mac (sau khi sửa xong trong `/Users/huybui/Desktop/Chiro_course`):
```bash
cd /Users/huybui/Desktop/Chiro_course
# 1) commit + push
git add -A && git commit -m "..." && git push origin main
# 2) đẩy code lên VPS — KHÔNG dùng --delete (sẽ xoá .env/brain.db/admin-auth.json trên VPS!)
rsync -az -e "ssh -i ~/.ssh/id_ed25519 -p 2018" \
  --exclude='.git' --exclude='node_modules' --exclude='*_backup*' \
  --exclude='*_snapshot*' --exclude='*monolithic*' --exclude='.DS_Store' \
  --exclude='brain.db' --exclude='.env' --exclude='admin-auth.json' \
  --exclude='supabase_backup' \
  ./ root@103.97.126.91:/var/www/chiro/
# 3) cài dep + reload dịch vụ
ssh -i ~/.ssh/id_ed25519 -p 2018 root@103.97.126.91 \
  'cd /var/www/chiro && npm ci --omit=dev && pm2 reload chiro && systemctl restart mcp-server'
```
> ⚠️ **KHÔNG rsync đè** `brain.db`, `.env`, `admin-auth.json`, `supabase_backup/` (bản trên VPS mới là bản thật/mới nhất).
> Sửa `google-sheets-script.js` → phải **dán lại vào Google Apps Script + Deploy new version** (không tự đồng bộ).
> Sửa nginx (`/etc/nginx/sites-available/`) → `nginx -t` rồi `systemctl reload nginx`.

---

## 9. GOTCHAS / LỖI ĐÃ GẶP & CÁCH XỬ
- **Bot báo "0 đơn / doanh thu 0":** do đọc brain.db (rỗng). Đã sửa `crm_stats` đọc Supabase.
- **goClaw "Server Unreachable":** do `GOCLAW_ALLOWED_ORIGINS` thiếu domain đang dùng → thêm origin vào `/opt/goclaw/.env` rồi `docker compose -f docker-compose.yml -f docker-compose.postgres.yml up -d goclaw`.
- **MCP "invalid URL / SSRF 127.0.0.1 blocked":** dùng URL công khai bí mật qua nginx (mục 6).
- **Agent không có tool:** phải cấp `mcp_agent_grants` (mục 6).
- **`.env` từng bị commit trong lịch sử git** → đã ngừng track; nên coi các key cũ là "đã lộ" và đã rotate `ADMIN_SECRET_KEY`.

---

## 10. VIỆC CÓ THỂ LÀM TIẾP
- Thêm MCP tool mới (ví dụ `update_price`, `list_waitlist`) trong `mcp/server.js` → cấp grant cho agent.
- Siết **RLS** trên Supabase bảng `leads` (hiện anon key đọc/ghi được).
- Cân nhắc chuyển key Apps Script sang Script Properties.
- Dọn các file backup HTML cũ (`index_backup_*`, `*_snapshot_*`) ở thư mục gốc.
