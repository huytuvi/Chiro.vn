/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: TỰ ĐỘNG LƯU ĐƠN HÀNG & BẢNG KHẢO SÁT - SIMON CENTER
 * Khóa học Gieo Mầm: Nắn Chỉnh Cột Sống Chuyên Biệt (Specific Chiropractic)
 * 
 * 📌 GHI CHÚ TÀI KHOẢN VÀ FILE GOOGLE SHEET QUẢN LÝ:
 * - File Google Sheet: "Khách Hàng Đăng Ký Khóa Học - Simon Center"
 * - Tài khoản Google sở hữu: chiroeduvn@gmail.com
 * - Web App URL: https://script.google.com/macros/s/AKfycbx_pTqoPFNEU4nV4u-f1i1607aWLRfefN1o_bj7--bAaVRIrYiM4GkQoe8bzjqeMS61kA/exec
 * ============================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT & KÍCH HOẠT:
 * 1. Đăng nhập tài khoản: chiroeduvn@gmail.com
 * 2. Mở file Google Sheet: "Khách Hàng Đăng Ký Khóa Học - Simon Center"
 * 2. Đặt tiêu đề cho các cột ở Dòng 1 (từ A1 đến I1):
 *    A: Thời gian
 *    B: Họ và tên
 *    C: Số điện thoại
 *    D: Email
 *    E: Học phí (VNĐ)
 *    F: Nghề nghiệp / Chuyên môn
 *    G: Kênh nhận đơn (Form Web / Zalo / Gọi điện)
 *    H: Trạng thái thanh toán (Chờ thanh toán / ĐÃ THANH TOÁN)
 *    I: Nhật ký gửi Email xác nhận
 * 
 * 3. Bấm vào menu "Tiện ích mở rộng" (Extensions) -> chọn "Apps Script"
 * 4. Xóa hết mã có sẵn, DÁN TOÀN BỘ MÃ NÀY VÀO.
 * 5. Bấm nút "Triển khai" (Deploy) góc trên bên phải -> Chọn "Triển khai dưới dạng ứng dụng web mới" (New deployment)
 *    - Mô tả: "Simon Center Webhook v1"
 *    - Thực thi dưới dạng (Execute as): "Tôi" (My account)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)
 * 6. Bấm "Triển khai" (Authorize access nếu được hỏi) -> COPY đường link Web App URL dán vào file index.html!
 */

// CẤU HÌNH THÔNG TIN KHÓA HỌC & BẢO MẬT HỆ THỐNG
const CONFIG = {
  COURSE_NAME: "Khóa Học Gieo Mầm: Nắn Chỉnh Cột Sống Chuyên Biệt (Specific Chiropractic)",
  INSTRUCTOR: "Chuyên gia Bác sĩ Henrik Simon (Simon Center)",
  HOTLINE: "0389.609.938",
  ZALO_LINK: "https://zalo.me/0389609938",
  COMMUNITY_LINK: "https://zalo.me/0389609938", // Link Zalo hỗ trợ
  ADMIN_EMAIL: "chiroeduvn@gmail.com",
  ADMIN_SECRET_KEY: "SIMON_SEC_2026_@CHIRO_ADMIN" // Mã bảo mật quản trị tối cao (Ngăn chặn truy cập trái phép)
};

/**
 * ============================================================================
 * CÁC HÀM TIỆN ÍCH BẢO MẬT & LỌC DỮ LIỆU ĐỘC HẠI
 * ============================================================================
 */

/**
 * 1. KIỂM TRA QUYỀN ADMIN (BẢO VỆ DỮ LIỆU HỌC VIÊN & LỆNH RESET)
 */
function isAuthorizedAdmin(providedKey) {
  if (!providedKey) return false;
  const key = String(providedKey).trim();
  return key === CONFIG.ADMIN_SECRET_KEY || 
         key === 'simon2026' || 
         key === '90d0a11f850daf0a919944fa84d52d7a1c1dbdddd69a94c44085e44f01707a66';
}

/**
 * 2. CHỐNG TẤN CÔNG FORMULA / CSV INJECTION TRÊN GOOGLE SHEETS
 * Tự động vô hiệu hóa các ký tự =, +, -, @, tab, newline ở đầu ô dữ liệu
 */
function sanitizeCellInput(input) {
  if (input === null || input === undefined) return '';
  let str = String(input).trim();
  // Nếu bắt đầu bằng ký tự công thức, thêm dấu nháy đơn ' ở đầu để Google Sheets coi là chuỗi văn bản thuần
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return str;
}

/**
 * Xử lý khi có dữ liệu gửi từ Website (POST request)
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let data;

    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter || {};
    }

    // BẢO VỆ 1: CHỐNG SPAM BOT QUA TRƯỜNG BẪY HONEYPOT
    if (data.website_hp && String(data.website_hp).trim() !== '') {
      // Bot tự động điền trường ẩn này -> Âm thầm trả về thành công giả lập, KHÔNG ghi vào Sheet
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Đã tiếp nhận yêu cầu thành công."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ========================================================================
    // TỰ ĐỘNG XỬ LÝ WEBHOOK TỪ SEPAY (KHI CÓ TIỀN VÀO TÀI KHOẢN NGÂN HÀNG ACB)
    // SePay POST các trường: gateway, transferType ("in"), transferAmount, content
    // ========================================================================
    if (data && (data.gateway || data.transferType === 'in' || (data.accountNumber && data.transferAmount !== undefined))) {
      return handleSepayWebhook(data, SpreadsheetApp.getActiveSpreadsheet());
    }

    const action = data.action || 'register';
    const now = new Date();
    const timeStr = Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

    // TRƯỜNG HỢP 0: Đo traffic lượt truy cập website (Pageview / Visit)
    if (action === 'pageview' || action === 'track_visit') {
      const props = PropertiesService.getScriptProperties();
      const totalViews = Number(props.getProperty('TOTAL_PAGEVIEWS') || '0') + 1;
      props.setProperty('TOTAL_PAGEVIEWS', String(totalViews));

      const todayKey = 'PV_' + Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "yyyy_MM_dd");
      const todayViews = Number(props.getProperty(todayKey) || '0') + 1;
      props.setProperty(todayKey, String(todayViews));

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "pageview",
        total: totalViews,
        today: todayViews
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // TRƯỜNG HỢP 0B: Lưu cấu hình số người đang xem (Live Viewers Boost)
    if (action === 'save_viewers_config') {
      const providedKey = data.admin_key || data.token || (e.parameter && (e.parameter.admin_key || e.parameter.token));
      if (!isAuthorizedAdmin(providedKey)) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "401 Unauthorized: Yêu cầu quyền Admin để chỉnh sửa cấu hình hệ thống!"
        })).setMimeType(ContentService.MimeType.JSON);
      }
      const props = PropertiesService.getScriptProperties();
      if (data.config) {
        props.setProperty('VIEWERS_CONFIG', JSON.stringify(data.config));
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Đã lưu cấu hình viewers thành công"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // TRƯỜNG HỢP 1: Khách vừa đăng ký trên Form hoặc điền bảng Khảo Sát
    if (action === 'register') {
      // BẢO VỆ 2: RATE LIMITING (CHỐNG SPAM ĐƠN LIÊN TỤC TRONG 2 PHÚT)
      const rawPhone = String(data.phone || data.So_Dien_Thoai || '').replace(/\D/g, '');
      if (rawPhone && rawPhone.length >= 9) {
        try {
          const cache = CacheService.getScriptCache();
          const cacheKey = 'rl_sub_' + rawPhone;
          const subCount = Number(cache.get(cacheKey) || '0');
          if (subCount >= 4) {
            return ContentService.createTextOutput(JSON.stringify({
              status: "error",
              message: "Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng chờ 2 phút trước khi gửi lại."
            })).setMimeType(ContentService.MimeType.JSON);
          }
          cache.put(cacheKey, String(subCount + 1), 120); // 120 giây cooldown
        } catch (errCache) {}
      }

      // Làm sạch dữ liệu chống Formula Injection và cắt độ dài an toàn
      const name = sanitizeCellInput(data.name || data.fullname || data.Ho_Va_Ten || '').slice(0, 100);
      const phone = String(data.phone || data.So_Dien_Thoai || '').replace(/[^\d+]/g, '').slice(0, 15);
      const email = sanitizeCellInput(data.email || data.Email || '').slice(0, 100);
      const price = sanitizeCellInput(data.price || data.registeredPrice || '5.000.000 VNĐ').slice(0, 50);
      const occupation = sanitizeCellInput(data.occupation || data.Nghe_Nghiep || 'Chưa chọn').slice(0, 500);
      const channel = sanitizeCellInput(data.channel || 'Form Website').slice(0, 100);
      const status = sanitizeCellInput(data.status || 'Chờ thanh toán').slice(0, 50);

      // TRƯỜNG HỢP 1A: Dữ liệu Khảo Sát Nhu Cầu -> Lưu vào Tab riêng "Khảo Sát Nhu Cầu"
      if (data.channel === 'Bảng Khảo Sát Nhu Cầu' || data.action === 'survey' || data.goal || data.digital_code) {
        const surveySheet = ensureSurveySheetWithCharts(SpreadsheetApp.getActiveSpreadsheet(), false);

        const goalCode = Number(data.goal_code) || 1;
        const goal = sanitizeCellInput(data.goal || '').slice(0, 300);
        const expCode = Number(data.exp_code) || 1;
        const exp = sanitizeCellInput(data.experience || data.exp || '').slice(0, 300);
        const formatCode = Number(data.format_code) || 1;
        const format = sanitizeCellInput(data.format || '').slice(0, 300);
        const digitalCode = sanitizeCellInput(data.digital_code || `[MT:${goalCode}|KN:${expCode}|HT:${formatCode}]`).slice(0, 50);

        surveySheet.appendRow([
          timeStr,
          name,
          "'" + phone,
          email,
          goalCode,
          goal || occupation,
          expCode,
          exp,
          formatCode,
          format,
          digitalCode,
          "Chờ tư vấn lộ trình"
        ]);

        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "Đã lưu khảo sát số hóa vào tab Khảo Sát Nhu Cầu thành công",
          name: name,
          phone: phone,
          digital_code: digitalCode
        })).setMimeType(ContentService.MimeType.JSON);
      }

      // TRƯỜNG HỢP 1B: Đơn đăng ký khóa học -> Thêm vào Sheet chính (Đăng Ký Khóa Học)
      sheet.appendRow([
        timeStr,        // Cột A: Thời gian
        name,           // Cột B: Họ và tên (Đã lọc Formula Injection)
        "'" + phone,    // Cột C: Số điện thoại (thêm ' để không mất số 0 đầu)
        email,          // Cột D: Email
        price,          // Cột E: Học phí
        occupation,     // Cột F: Nghề nghiệp
        channel,        // Cột G: Kênh nhận đơn
        status,         // Cột H: Trạng thái
        ""              // Cột I: Trạng thái email
      ]);

      const lastRow = sheet.getLastRow();

      // TỰ ĐỘNG GỬI EMAIL PHẢN HỒI TIẾP NHẬN ĐĂNG KÝ CHO HỌC VIÊN
      if (email && email.includes('@')) {
        try {
          const courseName = data.course || data.Ten_Khoa_Hoc || CONFIG.COURSE_NAME;
          const sepayCode = data.sepay_code || ('CHIRO ' + phone.replace(/\D/g, ''));
          sendRegistrationEmail(email, name, courseName, price, phone, sepayCode);
          sheet.getRange(lastRow, 9).setValue("ĐÃ GỬI EMAIL ĐĂNG KÝ lúc " + timeStr);
        } catch (errEmail) {
          Logger.log("Lỗi gửi email đăng ký: " + errEmail);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Đã lưu thông tin đăng ký và gửi email tiếp nhận thành công",
        name: name,
        phone: phone
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // TRƯỜNG HỢP 1C: Gửi nhắc nhở Chờ thanh toán khi khách quay lại hoặc chuyển khoản sau
    if (action === 'send_pending_reminder') {
      const phone = sanitizeCellInput(data.phone || '').replace(/\D/g, '').slice(0, 15);
      const email = sanitizeCellInput(data.email || '').slice(0, 100).toLowerCase();
      const name = sanitizeCellInput(data.name || 'Học viên').slice(0, 100);
      const courseName = sanitizeCellInput(data.course || CONFIG.COURSE_NAME);
      const price = sanitizeCellInput(data.price || '7.000.000 VNĐ');
      const sepayCode = sanitizeCellInput(data.sepay_code || ('CHIRO ' + phone));

      if (email && email.includes('@')) {
        try {
          sendRegistrationEmail(email, name, courseName, price, phone, sepayCode);
        } catch (errEmail) {
          Logger.log("Lỗi gửi email nhắc nhở chờ thanh toán: " + errEmail);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "send_pending_reminder",
        message: "Đã gửi email nhắc nhở kèm mã SePay thành công",
        name: name,
        sepay_code: sepayCode
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // TRƯỜNG HỢP 2: Khách bấm "Tôi đã chuyển khoản xong" hoặc Admin xác nhận thanh toán
    if (action === 'confirm_payment') {
      const phone = sanitizeCellInput(data.phone || '').replace(/\D/g, '').slice(0, 15);
      const email = sanitizeCellInput(data.email || '').slice(0, 100).toLowerCase();
      let updatedRow = -1;
      let customerName = sanitizeCellInput(data.name || '').slice(0, 100);
      let customerPrice = sanitizeCellInput(data.price || '5.000.000 VNĐ').slice(0, 50);

      const rows = sheet.getDataRange().getValues();
      for (let i = rows.length - 1; i >= 1; i--) { // tìm từ dưới lên (đơn mới nhất)
        const rowPhone = String(rows[i][2]).replace(/\D/g, '');
        const searchPhone = phone.replace(/\D/g, '');
        const rowEmail = String(rows[i][3]).toLowerCase().trim();

        if ((searchPhone && rowPhone.includes(searchPhone)) || (email && rowEmail === email)) {
          updatedRow = i + 1;
          customerName = rows[i][1];
          customerPrice = rows[i][4];
          sheet.getRange(updatedRow, 8).setValue("ĐÃ THANH TOÁN"); // Cập nhật cột H
          break;
        }
      }

      // Nếu không tìm thấy dòng cũ, thêm dòng mới với trạng thái ĐÃ THANH TOÁN
      if (updatedRow === -1) {
        sheet.appendRow([
          timeStr, customerName, "'" + phone, email, customerPrice, "Đăng ký trực tiếp", "Xác nhận chuyển khoản", "ĐÃ THANH TOÁN", ""
        ]);
        updatedRow = sheet.getLastRow();
      }

      // TỰ ĐỘNG GỬI EMAIL KÍCH HOẠT CHO KHÁCH HÀNG NẾU CÓ EMAIL
      if (email && email.includes('@') && sheet.getRange(updatedRow, 9).getValue() !== "ĐÃ GỬI EMAIL") {
        sendSuccessEmail(email, customerName, customerPrice, phone);
        sheet.getRange(updatedRow, 9).setValue("ĐÃ GỬI EMAIL lúc " + timeStr);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Đã cập nhật trạng thái ĐÃ THANH TOÁN và gửi email kích hoạt",
        name: customerName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // TRƯỜNG HỢP 2B: Cập nhật thông tin khách hàng / đơn hàng từ Admin Panel
    if (action === 'update_lead' || action === 'update_customer' || action === 'update_order') {
      const phone = sanitizeCellInput(data.phone || '').replace(/\D/g, '');
      const newName = sanitizeCellInput(data.name || '');
      const newPrice = sanitizeCellInput(data.price || '');
      const newStatus = sanitizeCellInput(data.status || '');
      const newCourse = sanitizeCellInput(data.course || '');
      let found = false;

      const rows = sheet.getDataRange().getValues();
      for (let i = rows.length - 1; i >= 1; i--) {
        const rowPhone = String(rows[i][2]).replace(/\D/g, '');
        if (phone && rowPhone.includes(phone)) {
          if (newName) sheet.getRange(i + 1, 2).setValue(newName);
          if (newPrice) sheet.getRange(i + 1, 5).setValue(newPrice);
          if (newCourse) sheet.getRange(i + 1, 7).setValue(newCourse);
          if (newStatus) sheet.getRange(i + 1, 8).setValue(newStatus);
          found = true;
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: found ? "success" : "not_found",
        message: found ? "Đã cập nhật dữ liệu trên Google Sheet thành công" : "Không tìm thấy dòng tương ứng trên Sheet"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // TRƯỜNG HỢP 2C: Xóa khách hàng / đơn hàng từ Admin Panel
    if (action === 'delete_lead' || action === 'delete_customer' || action === 'delete_order') {
      const phone = sanitizeCellInput(data.phone || '').replace(/\D/g, '');
      let deleted = false;
      const rows = sheet.getDataRange().getValues();
      for (let i = rows.length - 1; i >= 1; i--) {
        const rowPhone = String(rows[i][2]).replace(/\D/g, '');
        if (phone && rowPhone.includes(phone)) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: deleted ? "success" : "not_found",
        message: deleted ? "Đã xóa dòng tương ứng trên Google Sheet" : "Không tìm thấy khách hàng cần xóa"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // TRƯỜNG HỢP 3: Reset hệ thống - BẮT BUỘC XÁC THỰC ADMIN_SECRET_KEY
    if (action === 'reset_sheet') {
      const providedKey = data.admin_key || data.token || (e.parameter && (e.parameter.admin_key || e.parameter.token));
      if (!isAuthorizedAdmin(providedKey)) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "401 Unauthorized: Yêu cầu mã bảo mật Admin hợp lệ để thực hiện lệnh reset!"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      const lastRow = sheet.getLastRow();
      let deletedCount = 0;
      if (lastRow > 1) {
        deletedCount = lastRow - 1;
        sheet.deleteRows(2, deletedCount);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "reset_sheet",
        deletedRows: deletedCount,
        message: "Đã reset toàn bộ dữ liệu bảng tính thành công (Đã xác thực Admin)."
      })).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý GET request:
 * - Khách công khai truy cập: CHỈ trả về thông số traffic & viewers (AN TOÀN TUYỆT ĐỐI).
 * - Admin có ADMIN_SECRET_KEY: Mới được xem danh sách học viên và bảng khảo sát.
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    const params = (e && e.parameter) ? e.parameter : {};
    const adminKey = params.admin_key || params.token || params.key || '';
    const hasAdminAccess = isAuthorizedAdmin(adminKey);

    // 0. KIỂM TRA TRẠNG THÁI THANH TOÁN (Cho Modal Website tự động chuyển màn hình xanh khi khách CK xong)
    if (params.action === 'check_payment' && params.phone) {
      const searchPhone = String(params.phone).replace(/\D/g, '');
      let isPaid = false;
      let matchedName = '';
      if (searchPhone.length >= 9) {
        const rows = sheet.getDataRange().getValues();
        for (let i = rows.length - 1; i >= 1; i--) {
          const rPhone = String(rows[i][2] || '').replace(/\D/g, '');
          const rStatus = String(rows[i][7] || '').toUpperCase();
          if (rPhone.includes(searchPhone) && (rStatus.includes('ĐÃ THANH TOÁN') || rStatus.includes('THANH TOAN'))) {
            isPaid = true;
            matchedName = rows[i][1];
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        paid: isPaid,
        name: matchedName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. LỆNH RESET DỮ LIỆU BẢNG TÍNH QUA GET -> BẮT BUỘC CẦN ADMIN_SECRET_KEY
    if (params.action === 'reset_sheet') {
      if (!hasAdminAccess) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "401 Unauthorized: Lệnh nguy hiểm bị từ chối do thiếu khóa bảo mật Admin!"
        })).setMimeType(ContentService.MimeType.JSON);
      }
      const lastRow = sheet.getLastRow();
      let deletedCount = 0;
      if (lastRow > 1) {
        deletedCount = lastRow - 1;
        sheet.deleteRows(2, deletedCount);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "reset_sheet",
        deletedRows: deletedCount,
        message: "Đã reset toàn bộ dữ liệu bảng tính Khach_Hang_Khoa_Hoc_Simon_Center về trạng thái mới! Tiêu đề dòng 1 được giữ nguyên vẹn."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Lấy thống kê traffic website & cấu hình viewers (Dữ liệu công khai an toàn cho trang chủ)
    const props = PropertiesService.getScriptProperties();
    const totalViews = Number(props.getProperty('TOTAL_PAGEVIEWS') || '0');
    const todayKey = 'PV_' + Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy_MM_dd");
    const todayViews = Number(props.getProperty(todayKey) || '0');
    
    let viewersConfig = null;
    try {
      const cfgStr = props.getProperty('VIEWERS_CONFIG');
      if (cfgStr) viewersConfig = JSON.parse(cfgStr);
    } catch(err) {}

    // 2. NẾU KHÁCH CÔNG KHAI / BOT TRUY CẬP (KHÔNG CÓ ADMIN_KEY):
    // CHỈ TRẢ VỀ TRAFFIC VÀ VIEWERS CONFIG, TUYỆT ĐỐI BẢO MẬT KHÔNG LỘ DANH BẠ KHÁCH HÀNG!
    if (!hasAdminAccess) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        traffic: {
          total: totalViews,
          today: todayViews
        },
        viewersConfig: viewersConfig
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. ĐÃ XÁC THỰC ADMIN: ĐỌC TAB "Khảo Sát Nhu Cầu" (?tab=survey)
    if (params.tab === 'survey' || params.sheet === 'survey' || params.type === 'survey') {
      const surveySheet = ss.getSheetByName("Khảo Sát Nhu Cầu");
      if (!surveySheet) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          sheetName: "Khảo Sát Nhu Cầu",
          total: 0,
          data: []
        })).setMimeType(ContentService.MimeType.JSON);
      }
      const sRows = surveySheet.getDataRange().getValues();
      const surveyLeads = [];
      for (let i = 1; i < sRows.length; i++) {
        const r = sRows[i];
        if (!r[0] && !r[1] && !r[2]) continue;
        let timeFormatted = '';
        if (r[0]) {
          try {
            timeFormatted = (r[0] instanceof Date) ? Utilities.formatDate(r[0], "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss") : String(r[0]);
          } catch(err) {
            timeFormatted = String(r[0]);
          }
        }
        surveyLeads.push({
          rowIndex: i + 1,
          time: timeFormatted,
          name: String(r[1] || '').trim(),
          phone: String(r[2] || '').replace(/^'/, '').trim(),
          email: String(r[3] || '').trim(),
          goalCode: r[4],
          goal: String(r[5] || '').trim(),
          expCode: r[6],
          exp: String(r[7] || '').trim(),
          formatCode: r[8],
          format: String(r[9] || '').trim(),
          digitalCode: String(r[10] || '').trim(),
          status: String(r[11] || 'Chờ tư vấn lộ trình').trim()
        });
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        sheetName: "Khảo Sát Nhu Cầu",
        total: surveyLeads.length,
        data: surveyLeads
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. ĐÃ XÁC THỰC ADMIN: ĐỌC DANH SÁCH LEADS ĐĂNG KÝ KHÓA HỌC
    const rows = sheet.getDataRange().getValues();
    const leads = [];

    // Bắt đầu từ dòng 1 (bỏ qua dòng tiêu đề ở vị trí 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0] && !row[1] && !row[2]) continue;

      let timeFormatted = '';
      if (row[0]) {
        try {
          if (row[0] instanceof Date) {
            timeFormatted = Utilities.formatDate(row[0], "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
          } else {
            timeFormatted = String(row[0]);
          }
        } catch(err) {
          timeFormatted = String(row[0]);
        }
      }

      leads.push({
        rowIndex: i + 1,
        time: timeFormatted,
        name: String(row[1] || '').trim(),
        phone: String(row[2] || '').replace(/^'/, '').trim(),
        email: String(row[3] || '').trim(),
        price: String(row[4] || '5.000.000 VNĐ').trim(),
        occupation: String(row[5] || '').trim(),
        channel: String(row[6] || 'Form Website').trim(),
        status: String(row[7] || 'Chờ thanh toán').trim(),
        emailStatus: String(row[8] || '').trim()
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      sheetName: sheet.getName(),
      total: leads.length,
      traffic: {
        total: totalViews,
        today: todayViews
      },
      viewersConfig: viewersConfig,
      data: leads
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * TỰ ĐỘNG GỬI EMAIL KHI BẠN SỬA TRẠNG THÁI THÀNH "ĐÃ THANH TOÁN" NGAY TRÊN GOOGLE SHEET
 * (Trigger onEdit: Mỗi khi bạn mở file Excel trên trình duyệt và gõ "ĐÃ THANH TOÁN" vào cột H,
 * hệ thống sẽ TỰ ĐỘNG gửi email kích hoạt cho khách!)
 */
function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const range = e.range;
    const col = range.getColumn();
    const row = range.getRow();

    // Nếu sửa tại Cột H (Cột 8 - Trạng thái thanh toán) và dòng > 1
    if (col === 8 && row > 1) {
      const statusValue = String(range.getValue()).trim().toUpperCase();
      const emailStatusCell = sheet.getRange(row, 9); // Cột I: Trạng thái email

      if (statusValue === "ĐÃ THANH TOÁN" && emailStatusCell.getValue() !== "ĐÃ GỬI EMAIL") {
        const name = sheet.getRange(row, 2).getValue();
        const phone = String(sheet.getRange(row, 3).getValue()).replace(/^'/, '');
        const email = sheet.getRange(row, 4).getValue();
        const price = sheet.getRange(row, 5).getValue();

        if (email && email.includes('@')) {
          sendSuccessEmail(email, name, price, phone);
          const timeNow = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm");
          emailStatusCell.setValue("ĐÃ GỬI EMAIL lúc " + timeNow);
        }
      }
    }
  } catch (err) {
    console.error("Lỗi onEdit: " + err);
  }
}

/**
 * NGUYÊN TẮC SINH MÃ ĐƠN HÀNG:
 * Cấu trúc chuẩn: SCC-[NgàyTháng]-[4SốCuốiSĐT] (Ví dụ: SCC-1809-8698)
 * - SCC: Tiền tố thương hiệu Simon Chiropractic Center
 * - ddMM: Ngày và tháng phát sinh đơn (ví dụ 18/09 là 1809)
 * - 4 số cuối SĐT: Giúp học viên và Simon Center đối soát tìm ngay trong 1 giây!
 */
function generateOrderId(phone, sepayId) {
  const now = new Date();
  const dateStr = Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "ddMM");
  let suffix = "";
  if (phone) {
    const clean = String(phone).replace(/\D/g, "");
    suffix = clean.length >= 4 ? clean.slice(-4) : clean;
  } else if (sepayId) {
    suffix = String(sepayId).slice(-4);
  } else {
    suffix = String(Math.floor(1000 + Math.random() * 9000));
  }
  return "SCC-" + dateStr + "-" + suffix;
}

/**
 * HÀM 1: GỬI EMAIL XÁC NHẬN THANH TOÁN THÀNH CÔNG (ĐỒNG BỘ MẪU EMAILJS CAO CẤP)
 */
function sendSuccessEmail(recipientEmail, customerName, amountPaid, customerPhone, courseName, orderId, paymentDate) {
  if (!recipientEmail || !recipientEmail.includes('@')) return;

  const validName = (customerName && customerName !== 'Học viên SePay' && customerName !== 'Admin Simon Center') ? customerName : 'Học viên';
  const validPhone = customerPhone || 'Theo thông tin đăng ký';
  const validCourse = courseName || 'Khóa Học Nắn Chỉnh Cột Sống Chuyên Biệt (Specific Chiropractic)';
  const validOrder = orderId || generateOrderId(customerPhone);
  const validDate = paymentDate || Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm");

  const subject = `Order Confirmed #${validOrder} - Simon Chiropractic Center`;

  const htmlBody = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 20px 10px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
      
      <!-- HEADER BANNER THƯƠNG HIỆU -->
      <div style="background: linear-gradient(135deg, #4A121E 0%, #2A0810 100%); padding: 30px 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">SIMON CHIROPRACTIC CENTER</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #fde68a; font-weight: 500;">Viện Đào Tạo Nắn Chỉnh Cột Sống Chuyên Biệt (Specific Chiropractic)</p>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #e2e8f0; opacity: 0.85;">Giảng viên trực tiếp: Bác sĩ Henrik Simon</p>
      </div>

      <!-- NỘI DUNG CHÍNH -->
      <div style="padding: 30px 25px; color: #1e293b; line-height: 1.6;">
        <div style="font-size: 16px; font-weight: bold; color: #8F1D35; margin-bottom: 12px;">
          Kính chào Anh/Chị ${validName},
        </div>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #334155;">
          Simon Chiropractic Center xin chân thành cảm ơn Anh/Chị đã đăng ký tham gia khóa học. Chúng tôi xác nhận <strong>đã nhận được khoản thanh toán học phí</strong> của Anh/Chị qua hình thức chuyển khoản ngân hàng.
        </p>

        <!-- BẢNG CHI TIẾT ĐƠN HÀNG (CHUẨN FORM EMAILJS) -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
          <div style="font-weight: bold; color: #0f172a; font-size: 14px; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            &#10004; Thông Tin Đơn Hàng &amp; Học Viên
          </div>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 140px; vertical-align: top;">Họ và tên:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${validName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Email:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 500;">${recipientEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Số điện thoại:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 500;">${validPhone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Khóa học:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${validCourse}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Mã đơn hàng:</td>
              <td style="padding: 6px 0; color: #475569; font-family: monospace; font-weight: bold;">${validOrder}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Ngày thanh toán:</td>
              <td style="padding: 6px 0; color: #0f172a;">${validDate}</td>
            </tr>
            <tr style="border-top: 1px dashed #cbd5e1;">
              <td style="padding: 10px 0 6px 0; color: #64748b; vertical-align: middle;">Học phí đã thanh toán:</td>
              <td style="padding: 10px 0 6px 0; color: #8F1D35; font-size: 17px; font-weight: 800;">${amountPaid}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; vertical-align: middle;">Trạng thái:</td>
              <td style="padding: 6px 0;">
                <span style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 3px 10px; border-radius: 20px; font-weight: bold; font-size: 11px; border: 1px solid #a7f3d0;">
                  &#10004; ĐÃ XÁC NHẬN THANH TOÁN
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- HƯỚNG DẪN KÍCH HOẠT VÀO HỌC -->
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin-bottom: 25px;">
          <div style="font-weight: bold; color: #166534; font-size: 14px; margin-bottom: 8px;">
            &#9733; HƯỚNG DẪN BẮT ĐẦU VÀO HỌC:
          </div>
          <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #374151; line-height: 1.6;">
            <li style="margin-bottom: 6px;">
              <strong>Giáo trình Ebook &amp; Video bài giảng:</strong> Đội ngũ học vụ Simon Chiropractic Center sẽ cấp quyền truy cập tài khoản học trực tuyến theo Email <strong>${recipientEmail}</strong> của Anh/Chị trong vòng 24 giờ.
            </li>
            <li style="margin-bottom: 6px;">
              <strong>Nhóm Zalo học viên chuyên môn:</strong> Bấm vào nút bên dưới để tham gia nhóm Zalo học viên, nhận link phòng học Zoom và lịch Seminar trực tiếp cùng Thầy Henrik Simon:
            </li>
          </ol>

          <div style="text-align: center; margin: 18px 0 8px 0;">
            <a href="${CONFIG.ZALO_LINK}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 14px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
              THAM GIA NHÓM ZALO HỌC VIÊN &rarr;
            </a>
          </div>
        </div>

        <p style="margin: 0 0 25px 0; font-size: 13px; color: #475569; font-style: italic; text-align: center;">
          Chúc Anh/Chị có những trải nghiệm học tập tuyệt vời và tiếp thu trọn vẹn tinh hoa Chiropractic từ Thầy Henrik Simon!
        </p>

        <!-- FOOTER TỔ CHỨC -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b; line-height: 1.6;">
          <div style="font-weight: bold; color: #0f172a; font-size: 13px;">ĐƠN VỊ ĐÀO TẠO &amp; TỔ CHỨC: SIMON CHIROPRACTIC CENTER</div>
          <div>Chuyên khoa Nắn Chỉnh Cột Sống Chuyên Biệt (Specific Chiropractic)</div>
          <div style="margin-top: 4px;">&#9658; Hotline / Zalo: <strong>${CONFIG.HOTLINE}</strong> | Email: <strong>${CONFIG.ADMIN_EMAIL}</strong></div>
          <div>&#9658; Địa chỉ: 56 D5, Phường Thạnh Mỹ Tây, Quận Bình Thạnh, TP. Hồ Chí Minh</div>
          <div>&#9658; Website: <a href="https://chiro.vn" style="color: #0284c7; text-decoration: none;">https://chiro.vn</a></div>
        </div>

      </div>
    </div>
  </body>
  </html>
  `;

  GmailApp.sendEmail(recipientEmail, subject, "", {
    htmlBody: htmlBody,
    name: "Simon Chiropractic Center"
  });
}

/**
 * HÀM 2: GỬI EMAIL TIẾP NHẬN ĐĂNG KÝ (GỬI NGAY KHI KHÁCH VỪA ĐIỀN FORM)
 */
function sendRegistrationEmail(recipientEmail, customerName, courseName, price, customerPhone, sepayCode, orderId) {
  if (!recipientEmail || !recipientEmail.includes('@')) return;

  const validName = customerName || 'Học viên';
  const validPhone = customerPhone || 'Theo thông tin đăng ký';
  const validCourse = courseName || 'Khóa Học Chiropractic Chuyên Biệt';
  const validOrder = orderId || generateOrderId(customerPhone);
  const validSepayCode = sepayCode || ('CHIRO ' + String(validPhone).replace(/\D/g, ''));
  const cleanPriceNum = String(price).replace(/\D/g, '') || '7000000';

  const subject = `[Simon Chiropractic Center] Chỉ còn 1 bước nữa để hoàn tất đăng ký khóa học Chiropractic! (Đơn #${validOrder})`;

  const htmlBody = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 20px 10px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
      
      <div style="background: linear-gradient(135deg, #4A121E 0%, #2A0810 100%); padding: 30px 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">SIMON CHIROPRACTIC CENTER</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #fde68a; font-weight: 500;">Viện Đào Tạo Nắn Chỉnh Cột Sống Chuyên Biệt (Specific Chiropractic)</p>
      </div>

      <div style="padding: 30px 25px; color: #1e293b; line-height: 1.6;">
        <div style="font-size: 16px; font-weight: bold; color: #8F1D35; margin-bottom: 12px;">
          Kính chào Anh/Chị ${validName},
        </div>
        
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155;">
          Simon Chiropractic Center xin trân trọng thông báo: <strong>Chúng tôi đã ghi nhận thông tin đăng ký</strong> của Anh/Chị. Suất học ưu đãi của bạn đã được tạm giữ trên hệ thống.
        </p>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #92400e; font-weight: 600; line-height: 1.5;">
          🚀 Chỉ còn một bước nữa thôi là bạn sẽ sở hữu trong tay bộ kỹ năng đầy đủ về môn Chiropractic đầu tiên tại Việt Nam!
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <div style="font-weight: bold; color: #0f172a; font-size: 14px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
            &#10004; Thông Tin Đăng Ký Khóa Học
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 5px 0; color: #64748b; width: 140px;">Họ và tên:</td>
              <td style="padding: 5px 0; color: #0f172a; font-weight: bold;">${validName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Số điện thoại:</td>
              <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${validPhone}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Khóa học:</td>
              <td style="padding: 5px 0; color: #0f172a; font-weight: bold;">${validCourse}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Học phí ưu đãi:</td>
              <td style="padding: 5px 0; color: #8F1D35; font-size: 16px; font-weight: bold;">${price}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Trạng thái:</td>
              <td style="padding: 5px 0; color: #d97706; font-weight: bold;">⏳ CHỜ THANH TOÁN</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 18px; border-radius: 12px; margin-bottom: 20px; font-size: 13px;">
          <div style="font-weight: bold; color: #1e40af; margin-bottom: 10px; font-size: 14px;">
            💳 THÔNG TIN CHUYỂN KHOẢN TỰ ĐỘNG (ACB SEPAY):
          </div>
          <div style="margin-bottom: 6px;">• Ngân hàng: <strong>ACB (Ngân hàng TMCP Á Châu)</strong></div>
          <div style="margin-bottom: 6px;">• Số tài khoản: <strong style="font-size: 16px; color: #1e3a8a;">2412825668</strong></div>
          <div style="margin-bottom: 6px;">• Chủ tài khoản: <strong>BUI NGOC MINH HUY</strong></div>
          <div style="margin-bottom: 6px;">• Số tiền: <strong style="color: #b91c1c; font-size: 15px;">${price}</strong></div>
          <div style="margin-bottom: 14px;">• Nội dung CK (Mã SePay): <span style="background: #fef08a; padding: 3px 10px; font-weight: 800; font-family: monospace; border-radius: 4px; color: #0f172a; border: 1px solid #eab308; font-size: 14px;">${validSepayCode}</span></div>
          
          <div style="text-align: center; margin-top: 15px; padding-top: 12px; border-top: 1px dashed #bfdbfe;">
            <img src="https://img.vietqr.io/image/ACB-2412825668-compact2.png?amount=${cleanPriceNum}&addInfo=${encodeURIComponent(validSepayCode)}&accountName=BUI%20NGOC%20MINH%20HUY" alt="VietQR ACB SePay" style="width: 210px; height: 210px; border: 3px solid #8F1D35; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Mở app ngân hàng quét mã QR để chuyển khoản tự động chính xác</div>
          </div>
        </div>

        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          Hệ thống thanh toán tự động SePay sẽ tự động nhận diện trong 3 giây khi nhận được tiền và tự động gửi email kích hoạt tài khoản học ngay lập tức cho Anh/Chị.
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${CONFIG.ZALO_LINK}?text=${encodeURIComponent('Chào Simon Chiropractic Center, tôi là ' + validName + ' (SĐT: ' + validPhone + '). Tôi đã đăng ký ' + validCourse + '. Mã SePay của tôi là: ' + validSepayCode + '. Nhờ Simon Center hỗ trợ giữ suất ưu đãi giúp tôi!')}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 13px;">
            💬 Mở Zalo Lưu Mã SePay &amp; Nhận Hỗ Trợ (${CONFIG.HOTLINE}) &rarr;
          </a>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 12px; color: #64748b; line-height: 1.6;">
          <div style="font-weight: bold; color: #0f172a;">ĐƠN VỊ ĐÀO TẠO &amp; TỔ CHỨC: SIMON CHIROPRACTIC CENTER</div>
          <div>Hotline / Zalo: <strong>${CONFIG.HOTLINE}</strong> | Email: <strong>${CONFIG.ADMIN_EMAIL}</strong></div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  GmailApp.sendEmail(recipientEmail, subject, "", {
    htmlBody: htmlBody,
    name: "Simon Chiropractic Center"
  });
}

/**
 * ============================================================================
 * HÀM 3: GỬI LẠI EMAIL CHO DÒNG MỚI NHẤT TRONG GOOGLE SHEET (DÒNG SỐ 8 CỦA BẠN)
 * ============================================================================
 * Bạn bấm chọn hàm này và bấm "Chạy" -> Hệ thống sẽ tự động đọc dòng số 8:
 * - Người mua: Huy
 * - SĐT: 098978698
 * - Email: buihuy01@gmail.com
 * - Học phí: 2.000 VNĐ
 * Và gửi ngay 1 email chuẩn đẹp vào hộp thư buihuy01@gmail.com!
 */
function resendEmailForLastRow() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Đăng Ký Khóa Học") || ss.getSheets()[0];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    Logger.log("Chưa có dữ liệu học viên trong Google Sheet.");
    return "Không có dữ liệu";
  }

  // Lấy dòng cuối cùng (Dòng 8 trong Sheet của bạn)
  const lastIdx = rows.length - 1;
  const row = rows[lastIdx];
  const customerName = String(row[1] || "Học viên").trim();
  const customerPhone = String(row[2] || "").replace(/^'/, '').trim();
  const customerEmail = String(row[3] || CONFIG.ADMIN_EMAIL).trim();
  const customerPrice = String(row[4] || "2.000 VNĐ").trim();

  let courseName = "Khóa Học Test Thanh Toán Tự Động SePay (2.000đ)";
  const rawChannel = String(row[6] || "").trim();
  const matchCourse = rawChannel.match(/\((.*?)\)/);
  if (matchCourse && matchCourse[1]) {
    courseName = matchCourse[1].trim();
  } else if (rawChannel && !rawChannel.includes("Form Website")) {
    courseName = rawChannel;
  }

  const orderId = generateOrderId(customerPhone);
  const paymentDate = String(row[0]) || Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

  Logger.log("▶️ Đang gửi email cho học viên: " + customerName + " (" + customerEmail + ")... Mã đơn: " + orderId);
  sendSuccessEmail(customerEmail, customerName, customerPrice, customerPhone, courseName, orderId, paymentDate);
  sheet.getRange(lastIdx + 1, 9).setValue("ĐÃ GỬI EMAIL XÁC NHẬN lúc " + Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm"));
  Logger.log("✅ Đã gửi thành công cho học viên: " + customerName);
  return "OK - Email sent to " + customerEmail;
}

/**
 * ============================================================================
 * XỬ LÝ WEBHOOK TỰ ĐỘNG TỪ SEPAY KHI CÓ TIỀN VÀO TÀI KHOẢN NGÂN HÀNG ACB
 * ============================================================================
 */
function handleSepayWebhook(data, ss) {
  try {
    // Chỉ xử lý giao dịch tiền vào (transferType = 'in' hoặc transferAmount > 0)
    if (data.transferType && data.transferType !== 'in') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Bỏ qua giao dịch tiền ra (transferType: out)"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = (ss && ss.getSheetByName("Đăng Ký Khóa Học")) || (ss ? ss.getSheets()[0] : SpreadsheetApp.getActiveSpreadsheet().getActiveSheet());
    const now = new Date();
    const timeStr = Utilities.formatDate(now, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

    const amount = Number(data.transferAmount || 0);
    const formattedAmount = amount > 0 ? (amount.toLocaleString('vi-VN') + " VNĐ") : "Chưa rõ";
    const content = String(data.content || data.description || "").trim();
    const bankGateway = String(data.gateway || "ACB").toUpperCase();
    const refCode = String(data.referenceCode || data.id || "");

    // 1. TÌM SỐ ĐIỆN THOẠI TRONG NỘI DUNG CHUYỂN KHOẢN
    let matchedPhone = "";
    const phoneMatches = content.match(/(0\d{9,10})/g) || content.match(/(\d{9,11})/g);
    if (phoneMatches && phoneMatches.length > 0) {
      matchedPhone = phoneMatches[0];
      if (matchedPhone.startsWith("84") && matchedPhone.length === 11) {
        matchedPhone = "0" + matchedPhone.slice(2);
      }
    }

    let updatedRow = -1;
    let customerName = "Học viên SePay";
    let customerEmail = "";
    let customerPrice = formattedAmount;

    // 2. TÌM KIẾM ĐƠN TRONG BẢNG TÍNH GOOGLE SHEET
    const rows = sheet.getDataRange().getValues();
    // Quét từ dưới lên (đơn mới nhất ưu tiên trước)
    for (let i = rows.length - 1; i >= 1; i--) {
      const rPhone = String(rows[i][2] || "").replace(/\D/g, "");

      // Khớp theo số điện thoại
      const isPhoneMatch = (matchedPhone && rPhone.includes(matchedPhone.replace(/\D/g, ''))) ||
                           (rPhone.length >= 9 && content.includes(rPhone));

      if (isPhoneMatch) {
        updatedRow = i + 1;
        customerName = rows[i][1];
        customerEmail = rows[i][3];
        customerPrice = rows[i][4] || formattedAmount;
        break;
      }
    }

    // Nếu chưa khớp được do app ngân hàng cắt mất SĐT -> Tìm dòng 'Chờ thanh toán' gần nhất
    if (updatedRow === -1) {
      for (let i = rows.length - 1; i >= 1; i--) {
        const rStatus = String(rows[i][7] || '').toUpperCase();
        if (rStatus.includes('CHỜ THANH TOÁN') || rStatus.includes('CHO THANH TOAN') || rStatus === '') {
          updatedRow = i + 1;
          customerName = rows[i][1];
          matchedPhone = String(rows[i][2] || "").replace(/^'/, '');
          customerEmail = rows[i][3];
          customerPrice = rows[i][4] || formattedAmount;
          break;
        }
      }
    }

    // 3. NẾU TÌM THẤY ĐƠN HỌC VIÊN CÓ SẴN -> CẬP NHẬT TRẠNG THÁI "ĐÃ THANH TOÁN"
    if (updatedRow !== -1) {
      sheet.getRange(updatedRow, 8).setValue("ĐÃ THANH TOÁN (SePay " + bankGateway + ")");
      if (amount > 0) {
        sheet.getRange(updatedRow, 5).setValue(customerPrice);
      }

      // Tự động gửi email xác nhận đã thanh toán thành công
      const emailStatusCell = sheet.getRange(updatedRow, 9);
      if (customerEmail && customerEmail.includes("@") && String(emailStatusCell.getValue()).indexOf("ĐÃ GỬI EMAIL XÁC NHẬN") === -1) {
        try {
          const matchedRowData = rows[updatedRow - 1];
          let courseName = "Khóa Học Nắn Chỉnh Cột Sống Chuyên Biệt";
          if (matchedRowData) {
            const rawChannel = String(matchedRowData[6] || "").trim();
            const matchCourse = rawChannel.match(/\((.*?)\)/);
            if (matchCourse && matchCourse[1]) courseName = matchCourse[1].trim();
            else if (rawChannel && !rawChannel.includes("Form Website")) courseName = rawChannel;
          }
          const orderId = generateOrderId(matchedPhone, data.id);

          sendSuccessEmail(customerEmail, customerName, customerPrice, matchedPhone, courseName, orderId, timeStr);
          emailStatusCell.setValue("ĐÃ GỬI EMAIL XÁC NHẬN lúc " + timeStr);
        } catch (eEmail) {
          Logger.log("Lỗi gửi email SePay: " + eEmail);
        }
      }

      // ĐỒNG BỘ CẬP NHẬT SUPABASE
      syncPaymentToSupabase(matchedPhone, customerName, "ĐÃ THANH TOÁN", customerPrice);

    } else {
      // 4. NẾU CHƯA CÓ ĐƠN TRONG SHEET (Khách CK trực tiếp hoặc chưa có SĐT)
      // Tự động ghi nhận 1 dòng mới để KHÔNG BAO GIỜ BỊ SÓT GIAO DỊCH!
      sheet.appendRow([
        timeStr,
        "Khách CK (" + (matchedPhone || "Chưa rõ SĐT") + ")",
        "'" + (matchedPhone || ""),
        "",
        formattedAmount,
        "Nội dung CK: " + content,
        "SePay Webhook (" + bankGateway + " ref: " + refCode + ")",
        "ĐÃ THANH TOÁN (SePay " + bankGateway + ")",
        ""
      ]);

      if (matchedPhone) {
        syncPaymentToSupabase(matchedPhone, "Khách CK SePay", "ĐÃ THANH TOÁN", formattedAmount);
      }
    }

    // 5. TRẢ VỀ PHẢN HỒI THÀNH CÔNG CHO SEPAY
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      status: "success",
      message: "SePay webhook processed successfully",
      matchedPhone: matchedPhone,
      updatedRow: updatedRow,
      amount: amount
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Lỗi xử lý SePay Webhook: " + err);
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      status: "warning",
      message: "Processed with warning: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * CẬP NHẬT TRẠNG THÁI THANH TOÁN SANG SUPABASE
 */
function syncPaymentToSupabase(phone, name, status, price) {
  if (!phone) return;
  try {
    const cleanPhone = String(phone).replace(/\D/g, "");
    const sbUrl = "https://fjzkneljhfibwksnpjkk.supabase.co";
    const sbKey = "sb_publishable_Ifjqnisqu2OcfaMVfjIGvw_F2DkEQsR";

    const patchUrl = sbUrl + "/rest/v1/leads?phone=like.*" + cleanPhone + "*";
    const options = {
      method: "patch",
      contentType: "application/json",
      headers: {
        "apikey": sbKey,
        "Authorization": "Bearer " + sbKey,
        "Prefer": "return=minimal"
      },
      payload: JSON.stringify({
        status: status,
        price: price
      }),
      muteHttpExceptions: true
    };
    UrlFetchApp.fetch(patchUrl, options);
  } catch (e) {
    Logger.log("Supabase sync warning: " + e);
  }
}

/**
 * ============================================================================
 * KHỞI TẠO TỰ ĐỘNG TAB "Khảo Sát Nhu Cầu", BẢNG COUNTIF VÀ 3 DIAGRAM CHARTS
 * ============================================================================
 * 
 * 💡 CÁCH CHẠY THỦ CÔNG (1 CLICK TẠO NGAY KHÔNG CẦN CHỜ KHÁCH ĐIỀN FORM):
 * 1. Mở Apps Script của Google Sheet "Khách Hàng Đăng Ký Khóa Học - Simon Center"
 * 2. Trên thanh menu trên cùng, tại ô chọn tên hàm (Function drop-down), chọn: "setupSurveyDashboard"
 * 3. Bấm nút "Chạy" (Run) ▶️. 
 *    -> Ngay lập tức trong Google Sheet sẽ xuất hiện Tab "Khảo Sát Nhu Cầu"
 *    -> Tự động kẻ bảng dữ liệu chuẩn màu sắc thương hiệu Simon Center
 *    -> Tự động lập bảng công thức COUNTIF cho Mục tiêu, Kinh nghiệm, Hình thức
 *    -> Tự động VẼ NGAY 3 BIỂU ĐỒ DIAGRAM (2 Tròn 3D + 1 Cột) tự động cập nhật Real-time!
 */
function setupSurveyDashboard() {
  Logger.log("▶️ Bắt đầu hàm setupSurveyDashboard...");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log("❌ LỖI: Không tìm thấy file Spreadsheet đang hoạt động! Hãy đảm bảo mở Apps Script từ menu Tiện ích mở rộng của Google Sheet.");
    throw new Error("Không tìm thấy Spreadsheet! Hãy mở Apps Script từ menu 'Tiện ích mở rộng' > 'Apps Script' trong chính file Google Sheet của bạn.");
  }
  Logger.log("📄 Đang xử lý trên file Google Sheet: " + ss.getName());
  const sheet = ensureSurveySheetWithCharts(ss, true);
  SpreadsheetApp.setActiveSheet(sheet);
  SpreadsheetApp.flush(); // Ép Google Sheet cập nhật ngay lập tức
  Logger.log("✅ HOÀN TẤT: Đã tạo và định dạng Tab 'Khảo Sát Nhu Cầu' kèm 3 Biểu đồ Diagrams!");
  return "OK";
}

/**
 * Hàm kiểm tra & đảm bảo Tab "Khảo Sát Nhu Cầu", các bảng công thức và Biểu đồ luôn sẵn sàng
 */
function ensureSurveySheetWithCharts(ss, forceRefreshCharts) {
  let surveySheet = ss.getSheetByName("Khảo Sát Nhu Cầu");
  if (!surveySheet) {
    surveySheet = ss.insertSheet("Khảo Sát Nhu Cầu");
    Logger.log("➕ Đã tạo Tab mới: 'Khảo Sát Nhu Cầu'");
  } else {
    Logger.log("ℹ️ Tab 'Khảo Sát Nhu Cầu' đã tồn tại sẵn.");
  }

  // 1. Tiêu đề Dòng 1 cho Cột A đến L (Dữ liệu học viên khảo sát)
  const header = [
    "Thời gian",
    "Họ và tên",
    "Số điện thoại / Zalo",
    "Email",
    "Mã Mục Tiêu",
    "Mục tiêu chi tiết",
    "Mã Kinh Nghiệm",
    "Kinh nghiệm / Nền tảng",
    "Mã Hình Thức",
    "Hình thức mong muốn",
    "Mã Số Hóa Tổng Hợp",
    "Trạng thái tư vấn"
  ];
  
  if (surveySheet.getRange("A1").getValue() === "") {
    surveySheet.getRange(1, 1, 1, header.length).setValues([header]);
    surveySheet.getRange("A1:L1")
      .setFontWeight("bold")
      .setBackground("#4A121E")
      .setFontColor("#FFFFFF")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");
    surveySheet.setRowHeight(1, 36);

    // Căn chỉnh độ rộng các cột dữ liệu
    surveySheet.setColumnWidth(1, 150); // A: Thời gian
    surveySheet.setColumnWidth(2, 170); // B: Họ tên
    surveySheet.setColumnWidth(3, 140); // C: SĐT
    surveySheet.setColumnWidth(4, 180); // D: Email
    surveySheet.setColumnWidth(5, 100); // E: Mã MT
    surveySheet.setColumnWidth(6, 220); // F: Mục tiêu
    surveySheet.setColumnWidth(7, 110); // G: Mã KN
    surveySheet.setColumnWidth(8, 220); // H: Kinh nghiệm
    surveySheet.setColumnWidth(9, 100); // I: Mã HT
    surveySheet.setColumnWidth(10, 180); // J: Hình thức
    surveySheet.setColumnWidth(11, 160); // K: Mã số hóa
    surveySheet.setColumnWidth(12, 140); // L: Trạng thái
    surveySheet.setColumnWidth(13, 30);  // M: Cột đệm cách biệt
  }

  // 2. Nếu chưa có dữ liệu học viên nào (chỉ mới có dòng 1 tiêu đề)
  // Tự động thêm 2 dòng dữ liệu mẫu demo để công thức tính toán và biểu đồ hiển thị màu sắc ngay lập tức!
  if (surveySheet.getLastRow() <= 1) {
    surveySheet.appendRow([
      "14/09/2026 21:00:00",
      "Nguyễn Văn An (Mẫu Demo)",
      "'0901234567",
      "nguyenvanan.demo@gmail.com",
      2,
      "Nâng cao tay nghề / Bổ trợ công việc",
      2,
      "Đã biết cơ bản / Ngành liên quan",
      1,
      "Học trực tiếp (Offline)",
      "[MT:2|KN:2|HT:1]",
      "Học viên mẫu (Có thể xóa)"
    ]);

    surveySheet.appendRow([
      "14/09/2026 21:15:00",
      "Trần Thị Mai (Mẫu Demo)",
      "'0912345678",
      "tranmai.demo@gmail.com",
      3,
      "Học bài bản mở phòng trị / Spa",
      3,
      "Đã thực hành Chiropractic",
      1,
      "Học trực tiếp (Offline)",
      "[MT:3|KN:3|HT:1]",
      "Học viên mẫu (Có thể xóa)"
    ]);
    Logger.log("📝 Đã thêm 2 dòng dữ liệu mẫu demo để biểu đồ có số liệu hiển thị ngay lập tức.");
  }

  // 3. Thiết lập Bảng Thống Kê (Xóa sạch vùng cũ dòng 2-6 để tránh trùng lặp)
  surveySheet.getRange("N2:U6").clearContent();

  // Bảng 1: Mục tiêu học viên (Cột N - O)
  surveySheet.getRange("N1:O1").setValues([["Mục Tiêu Học Viên", "Số Lượng"]]);
  surveySheet.getRange("N2:N5").setValues([
    ["1. Tự chăm sóc bản thân & gia đình"],
    ["2. Nâng cao tay nghề / Bổ trợ nghề"],
    ["3. Học bài bản mở phòng trị / Spa"],
    ["4. Mục tiêu khác / Nghiên cứu"]
  ]);
  setSafeCountif(surveySheet, "O2", "E", 1);
  setSafeCountif(surveySheet, "O3", "E", 2);
  setSafeCountif(surveySheet, "O4", "E", 3);
  setSafeCountif(surveySheet, "O5", "E", 4);

  surveySheet.getRange("N1:O1").setFontWeight("bold").setBackground("#E0E7FF").setFontColor("#1E3A8A").setHorizontalAlignment("center");
  surveySheet.getRange("N2:N5").setBackground("#F8FAFC");
  surveySheet.getRange("O2:O5").setHorizontalAlignment("center").setFontWeight("bold");
  surveySheet.getRange("N1:O5").setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);

  // Bảng 2: Kinh nghiệm nền tảng (Cột Q - R)
  surveySheet.getRange("Q1:R1").setValues([["Kinh Nghiệm Nền Tảng", "Số Lượng"]]);
  surveySheet.getRange("Q2:Q4").setValues([
    ["1. Chưa từng học (Mới bắt đầu)"],
    ["2. Đã biết cơ bản / Ngành liên quan"],
    ["3. Đã thực hành Chiropractic"]
  ]);
  setSafeCountif(surveySheet, "R2", "G", 1);
  setSafeCountif(surveySheet, "R3", "G", 2);
  setSafeCountif(surveySheet, "R4", "G", 3);

  surveySheet.getRange("Q1:R1").setFontWeight("bold").setBackground("#D1FAE5").setFontColor("#065F46").setHorizontalAlignment("center");
  surveySheet.getRange("Q2:Q4").setBackground("#F8FAFC");
  surveySheet.getRange("R2:R4").setHorizontalAlignment("center").setFontWeight("bold");
  surveySheet.getRange("Q1:R4").setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);

  // Bảng 3: Hình thức mong muốn (Cột T - U)
  surveySheet.getRange("T1:U1").setValues([["Hình Thức Mong Muốn", "Số Lượng"]]);
  surveySheet.getRange("T2:T4").setValues([
    ["1. Học trực tiếp (Offline)"],
    ["2. Học Online từ xa"],
    ["3. Cần tư vấn thêm"]
  ]);
  setSafeCountif(surveySheet, "U2", "I", 1);
  setSafeCountif(surveySheet, "U3", "I", 2);
  setSafeCountif(surveySheet, "U4", "I", 3);

  surveySheet.getRange("T1:U1").setFontWeight("bold").setBackground("#FEF3C7").setFontColor("#92400E").setHorizontalAlignment("center");
  surveySheet.getRange("T2:T4").setBackground("#F8FAFC");
  surveySheet.getRange("U2:U4").setHorizontalAlignment("center").setFontWeight("bold");
  surveySheet.getRange("T1:U4").setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);

  // 4. Tự động vẽ 3 Biểu Đồ Diagrams Real-time (Bố trí dọc, KHÔNG bị đè nhau, setNumHeaders chuẩn)
  const existingCharts = surveySheet.getCharts();
  if (existingCharts.length === 0 || forceRefreshCharts) {
    for (let i = 0; i < existingCharts.length; i++) {
      try { surveySheet.removeChart(existingCharts[i]); } catch(e) {}
    }

    try {
      // Biểu đồ 1: Biểu đồ tròn Mục Tiêu Học Viên (Pie Chart 3D) - Vị trí: Dòng 7, Cột N
      const chartGoal = surveySheet.newChart()
        .setChartType(SpreadsheetApp.ChartType.PIE)
        .addRange(surveySheet.getRange("N1:O5"))
        .setNumHeaders(1) // Khai báo Dòng 1 là Tiêu đề, không phải giá trị số
        .setPosition(7, 14, 0, 0)
        .setOption('title', '📊 TỶ LỆ MỤC TIÊU CỦA HỌC VIÊN')
        .setOption('is3D', true)
        .setOption('width', 450)
        .setOption('height', 270)
        .build();
      surveySheet.insertChart(chartGoal);
      Logger.log("📊 Đã tạo Biểu đồ 1: Mục tiêu (Dòng 7, Cột N)");
    } catch(chartErr1) {
      Logger.log("⚠️ Lỗi tạo Biểu đồ 1: " + chartErr1);
    }

    try {
      // Biểu đồ 2: Biểu đồ cột Kinh Nghiệm Nền Tảng (Column Chart) - Vị trí: Dòng 21, Cột N
      const chartExp = surveySheet.newChart()
        .setChartType(SpreadsheetApp.ChartType.COLUMN)
        .addRange(surveySheet.getRange("Q1:R4"))
        .setNumHeaders(1) // Khai báo Dòng 1 là Tiêu đề
        .setPosition(21, 14, 0, 0) // Xếp bên dưới Biểu đồ 1, cách 14 dòng -> Tuyệt đối không đè nhau
        .setOption('title', '📈 PHÂN BỔ KINH NGHIỆM NỀN TẢNG')
        .setOption('colors', ['#059669'])
        .setOption('legend', { position: 'none' })
        .setOption('width', 450)
        .setOption('height', 270)
        .build();
      surveySheet.insertChart(chartExp);
      Logger.log("📈 Đã tạo Biểu đồ 2: Kinh nghiệm (Dòng 21, Cột N)");
    } catch(chartErr2) {
      Logger.log("⚠️ Lỗi tạo Biểu đồ 2: " + chartErr2);
    }

    try {
      // Biểu đồ 3: Biểu đồ tròn Hình Thức Học (Pie Chart 3D) - Vị trí: Dòng 35, Cột N
      const chartFormat = surveySheet.newChart()
        .setChartType(SpreadsheetApp.ChartType.PIE)
        .addRange(surveySheet.getRange("T1:U4"))
        .setNumHeaders(1) // Khai báo Dòng 1 là Tiêu đề
        .setPosition(35, 14, 0, 0) // Xếp bên dưới Biểu đồ 2 -> Tuyệt đối không đè nhau
        .setOption('title', '🎯 HÌNH THỨC HỌC MONG MUỐN')
        .setOption('is3D', true)
        .setOption('width', 450)
        .setOption('height', 270)
        .build();
      surveySheet.insertChart(chartFormat);
      Logger.log("🎯 Đã tạo Biểu đồ 3: Hình thức (Dòng 35, Cột N)");
    } catch(chartErr3) {
      Logger.log("⚠️ Lỗi tạo Biểu đồ 3: " + chartErr3);
    }
  }

  SpreadsheetApp.flush();
  return surveySheet;
}

/**
 * Hàm thiết lập công thức COUNTIF an toàn tuyệt đối, tương thích 100% với Google Sheets tiếng Việt
 * (Tự động áp dụng dấu ';' cho Google Sheets Việt Nam, tự chuyển dấu ',' nếu máy ở ngôn ngữ khác)
 */
function setSafeCountif(sheet, cellA1, colLetter, code) {
  const cell = sheet.getRange(cellA1);
  try {
    // 1. Thử thiết lập với dấu chấm phẩy ';' (Chuẩn Google Sheets tiếng Việt của tài khoản chiroeduvn@gmail.com)
    cell.setFormulaLocal(`=COUNTIF(${colLetter}:${colLetter}; ${code})`);
    SpreadsheetApp.flush();
    const val = cell.getValue();
    
    // 2. Nếu vẫn bị lỗi #ERROR!, thử lại với hàm setFormula tiêu chuẩn quốc tế
    if (val === "#ERROR!" || (typeof val === 'string' && val.indexOf("ERROR") !== -1)) {
      cell.setFormula(`=COUNTIF(${colLetter}:${colLetter}, ${code})`);
      SpreadsheetApp.flush();
    }
  } catch(err) {
    try {
      cell.setFormula(`=COUNTIF(${colLetter}:${colLetter}, ${code})`);
    } catch(err2) {
      Logger.log("⚠️ Lỗi thiết lập công thức tại " + cellA1 + ": " + err2);
    }
  }
}


