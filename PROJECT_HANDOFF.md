# PROJECT HANDOFF — chiro.vn (Simon Chiropractic Center)

> Tài liệu bàn giao cho agent/lập trình viên tiếp theo. Đọc file này TRƯỚC KHI sửa gì.
> Secrets (password/key thật) nằm ở **`CREDENTIALS.local.md`** (gitignored, cùng thư mục) và trong **`.env`**.
> Cập nhật lần cuối: 2026-09-24. (Phần 11 = việc Day 15: agent chủ động + tối ưu token — ĐỌC KỸ.)

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

---

# ========== PHẦN 11 — DAY 15: AGENT CHỦ ĐỘNG + TỐI ƯU TOKEN (2026-09-24) ==========

## 11.1 MỤC TIÊU & TRẠNG THÁI
**Mục tiêu:** biến agent goClaw từ bị động → **chủ động 24/7**: mỗi vài phút tự kiểm tra Supabase, có lead/đơn/form mới thì **tự nhắn Telegram cho chủ (anh Huy) đúng giọng thương hiệu** (điềm đạm, lễ phép, "dạ – anh/chị – bên em").

**Trạng thái:** ✅ **ĐÃ CHẠY THÔNG** — ngày 23/9 agent tự gửi tin *"Dạ anh Huy, bên em vừa có 1 lead mới: Trần D…"* thành công (có ảnh nộp bài).
⚠️ **ĐANG MỞ:** chi phí AI — xem 11.6. Hiện agent **không trả lời được** vì cả 2 provider hết dung lượng (DeepSeek hết tiền, Gemini free bị 429). Cần chốt provider/billing.

## 11.2 MCP TOOLS — GIỜ CÓ **5** (cập nhật mục 6)
`mcp/server.js` (tool_prefix = `biz`):
1. `update_hero(new_title)` — sửa `#hero-headline` trong index.html
2. `crm_stats(period)` — đọc Supabase leads
3. `add_note(title, content)` — ghi brain.db
4. **`get_new_leads_since_last_check()`** (MỚI) — trả lead/đơn mới cho heartbeat. Dùng `mcp_state.json` (marker `leads_last_notified`) để không báo trùng. Lọc theo `notify_config.json`: `signal` (all/paid/pending) + `frequency` (immediate/30min/60min/schedule, có `crossedScheduledTime` theo giờ VN UTC+7).
5. **`check_user_role(sender_id, platform)`** (MỚI) — đọc `roles_config.json` → owner/admin/staff/stranger + quyền hạn, để agent phân biệt chủ vs khách.
- Health check: `curl http://127.0.0.1:3001/health` (liệt kê 5 tool).
- ⚠️ **GOTCHA lớn:** goClaw **cache danh sách tool** trong `mcp_servers.settings.tool_cache`. Thêm tool mới trong mcp/server.js **BẮT BUỘC refresh/reconnect MCP server** trong goClaw (SYSTEM → Providers/MCP → my-business → Refresh, hoặc tắt/bật enabled). Không refresh → agent không thấy tool mới, gọi nhầm tool khác.

## 11.3 ADMIN FEATURES MỚI (`public/admin.html` + `server.js`)
2 tab mới trong admin panel (chiro.vn/admin), thiết kế cho **non-coder tự chỉnh**:
- **Cấu hình Thông Báo Tự Động:** enabled · signal (all/paid/pending) · **frequency** (báo liền / gộp 30 phút / gộp 1 tiếng / sáng-tối theo giờ) · morning_time/evening_time. → lưu `notify_config.json`. API: `GET/POST /api/admin/notify-config`.
- **Tab "👥 Phân Quyền":** gán platform + sender_id → owner/admin/staff. → lưu `roles_config.json`. API: `GET/POST /api/admin/roles-config`. Đa nền tảng (Telegram hiện dùng; Messenger/Zalo để sẵn "sắp có" — goClaw chỉ thêm được khi có connector).
- **File config mới** (gitignored, CHỈ có trên VPS, không rsync đè): `notify_config.json`, `roles_config.json`, `mcp_state.json`.

## 11.4 HEARTBEAT → TELEGRAM (cơ chế đầy đủ — nằm trong DB goClaw, KHÔNG phải code repo)
**Pipeline:** form → Supabase `leads` → heartbeat gọi `mcp_biz__get_new_leads_since_last_check` → agent soạn tin → gửi qua bot Telegram.
- **Bảng `agent_heartbeats`** (per-agent) — các cột: `enabled, interval_sec, prompt` (=ô "Checklist", nội dung bảo agent gọi get_new_leads), `channel` (=`simonchiro`), `chat_id` (=Telegram ID chủ), `light_context, isolated_session, provider_id, model, active_hours_start/end, timezone`.
- Chỉ **`support`** bật heartbeat. `mycoder` + `little-fox` đã TẮT (tiết kiệm token).
- **Owner Telegram IDs:** `5239167089` (Huy Bui, chat qua bot **Simon_Chiro**) và `7383945015` (Huy B, hiện là tài khoản chủ dùng chính → `chat_id` heartbeat = **7383945015**).
- **Bot Telegram** (bảng `channel_instances`): `telegram`, **`simonchiro` (Simon_Chiro)** ← heartbeat dùng cái này, `simoncoderbot`. Token bot mã hoá AES.
- **Context files** (bảng `agent_context_files`, per-agent — KHÔNG phải file repo): `SOUL.md` (persona Simon, đã Việt hóa), `AGENTS.md` (5 việc được / 3 việc cấm + luật nhận diện chủ/khách), `USER_PREDEFINED.md` (về khách), `USER.md` (về anh Huy + Telegram ID chủ), `HEARTBEAT.md`, `IDENTITY.md`, `CAPABILITIES.md`. Bản nguồn tham khảo ở thư mục `context-files/` (gitignored) trên máy Mac.

## 11.5 CÁCH VẬN HÀNH goClaw QUA DB (vì UI hay lỗi reset)
Nhiều màn hình goClaw (đặc biệt modal Heartbeat) **tự reset khi đang nhập** → không lưu được. Cách chắc chắn = sửa thẳng Postgres:
```bash
ssh -p 2018 -i ~/.ssh/id_ed25519 root@103.97.126.91
docker exec -i goclaw-postgres-1 psql -U goclaw -d goclaw    # db=goclaw, user=goclaw
```
Bảng quan trọng: `agents` (provider/model/memory_config/self_evolve/skill_evolve), `agent_heartbeats`, `agent_context_files`, `mcp_servers` (tool_cache trong `settings`; `tool_prefix`), `mcp_agent_grants`, `channel_instances`, `channel_contacts`, `llm_providers`, `system_configs`, `heartbeat_run_logs`, `usage_events`.
> ⚠️ Một số lệnh ghi bị sandbox của Claude chặn ("Modify Shared Resources" / "Credential Materialization") — khi đó cần user duyệt. Đọc key/secret bị chặn (đúng, không nên đọc).

## 11.6 ⚠️ VẤN ĐỀ ĐANG MỞ — CHI PHÍ AI (QUAN TRỌNG NHẤT HIỆN TẠI)
**Triệu chứng:** bot Telegram trả lời *"Something went wrong"*; log 429 (Gemini) và 402 (DeepSeek).
**Nguyên nhân gốc:** goClaw chạy **5+ pipeline AI** (chat, heartbeat, background consolidation, compaction, embeddings) — tất cả dồn vào provider không đủ dung lượng:
- **DeepSeek** = số dư **0đ** (HTTP 402 "Insufficient Balance").
- **Gemini free** = **5 lệnh/phút/model** → 429 liên tục (pipeline nền `gemini-3.6-flash` ăn hết quota).

**Đã đo (log heartbeat 24h trước khi dọn):** **706 lần chạy, ~42,6 TRIỆU token input/ngày** (~2–4,7 triệu/giờ, 60–266k/run) → đốt sạch $2 DeepSeek trong vài giờ. Thủ phạm: 3 agent × heartbeat 5 phút × session phình 489–798 tin.

**ĐÃ DỌN (giảm ~99%):**
- Tắt heartbeat `mycoder` + `little-fox`, chỉ giữ `support`.
- `support` heartbeat: `interval_sec=1200` (20 phút), `light_context=true`, `isolated_session=true`.
- Tắt tính năng nền per-agent: `agents.memory_config={"enabled":false}`, `self_evolve=false`, `skill_evolve=false` (cả 3 agent).
- → mỗi run từ ~120k → ~3–16k token; ước còn ~150k token/ngày.

**CÒN MỞ (chưa xử):** pipeline nền **TOÀN CỤC** trong `system_configs` vẫn gọi Gemini free:
`background.model=gemini-3.6-flash`, `compaction.model=gemini-3.6-flash`, `embedding.model=gemini-embedding-001` (provider=aistudio). Đây là nguồn 429 còn lại.

**QUYẾT ĐỊNH CẦN CHỐT (chưa xong):**
- **A) Bật billing pay-as-you-go cho Gemini** (khuyên — key sẵn, ~$1–2/tháng, bỏ giới hạn 5/phút). Bật ở Google Cloud/AI Studio cho project của key.
- **B) Nạp lại DeepSeek** + dùng model rẻ `deepseek-chat` (không phải `deepseek-v4-pro`).
- **C) Groq free** (hạn mức cao hơn) — cần thêm provider + key mới.
Sau khi chốt: **chuẩn hóa** `agents.provider/model` cho `support` (+`mycoder`) về 1 provider/model nhất quán, sửa `system_configs` background/compaction/embedding cho khớp, và bỏ mọi override lẫn lộn.

## 11.7 CONFIG ĐANG BỊ TRỘN — CẦN CHUẨN HÓA
Do sửa nhiều lần (cả UI lẫn DB), provider/model đang lẫn lộn. Trước khi chạy tiếp phải set nhất quán:
- `llm_providers` hiện có: **`aistudio`** (Gemini, gemini_native, endpoint OpenAI-compat, có key) và **`deepseek`** (hết tiền). *(provider `gemini-native` cũ đã đổi tên thành `aistudio`.)*
- `system_configs`: `agent.default_provider=anthropic` (⚠️ KHÔNG có provider anthropic/key → chỉ là default, agent override bằng provider riêng).
- Khi chốt provider, set đồng bộ: `agents.provider/model`, `agent_heartbeats.provider_id/model`, và `system_configs` background/compaction/embedding.

## 11.8 5 GOTCHAS heartbeat (đã gỡ — để không dẫm lại)
1. **tool_cache cũ** → agent gọi nhầm `crm_stats` thay vì `get_new_leads`. Fix: refresh MCP server trong goClaw.
2. **Ô "Checklist" (agent_heartbeats.prompt) trống** vì modal reset → ghi thẳng bằng SQL.
3. **Delivery Channel = "None"** → set `channel='simonchiro'`.
4. **Sai `chat_id`** (gửi 5239167089 nhưng chủ dùng 7383945015) → set `chat_id='7383945015'`.
5. **Heartbeat báo NO_REPLY với lead cũ** (session isolated nhớ đã báo) → test bằng **lead MỚI hoàn toàn**, không dùng lại lead cũ / mồi marker.
> Chi tiết cũng lưu ở memory: `.claude/.../memory/goclaw-heartbeat-notify-wiring.md`.

## 11.9 BÀI DAY 15 (nộp) — coi như ĐÃ ĐẠT
- Ảnh cần: (1) danh sách context files của agent, (2) tin Telegram agent tự báo lead, (3) agent trả lời "Bạn là ai?" đúng giọng SOUL.md.
- Bài đăng: `day15_post.txt`. Tag anh Dương Trọng Nghĩa, 2 kênh.

## 11.10 DỮ LIỆU TEST cần dọn
Trong Supabase `leads` có các bản test tạo khi debug: **Bui Huy, Huy Bui, Trần D, Trần Test, Trần E**. Khi xong, xóa trong admin panel để số liệu doanh thu chuẩn.
- Dọn các file backup HTML cũ (`index_backup_*`, `*_snapshot_*`) ở thư mục gốc.
