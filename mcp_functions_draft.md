# MCP Functions — CHỐT (Simon Chiropractic / chiro.vn)

3 function được build đầu tiên cho MCP server (điều khiển qua Telegram → goClaw).
Tất cả dùng chung `brain.db` với website (không tạo DB mới).

---

## 1. `update_hero`  — ⭐ Ưu tiên 5
- **Input:** `new_title` (string) — tiêu đề mới cho landing
- **Output:** `{ success, old_title, new_title }`
- **Làm gì:** Mở `public/index.html` trên VPS → thay tiêu đề nổi bật (hero, phần tử `#hero-headline`) → lưu. Khách refresh thấy ngay.
- **Ví dụ câu nhắn Telegram:**
  - "Đổi tiêu đề landing thành 'Flash sale cuối tuần giảm 30%'"
  - "Sửa tiêu đề trang chủ thành 'Khai giảng khóa mới tháng 10'"

## 2. `crm_stats`  — ⭐ Ưu tiên 5
- **Input:** `period` (string, optional: `today` | `all`, mặc định `all`)
- **Output:** `{ period, customers, orders, paid_orders, revenue }`
- **Làm gì:** Đọc `brain.db` → đếm khách, đơn, đơn đã thanh toán, tổng doanh thu.
- **Ví dụ câu nhắn Telegram:**
  - "Hôm nay có bao nhiêu đơn, doanh thu nhiêu rồi?"
  - "Tổng cộng có bao nhiêu khách và bao nhiêu đơn đã thanh toán?"

## 3. `add_note`  — Ưu tiên 4
- **Input:** `title` (string), `content` (string)
- **Output:** `{ success, id, title }`
- **Làm gì:** Lưu ý tưởng/ghi chú vào bảng `knowledge` của `brain.db`.
- **Ví dụ câu nhắn Telegram:**
  - "Ghi lại idea: quay video demo kỹ thuật nắn Atlas C1 cho landing"
  - "Lưu note: tuần sau chạy quảng cáo Facebook cho khóa Level 1"
