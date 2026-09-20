# NHẬT KÝ KIỂM THỬ VÀ SỬA LỖI HỆ THỐNG (TEST LOG & BUG FIXES)
## Dự án Simon Chiropractic Center (chiro.vn)

---

### 1. 🐛 BUG 1: Lỗi Gửi Trùng Lặp 7–8 Email Xác Nhận Thanh Toán Khi Chuyển Khoản
- **Hiện tượng:** Khi khách hàng quét mã QR chuyển khoản 2.000đ SePay thành công, hòm thư khách hàng nhận tới 7–8 email thông báo thanh toán thành công liên tiếp.
- **Nguyên nhân:**
  1. Front-end `index.html` chạy polling kiểm tra 1.2s/lần + Supabase Realtime, khi có tiền về đã gọi hàm `handlePaymentSuccessFromSepay()` nhiều lần song song trong lúc promise chưa kịp hủy `setInterval`.
  2. Back-end `google-sheets-script.js` tại nhánh `action: confirm_payment` gửi email trực tiếp mà không kiểm tra ô Cột I (Nhật ký Email) xem đã từng gửi chưa.
  3. Mâu thuẫn chuỗi kiểm tra giữa `handleSepayWebhook` (`"ĐÃ GỬI EMAIL XÁC NHẬN"`), `confirm_payment` (`"ĐÃ GỬI EMAIL lúc..."`) và `onEdit` (`!== "ĐÃ GỬI EMAIL"`).
- **Cách khắc phục (Đã fix):**
  - **Front-end (`index.html`):** Bổ sung bộ nhớ đệm `window._handledPaymentSuccessCodes` để đảm bảo mỗi đơn hàng chỉ xử lý sự kiện thanh toán thành công **đúng 1 lần duy nhất** và lập tức dừng polling `stopPaymentAutoCheck()`.
  - **Back-end (`google-sheets-script.js`):** Quy chuẩn tất cả các luồng kiểm tra về 1 điều kiện duy nhất: `!currentEmailLog.includes("ĐÃ GỬI EMAIL")`. Nếu ô Cột I đã từng ghi nhận email, hệ thống chặn hoàn toàn việc gửi lại email thứ 2.

---

### 2. 🐛 BUG 2: Lỗi Khách Nhận Trùng 3 Email Khi Điền Form Danh Sách Chờ / Khảo Sát
- **Hiện tượng:** Khách hàng điền form Khảo sát nhu cầu nhận 3 email chào mừng khác nhau (từ FormSubmit, Google Apps Script và Resend proxy).
- **Nguyên nhân:** FormSubmit gửi kèm tham số `_autoresponse` tạo email tự động phản hồi trùng lặp với email HTML từ Google Apps Script.
- **Cách khắc phục (Đã fix):**
  - Loại bỏ tham số `_autoresponse` trong FormSubmit (chỉ dùng FormSubmit thông báo cho Admin `chiroeduvn@gmail.com`).
  - Loại bỏ hàm gọi lặp `triggerWaitlistWelcomeEmail()` ở front-end.
  - Tập trung gửi **duy nhất 1 email chào mừng chuẩn Y khoa** từ Google Apps Script (`sendWaitlistWelcomeEmail()`).

---

### 3. 🐛 BUG 3: Email Xác Nhận Đăng Ký Ban Đầu Thiếu Số Tài Khoản & Mã VietQR
- **Hiện tượng:** Email xác nhận đăng ký khóa học chỉ có thông tin tên/SĐT/khóa học, bị mất thông tin Số tài khoản ngân hàng và mã QR Code chuyển tiền.
- **Nguyên nhân:** Mẫu phản hồi tự động trước đó chưa được nhúng chuỗi thông tin STK và đường dẫn ảnh VietQR động.
- **Cách khắc phục (Đã fix):**
  - Khôi phục đầy đủ thông tin Ngân hàng ACB (STK: `2412825668`, Chủ TK: `BUI NGOC MINH HUY`), số tiền và Mã đơn hàng SePay.
  - Thêm liên kết ảnh mã **VietQR tự động** (`https://img.vietqr.io/image/ACB-2412825668-compact2.png...`) vào email để học viên mở email có thể quét QR chuyển khoản trực tiếp.

---

### 4. 🐛 BUG 4: Dữ Liệu Khảo Sát / Danh Sách Chờ Trộn Lẫn Vào CRM Khách Hàng & Đơn Hàng Thật
- **Hiện tượng:** Người điền form Khảo sát nhu cầu bị đẩy trực tiếp vào danh sách Khách hàng (`customers`) và Đơn hàng (`orders`) trong trang `/admin`.
- **Nguyên nhân:** Hàm `syncAllWithRemote()` trong `admin.html` chưa có bộ lọc phân loại nguồn dữ liệu.
- **Cách khắc phục (Đã fix):**
  - Thêm hàm kiểm tra `isSurveyOrWaitlist` nhận diện các lead từ kênh Khảo Sát / Danh Sách Chờ / WL.
  - Phân luồng riêng biệt: Lead khảo sát chuyển thẳng về mảng `_crmData.waitlist` và hiển thị tại tab *"📋 Danh Sách Chờ & Khảo Sát"*, hoàn toàn không bị lẫn vào CRM Khách hàng và Đơn hàng.

---

### 5. 🐛 BUG 5: Supabase Bảng Leads Thiếu Cột Mã Hồ Sơ Ưu Tiên & Mã Số Hóa
- **Hiện tượng:** Khi lưu thông tin khảo sát lên Supabase, các trường `priority_code` (WL...) và `summary_code` (`[MT:x|KN:y|HT:z]`) bị trả về `null`.
- **Nguyên nhân:** Schema bảng `leads` ban đầu trên Supabase chưa tạo sẵn các cột này.
- **Cách khắc phục (Đã fix):**
  - Tạo file SQL Migration `supabase_add_waitlist_columns.sql` bổ sung 6 cột: `priority_code`, `summary_code`, `payment_code`, `goal`, `experience`, `format`.
  - Viết lệnh backfill tự động bóc tách mã WL từ các bản ghi dữ liệu cũ.
