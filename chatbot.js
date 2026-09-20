/**
 * SIMON CENTER CHIROPRACTIC CHATBOT v2.0
 * Tích hợp Kịch bản bán hàng chuẩn Y đức & Động cơ Tra cứu Chuyên khoa Chiropractic
 * Dựa trên 351 bài Y khoa chuyên sâu của Thầy Henrik Simon trong brain.db
 */

(function () {
  if (window.ChiroChatbotLoaded) return;
  window.ChiroChatbotLoaded = true;

  // =============================================================================
  // 🤖 CẤU HÌNH TRÍ TUỆ NHÂN TẠO GOOGLE GEMINI (GEMINI AI ENGINE)
  // =============================================================================
  const GEMINI_CONFIG = {
    apiKey: localStorage.getItem("CHIRO_GEMINI_API_KEY") || "",
    model: localStorage.getItem("CHIRO_GEMINI_MODEL") || "gemini-2.5-flash",
    enabled: localStorage.getItem("CHIRO_GEMINI_ENABLED") !== "false"
  };

  const GEMINI_SYSTEM_PROMPT = `Bạn là Trợ lý Chuyên môn Trí tuệ Nhân tạo của Simon Chiropractic Center (làm việc cùng Bác sĩ Henrik Simon - chuyên gia Trị liệu Thần kinh Cột sống hàng đầu từ Viện DISC Đức).

MỤC TIÊU & TÍNH CÁCH:
- Chuyên nghiệp, ấm áp, đồng cảm sâu sắc, khiêm nhường chuẩn mực Y đức.
- Khi khách hàng chia sẻ đam mê hoặc băn khoăn về việc chưa từng học Y bao giờ: Hãy nhiệt liệt hoan nghênh, đồng cảm và khẳng định 100% họ hoàn toàn làm chủ được nhờ phương pháp đòn bẩy tự nhiên không dùng sức tay và Micro-drills rèn lực tại nhà.
- Tuyệt đối chính xác về chuyên môn Chiropractic. Dùng tiếng Việt tự nhiên, bình dị, dễ hiểu, tránh thuật ngữ sáo rỗng.

DANH MỤC TỪ CẤM & QUY TẮC BẮT BUỘC (TUYỆT ĐỐI TUÂN THỦ):
1. ❌ TUYỆT ĐỐI CẤM dùng từ "trọn đời" dưới mọi hình thức! Thay bằng: "không giới hạn thời gian 24/7", "lâu dài", "xuyên suốt quá trình thực hành", "bền vững".
2. ❌ TUYỆT ĐỐI CẤM dùng từ "bẻ khớp trôi nổi", "đối thủ", "ngoài thị trường" để chê bai hay so sánh tiêu cực. CHỈ TẬP TRUNG NÊU BẬT ĐIỂM MẠNH CHUYÊN MÔN CỦA SIMON CENTER: Chuẩn y học cơ sinh học Châu Âu, tính chính xác (Specific), an toàn với Red Flags.
3. ❌ TUYỆT ĐỐI CẤM dùng cụm từ "1 phần mười giây" hoặc "1/10 giây" (chưa được kiểm chứng). Thay bằng: "ở thời điểm thả lỏng cơ", "trong tích tắc giải phóng lực", "kỹ thuật thả lỏng và tận dụng trọng lực tự nhiên (Body Drop)".
4. ❌ TUYỆT ĐỐI KHÔNG tự tiện đề cập "trả góp", "trả góp 0%", "thẻ tín dụng" trừ khi khách hàng CHỦ ĐỘNG HỎI về trả góp!
5. ❌ TUYỆT ĐỐI CẤM dùng từ "Video 4K First-Person POV" (thay bằng "Video với các góc quay khác nhau").
6. ❌ TUYỆT ĐỐI CẤM hứa hẹn sai pháp lý: "học xong ra mở phòng khám ngay". Minh bạch: Chứng nhận hoàn thành của Simon Center do Bác sĩ Henrik Simon ký; việc hành nghề trị liệu có can thiệp tại Việt Nam phải tuân thủ điều kiện văn bằng của Bộ Y tế/Sở Y tế.
7. ❌ Nếu khách đang ở tab Khóa học: Tuyệt đối KHÔNG hỏi lại khách "anh/chị muốn chat chế độ nào".

DỮ LIỆU ĐẦY ĐỦ 6 SẢN PHẨM & HỌC PHÍ TẠI SIMON CENTER:
1. Module Lẻ Online — Cổ Vai Gáy (HWS): 1.000.000 VNĐ (giá gốc 2.000.000 VNĐ).
2. Module Lẻ Online — Thắt Lưng - Chậu (LWS): 1.000.000 VNĐ (giá gốc 2.000.000 VNĐ).
3. Level 1 Online — Nền Tảng Cột Sống Full-Spine (Modul A): 7.000.000 VNĐ (giá gốc 8.500.000 VNĐ).
4. Level 2 Online — Tứ Chi & Phân Tích X-Quang Chuyên Sâu (Modul B): 7.000.000 VNĐ (giá gốc 8.500.000 VNĐ).
5. The Full Online Collection: Trọn bộ toàn diện Level 1 + Level 2 (351 bài giảng Cột sống + Tứ chi + X-ray + Micro-drills + Chứng chỉ Certificate). Học phí ưu đãi 12.900.000 VNĐ (giá gốc 14.900.000 VNĐ).
6. Khóa Huấn Luyện Offline Cầm Tay Chỉ Việc: 36.000.000 VNĐ (giá niêm yết 42.000.000 VNĐ, 3-4 ngày trực tiếp cùng Thầy Henrik Simon, lớp giới hạn 10-12 người).
7. ĐẶC QUYỀN KHẤU TRỪ 100%: Toàn bộ số tiền đã đóng ở bất kỳ khóa Online nào (kể cả Module lẻ 1 triệu) đều được khấu trừ 100% khi nâng cấp lên khóa lớn hơn hoặc khóa Offline.

BỘ QUY CHUẨN 10 CÂU HỎI & CÁCH TRẢ LỜI:
- Q1 (Phù hợp với ai): Nêu rõ 3 nhóm (PT/Yoga/Spa; Bác sĩ/YHCT/VLTL; Người chăm sóc gia đình).
- Q2 (Người mới từ số 0): Khẳng định làm chủ được nhờ mô hình 3D, bài tập Micro-drills rèn lực tại nhà và ranh giới Red Flags.
- Q3 (Học online có thực hành được không): Thiết kế chuẩn y khoa như "bộ thước đo quy chuẩn" đối chiếu, học từ ca lâm sàng thật 1:1, khấu trừ 100% lên Offline.
- Q4 (Các khóa học & giá): Nêu đủ 6 khóa học trên.
- Q5 (Điểm mạnh phương pháp): Nêu 4 thế mạnh bản quyền của Simon Center, không so sánh đối thủ.
- Q6 (Nữ/thể lực yếu): Không dùng sức cơ bắp tay, dùng đòn bẩy và trọng lực rơi cơ thể Body Drop ở thời điểm thả lỏng cơ.
- Q7 (Chứng chỉ & pháp lý): Cấp Certificate of Completion chính thức từ Simon Chiropractic Center do Bác sĩ Henrik Simon ký; hành nghề can thiệp tuân thủ văn bằng Bộ Y tế.
- Q8 (Học riêng từng phần): Hoàn toàn được, có Module lẻ 1.000.000đ, khấu trừ 100%. Mời liên hệ Ban tổ chức qua Hotline/Zalo: 093 115 8868 để được tư vấn tốt hơn.
- Q9 (Thanh toán & kích hoạt): Quét QR SePay tự động, gửi email xác nhận và trợ lý kết nối Zalo hỗ trợ.
- Q10 (Hỗ trợ ca khó): Gia nhập nhóm chuyên môn kín cùng Thầy Henrik Simon, hội chẩn ca bệnh qua hình ảnh/X-quang, đồng hành lâu dài xuyên suốt quá trình thực hành.`;

  // =============================================================================
  // 📝 HỆ THỐNG DỮ LIỆU CHATBOT (BOT_DATA):
  // 1. Gồm 2 nhóm: 'course' (Khóa học & Tuyển sinh) và 'clinical' (Chuyên khoa Y học)
  // 2. Tự động nhận diện từ khóa chuyên môn sâu từ 351 bài kiến thức brain.db
  // =============================================================================
  const BOT_DATA = {
    greetings: {
      course: `Dạ em kính chào anh/chị ạ! Rất vui được hỗ trợ anh/chị tìm hiểu về <strong>Chương Trình Đào Tạo Chiropractic Chuẩn Y Khoa</strong> của Bác sĩ Henrik Simon.<br><br>
Anh/chị có thể hỏi em bất kỳ nội dung nào: <em>lộ trình học từ con số 0, học trọn bộ hoặc học từng phần lẻ (cổ vai gáy, thắt lưng - chậu...), học phí ưu đãi, lớp thực hành Offline Cầm tay chỉ việc hay bài giảng mẫu học thử miễn phí</em>.<br><br>
Dạ anh/chị đang muốn tìm hiểu khóa học nắn chỉnh cho vùng cột sống nào hay muốn bắt đầu từ lộ trình toàn diện ạ? Anh/chị cứ nhắn tự nhiên cho em nhé ạ!`,
      clinical: `Dạ em kính chào anh/chị ạ! Em là Trợ lý Chuyên môn hỗ trợ <strong>Hội Chẩn & Bệnh Học Cột Sống</strong> cùng Bác sĩ Henrik Simon.<br><br>
Anh/chị có thể trao đổi cùng em về các ca lâm sàng thực tế: <em>phân tích phim X-quang, thoát vị đĩa đệm L4-L5/L5-S1, lệch khung chậu chân ngắn chân dài, kẹt khớp cùng chậu ISG, khớp thái dương hàm hay ranh giới Cảnh báo đỏ (Red Flags)</em>.<br><br>
Dạ ca bệnh của anh/chị đang có triệu chứng hoặc kết quả chẩn đoán hình ảnh như thế nào ạ? Anh/chị chia sẻ chi tiết để em cùng hội chẩn nhé ạ!`
    },

    // DANH MỤC CÂU HỎI NHANH THEO 2 TAB
    categories: {
      course: {
        label: "🎓 Khóa Học (12)",
        questions: [
          { id: "c_courses_and_pricing", text: "💰 Các khóa học & Bảng giá chi tiết" },
          { id: "c_zero_base_passion", text: "🌱 Chưa biết gì & Rất đam mê có học được không?" },
          { id: "c_lumbar_part", text: "🦴 Muốn học riêng phần lưng / thắt lưng được không?" },
          { id: "c_cervical_part", text: "💆 Muốn học riêng phần cổ vai gáy được không?" },
          { id: "c_beginner_budget", text: "💡 Kinh phí ban đầu ít thì lộ trình thế nào?" },
          { id: "q1", text: "🎓 Học online liệu có làm được thật không?" },
          { id: "q2", text: "🩺 PT Gym / Spa / chưa học Y có học được không?" },
          { id: "q3", text: "💎 Giá trị cốt lõi & Tiêu chuẩn Y học Simon Center" },
          { id: "c_schedule_duration", text: "⏱️ Thời gian học bao lâu? Xem lại được không?" },
          { id: "c_location", text: "📍 Lớp Offline học ở đâu? Có ở TP.HCM / Hà Nội?" },
          { id: "c_career_outcome", text: "💼 Đầu ra sau khóa học & Cơ hội mở phòng khám" },
          { id: "q4", text: "📊 Khóa học có dạy đọc phim X-quang không?" },
          { id: "q6", text: "🤝 Mua khóa Online sau lên Offline có được trừ tiền?" }
        ]
      },
      clinical: {
        label: "🩺 Hỏi Chuyên Khoa (12)",
        questions: [
          { id: "c_redflags", text: "🚨 Cảnh báo đỏ (Red Flags): Khi nào TUYỆT ĐỐI CẤM NẮN?" },
          { id: "c_cavitation", text: "💥 Tiếng 'rắc' (Cavitation) bản chất là gì? Có hại không?" },
          { id: "c_pelvis", text: "🦴 Lệch chậu & Chân ngắn - chân dài (Ilium PI / AS) là sao?" },
          { id: "c_isg", text: "⚡ Kẹt khớp cùng chậu (ISG Blockade) đau ở đâu, khám thế nào?" },
          { id: "c_disc", text: "📉 Thoát vị đĩa đệm L4-L5 & Phân biệt đau thần kinh tọa do Cơ hình lê?" },
          { id: "c_c1_atlas", text: "🧠 Đốt đội C1 (Atlas) liên quan gì Đau đầu Migraine & Chóng mặt?" },
          { id: "c_tmj", text: "🦷 Khớp cắn hàm (TMG) kêu lục cục & Há miệng lệch xử lý ra sao?" },
          { id: "c_osteoporosis", text: "👵 Người già loãng xương có nắn được không? Lưu ý an toàn?" },
          { id: "c_extremity", text: "🦵 Kẹt sụn chêm gối, Lật sơ mi cổ chân & Khớp ngoại vi?" },
          { id: "c_xray", text: "🔬 Đọc phim X-quang Chiropractic cần đo các chỉ số nào?" },
          { id: "c_hvla_simon", text: "🎯 Kỹ thuật HVLA & Phương pháp ngón cái (Simon-Technik) có gì hay?" },
          { id: "c_pediatric", text: "👶 Trẻ sơ sinh vẹo cổ, khóc dạ đề: Hội chứng KISS nắn thế nào?" }
        ]
      }
    },

    // KHO DỮ LIỆU CÂU TRẢ LỜI CHI TIẾT
    answers: {
      // --- DANH SÁCH KHÓA HỌC & BẢNG GIÁ CHI TIẾT (2 PHẦN TỰ ĐỘNG) ---
      c_courses_and_pricing_part1: {
        text: `Dạ em xin gửi anh/chị thông tin chi tiết và học phí minh bạch các chương trình đào tạo tại <strong>Simon Chiropractic Center</strong> ạ:<br><br>
1. 💆 <strong>Module Lẻ Online — Chuyên Sâu Cổ Vai Gáy (HWS):</strong><br>
• Kỹ thuật sờ nắn, giải phóng đốt sống cổ C1–C7, đoạn chuyển tiếp C7-T1, xử lý đau mỏi, đau đầu, tê bì tay và test De-Kleyn an toàn.<br>
• Học phí ưu đãi: <strong>1.000.000 VNĐ</strong> (Gốc: 2.000.000 VNĐ). Truy cập học tập dài hạn 24/7.<br><br>
2. 🦴 <strong>Module Lẻ Online — Chuyên Sâu Thắt Lưng - Chậu (LWS):</strong><br>
• Nắm vững giải phẫu chức năng L1–L5, xương cùng S1, kẹt khớp cùng chậu ISG, chỉnh lệch chân ngắn - chân dài và phục hồi đĩa đệm.<br>
• Học phí ưu đãi: <strong>1.000.000 VNĐ</strong> (Gốc: 2.000.000 VNĐ). Truy cập học tập dài hạn 24/7.<br><br>
3. 🟩 <strong>Level 1 Online — Nền Tảng Cột Sống Full-Spine (Modul A):</strong><br>
• Cơ sinh học và kỹ thuật nắn chỉnh toàn bộ trục cột sống: Cổ C1-C7, Ngực T1-T12, Thắt lưng L1-L5 và Khung chậu S1-ISG.<br>
• Học phí ưu đãi: <strong>7.000.000 VNĐ</strong> (Gốc: 8.500.000 VNĐ).<br><br>
4. 🟦 <strong>Level 2 Online — Tứ Chi & Phân Tích X-Quang Chuyên Sâu (Modul B):</strong><br>
• Kỹ thuật nắn chỉnh khớp ngoại vi (chi trên, chi dưới) và phương pháp đọc, đo đạc phim X-quang cơ sinh học.<br>
• Học phí ưu đãi: <strong>7.000.000 VNĐ</strong> (Gốc: 8.500.000 VNĐ).<br><br>
5. ⭐ <strong>The Full Online Collection (Trọn Bộ Toàn Diện Level 1 + Level 2):</strong><br>
• Gói hoàn chỉnh nhất gồm toàn bộ 351 bài giảng: Cột sống Full-Spine + Tứ chi + Đo đọc phim X-quang. Cấp Certificate chính thức.<br>
• Học phí ưu đãi: <strong>12.900.000 VNĐ</strong> (Gốc: 14.900.000 VNĐ — Tiết kiệm ngay 1.100.000đ so với mua lẻ Level 1 và Level 2).<br><br>
6. 👑 <strong>Workshop Offline Cầm Tay Chỉ Việc (3-4 Ngày Cùng Thầy Henrik Simon):</strong><br>
• Lớp giới hạn 10-12 học viên, trực tiếp Bác sĩ Henrik Simon chỉnh sửa từng góc đặt tay, thế đứng và cảm giác lực trên người thật.<br>
• Học phí: <strong>36.000.000 VNĐ</strong> (Niêm yết: 42.000.000 VNĐ).<br><br>
💡 <em>Đặc quyền khấu trừ 100%:</em> Toàn bộ số tiền anh/chị đã đóng ở các khóa Online sẽ được <strong>khấu trừ 100%</strong> khi đăng ký nâng cấp lên lớp Workshop Offline Cầm tay chỉ việc này ạ!<br><br>
Dạ anh/chị đang muốn bắt đầu với một Module chuyên biệt hay tìm hiểu khóa toàn diện ạ?`,
        cta: null
      },

      c_courses_and_pricing_part2: {
        text: `Dạ để đồng hành cùng học viên đạt kết quả lâm sàng an toàn và chuẩn xác nhất, các khóa học tại Simon Center đều được xây dựng theo những tiêu chuẩn chuyên môn rất khắt khe ạ:<br><br>
🎯 <strong>1. Chuẩn Y Học Cơ Sinh Học Châu Âu:</strong><br>
Toàn bộ kiến thức kế thừa hơn 20 năm kinh nghiệm lâm sàng của Bác sĩ Henrik Simon và Viện DISC (Đức), chú trọng hiểu rõ bản chất giải phẫu cơ sinh học thay vì học vẹt thao tác.<br><br>
🎥 <strong>2. Video Với Các Góc Quay Khác Nhau:</strong><br>
Hệ thống video chất lượng cao với nhiều góc máy (cận cảnh điểm tiếp xúc ngón tay, góc khóa khớp và hướng truyền lực), giúp anh/chị quan sát trực quan từng động tác kỹ thuật.<br><br>
🏋️ <strong>3. Phương Pháp Micro-Drills Rèn Phản Xạ Lực Tại Nhà:</strong><br>
Hệ thống bài tập mô phỏng lực rơi cơ thể (Body Drop) trên đệm mút và bóng phản xạ, giúp bàn tay hình thành cảm giác lực nhuần nhuyễn trước khi thao tác trên người thật — hoàn toàn không lo run tay.<br><br>
🚨 <strong>4. Ranh Giới Cảnh Báo Đỏ (Red Flags) & An Toàn Tuyệt Đối:</strong><br>
Trang bị bài bản các test loại trừ bệnh lý nguy hiểm và các vùng chống chỉ định y khoa, giúp người thầy thuốc luôn tự tin và bảo vệ an toàn cao nhất cho người bệnh.<br><br>
Dạ không biết anh/chị đang muốn tìm hiểu một lộ trình toàn diện từ đầu hay đang quan tâm nắn chỉnh cho một vùng tổn thương cụ thể vậy ạ? Anh/chị chia sẻ thêm với em nhé ạ!`,
        cta: "trial"
      },

      // --- CÂU HỎI MỚI: HỌC RIÊNG LẺ TỪNG PHẦN (LƯNG / CỔ / TỨ CHI) ---
      c_lumbar_part: {
        text: `Dạ hoàn toàn được anh/chị nhé ạ! Simon Center có thiết kế riêng các gói học linh hoạt để đáp ứng đúng nhu cầu thực tế của anh/chị mà không bắt buộc phải mua trọn gói ngay từ đầu:<br><br>
🦴 <strong>MODULE LẺ ONLINE — CHUYÊN SÂU THẮT LƯNG - CHẬU (LWS):</strong><br>
• <strong>Nội dung trọng tâm:</strong> Làm chủ giải phẫu chức năng và kỹ thuật nắn chỉnh vùng thắt lưng L1–L5, xương cùng S1, kẹt khớp cùng chậu ISG và chỉnh lệch khung chậu (chân ngắn - chân dài).<br>
• <strong>Kỹ thuật thực chiến:</strong> Xử lý thoát vị đĩa đệm L4-L5, L5-S1, giải áp đau thần kinh tọa, hội chứng cơ hình lê (Piriformis) và phục hồi đường cong sinh lý thắt lưng an toàn.<br>
• <strong>Hình thức học:</strong> Hệ thống video với các góc quay khác nhau kết hợp bài tập Micro-drills rèn lực rơi (Body Drop) tại nhà, tài khoản học dài hạn 24/7.<br>
• <strong>Học phí ưu đãi:</strong> <strong>1.000.000 VNĐ</strong> (Học phí gốc: 2.000.000 VNĐ).<br><br>
💡 <strong>Đặc quyền khấu trừ 100% khi nâng cấp:</strong><br>
Nếu sau này anh/chị thấy hiệu quả và muốn nâng cấp lên khóa toàn diện Full-Spine hoặc Offline, <strong>toàn bộ 1.000.000đ đã đóng sẽ được khấu trừ 100%</strong> vào học phí khóa sau, anh/chị hoàn toàn không bị mất phí hay thiệt thòi gì ạ!<br><br>
Để lựa chọn đúng phần học phù hợp nhất với nhu cầu và ca bệnh thực tế của mình, anh/chị xin vui lòng liên hệ với Ban tổ chức qua Hotline / Zalo: <strong>093 115 8868</strong> để được tư vấn tốt hơn nhé ạ!`,
        cta: "register"
      },

      c_cervical_part: {
        text: `Dạ hoàn toàn được anh/chị nhé ạ! Nếu anh/chị chỉ muốn tập trung giải quyết dứt điểm các ca đau mỏi cổ vai gáy, Simon Center có gói chuyên biệt đúng nhu cầu của mình:<br><br>
💆 <strong>MODULE LẺ ONLINE — CHUYÊN SÂU CỔ VAI GÁY (HWS):</strong><br>
• <strong>Nội dung trọng tâm:</strong> Kỹ thuật sờ nắn và giải phóng đốt sống cổ từ C1 đến C7, khớp đội - chẩm C0-C1, đoạn chuyển tiếp cổ ngực C7-T1 và khớp sườn đốt sống.<br>
• <strong>Ứng dụng lâm sàng:</strong> Trị dứt điểm đau nửa đầu Cervicogenic, đau đầu Migraine, hội chứng tiền đình chóng mặt thiếu máu não, tê bì lan xuống cánh tay và thoái hóa đốt sống cổ.<br>
• <strong>Nguyên tắc an toàn số 1:</strong> Hướng dẫn kiểm tra nghiệm pháp De-Kleyn loại trừ hẹp động mạch sống nền và các dấu hiệu Cảnh báo đỏ (Red Flags) bảo vệ an toàn 100% cho bệnh nhân.<br>
• <strong>Hình thức học:</strong> Video với các góc quay khác nhau, xem lại dài hạn 24/7 trên mọi thiết bị.<br>
• <strong>Học phí ưu đãi:</strong> <strong>1.000.000 VNĐ</strong> (Học phí gốc: 2.000.000 VNĐ).<br><br>
💡 <em>Toàn bộ 1.000.000đ này cũng được khấu trừ 100% nếu sau này anh/chị nâng cấp lên các khóa lớn hơn nhé ạ.</em><br><br>
Để lựa chọn đúng phần học phù hợp nhất với nhu cầu và ca bệnh thực tế của mình, anh/chị xin vui lòng liên hệ với Ban tổ chức qua Hotline / Zalo: <strong>093 115 8868</strong> để được tư vấn tốt hơn nhé ạ!`,
        cta: "register"
      },

      c_extremity_part: {
        text: `Dạ được anh/chị nhé ạ! Với nắn chỉnh tứ chi và các khớp ngoại vi, Simon Center có chương trình chuyên sâu bài bản:<br><br>
🦵 <strong>LEVEL 2 ONLINE — TỨ CHI & PHÂN TÍCH X-QUANG CHUYÊN SÂU (MODUL B):</strong><br>
• <strong>Khớp chi dưới:</strong> Kẹt sụn chêm gối, lật sơ mi cổ chân mạn tính, khớp nhảy xương sên, viêm cân gan chân (gai gót) và lệch khớp háng.<br>
• <strong>Khớp chi trên:</strong> Viêm lồi cầu ngoài Tennis Elbow, đau khớp vai đông cứng (Frozen Shoulder), hội chứng ống cổ tay và sai lệch xương bàn - ngón tay.<br>
• <strong>Tích hợp X-quang:</strong> Đo đạc góc trượt và phân tích phim X-quang cơ sinh học chi tiết từng khớp.<br>
• <strong>Học phí ưu đãi:</strong> <strong>7.000.000 VNĐ</strong> (Học phí gốc: 8.500.000 VNĐ). Truy cập học tập dài hạn và cấp Chứng nhận Level 2 chính thức.<br><br>
Dạ anh/chị đang quan tâm nhiều nhất đến xử lý khớp gối, cổ chân hay khớp vai khuỷu tay vậy ạ? Anh/chị chia sẻ thêm với em nhé ạ!`,
        cta: "register"
      },

      c_age_limit: {
        text: `Dạ anh/chị hoàn toàn yên tâm nhé ạ! Tại Simon Center, rất nhiều học viên ở độ tuổi 45, 50, thậm chí gần 60 tuổi vẫn tiếp thu và thực hành rất xuất sắc ạ.<br><br>
Ưu điểm vượt trội của phương pháp Thầy Henrik Simon là <strong>hoàn toàn không dùng sức cơ bắp tay</strong>:<br>
• Nắn chỉnh Chiropractic chuẩn Y khoa vận hành theo cơ chế <strong>đòn bẩy tự nhiên và trọng lực rơi cơ thể (Body Drop)</strong> ở thời điểm người bệnh thả lỏng cơ.<br>
• Thầy dạy kỹ thuật khóa góc khớp chính xác trước khi phát lực nhẹ, nên dù lớn tuổi hay thể lực bình thường thì khi thực hành vẫn thấy cơ thể rất nhẹ nhõm, không bị mất sức hay mỏi khớp.<br>
• Giáo trình video với các góc quay khác nhau có thể tua chậm, xem đi xem lại nhiều lần vào bất kỳ thời gian rảnh nào trong ngày.<br><br>
Dạ hiện tại anh/chị đang quan tâm học để tự chăm sóc sức khỏe gia đình hay nâng cao tay nghề ứng dụng trị liệu vậy ạ?`,
        cta: "trial"
      },

      c_relearn_lifetime: {
        text: `⏱️ <strong>QUYỀN LỢI TRUY CẬP DÀI HẠN & XEM LẠI KHÔNG GIỚI HẠN THỜI GIAN:</strong><br><br>
• Ngay sau khi đăng ký, tài khoản học trực tuyến của anh/chị được cấp quyền truy cập <strong>dài hạn 24/7</strong> không giới hạn số lần xem.<br>
• <strong>Xem chủ động:</strong> Anh/chị có thể xem lại bao nhiêu lần tùy thích, tua chậm từng giây để soi rõ từng góc tay, bộ pháp và hướng lực.<br>
• <strong>Học trên mọi thiết bị:</strong> Tương thích hoàn hảo trên điện thoại (iOS, Android), máy tính bảng, iPad và máy tính xách tay.<br>
• Khi Thầy Henrik Simon cập nhật thêm bài giảng mới hoặc cẩm nang lâm sàng mới, tài khoản của anh/chị được <strong>tự động nâng cấp miễn phí 100%</strong> mà không phải đóng thêm bất kỳ phụ phí nào ạ.<br><br>
Dạ anh/chị có muốn đăng ký nhận ngay 1 bài giảng mẫu với các góc quay khác nhau để học thử trước không ạ?`,
        cta: "trial"
      },

      c_abroad_learn: {
        text: `🌍 <strong>HỌC VIÊN Ở NƯỚC NGOÀI / KIỀU BÀO HỌC NHƯ THẾ NÀO?</strong><br><br>
Dạ hiện tại có rất nhiều học viên là kiều bào tại Mỹ, Đức, Úc, Canada, Nhật Bản, Đài Loan... đang theo học các khóa của Simon Center rất thuận lợi ạ:<br><br>
• <strong>Chủ động 100% thời gian:</strong> Nền tảng E-Learning hoạt động 24/7 với đường truyền tốc độ cao quốc tế, không phụ thuộc vào múi giờ.<br>
• <strong>Hỗ trợ thanh toán quốc tế đa dạng:</strong> Bên em hỗ trợ thanh toán thuận tiện qua thẻ quốc tế (Visa / Mastercard), chuyển khoản liên ngân hàng quốc tế hoặc PayPal / Wise.<br>
• <strong>Tương tác chuyên môn xuyên biên giới:</strong> Học viên ở nước ngoài quay video bài tập rèn lực gửi về, Bác sĩ Henrik Simon và trợ giảng nhận xét, sửa góc tay trực tiếp qua video.<br><br>
Dạ hiện tại anh/chị đang sinh sống và làm việc tại quốc gia nào vậy ạ? Anh/chị nhắn để em hỗ trợ phương thức kết nối thuận tiện nhất nhé ạ!`,
        cta: "register"
      },

      c_post_course_support: {
        text: `🤝 <strong>CHÍNH SÁCH ĐỒNG HÀNH & HỖ TRỢ CHUYÊN MÔN SAU KHÓA HỌC:</strong><br><br>
Simon Center không chỉ dạy xong rồi thôi, mà cam kết đồng hành xuyên suốt cùng anh/chị trên con đường hành nghề:<br><br>
• <strong>Gia nhập Cộng đồng Kín Học Viên Simon Center:</strong> Nơi Thầy Henrik Simon và các trợ lý y khoa sinh hoạt, hỗ trợ học viên hàng ngày.<br>
• <strong>Hội chẩn ca bệnh thực tế 1-1:</strong> Khi anh/chị gặp ca bệnh phức tạp ngoài thực tế, có thể gửi hình ảnh tư thế hoặc phim X-quang của bệnh nhân lên nhóm để được Thầy và đội ngũ bác sĩ hội chẩn, định hướng phác đồ nắn an toàn trước khi thực hiện.<br>
• <strong>Giải đáp lâm sàng định kỳ:</strong> Trung tâm định kỳ tổ chức các buổi giải đáp lâm sàng (Case-Study) trực tuyến để học viên liên tục cập nhật và nâng cao tay nghề.<br>
• <strong>Cơ hội tham gia ngày thực tế lâm sàng (Tageshospitation):</strong> Được ưu tiên đăng ký đi lâm sàng thực tế tại Simon Chiropractic Center để quan sát Thầy khám và điều trị trên bệnh nhân thật.<br><br>
Dạ sự bảo trợ y khoa chuẩn xác là điều quan trọng nhất khi bước vào điều trị. Anh/chị có băn khoăn gì thêm về quy trình hỗ trợ này không ạ?`,
        cta: "register"
      },

      // --- 10 CÂU HỎI & TRẢ LỜI CHUẨN HÓA CHO SIMON EDU CENTER ---
      c_target_audience: {
        text: `Dạ, khóa học tại Simon Center được thiết kế chuẩn hóa theo từng nấc thang từ cơ bản đến nâng cao, nên sẽ <strong>rất phù hợp nếu anh/chị thuộc 1 trong 3 nhóm sau</strong> ạ:<br><br>
1. <strong>Huấn luyện viên PT, Yoga, Pilates, KTV Massage / Spa:</strong> Muốn nâng cấp tay nghề, làm chủ kỹ thuật giải phóng áp lực cột sống để hỗ trợ khách hàng phục hồi nhanh chóng, gia tăng uy tín và nâng cao thu nhập.<br>
2. <strong>Bác sĩ, Y sĩ YHCT, KTV Vật lý trị liệu & Phục hồi chức năng:</strong> Muốn chuẩn hóa kỹ thuật nắn chỉnh theo y học phương Tây hiện đại (Specific Chiropractic), làm chủ kỹ năng đọc phim X-quang cơ sinh học và loại trừ 100% nguy cơ tai biến y khoa.<br>
3. <strong>Người đam mê trị liệu muốn chăm sóc người thân:</strong> Học bài bản từ số 0 để biết cách giải tỏa đau nhức cổ vai gáy, thắt lưng cho bản thân và gia đình một cách an toàn, khoa học mà không phải bẻ khớp mò mẫm.<br><br>
👉 Anh/chị hiện đang làm việc trong ngành sức khỏe/thể thao hay muốn học để chăm sóc sức khỏe gia đình ạ? Anh/chị chia sẻ để em tư vấn lộ trình sát nhất nhé ạ!`,
        cta: "trial"
      },

      q1: {
        text: `Thực tế, khóa học Online của Simon EDU Center được thiết kế chuẩn y khoa như một <strong>"bộ thước đo quy chuẩn"</strong> dành cho cả người mới bắt đầu lẫn người đã có kinh nghiệm:<br><br>
• <strong>Quy chuẩn đối chiếu chuẩn xác:</strong> Toàn bộ động tác từ vị trí đặt tay, góc tiếp xúc mỏm gai đến hướng phát lực (Line of Drive) đều được ghi hình đa góc độ và phân tích chậm. Nhờ đó, anh/chị luôn có một nguồn chuẩn y khoa tin cậy để nhìn vào, tự soi chiếu và biết chính xác động tác của mình đã đúng kỹ thuật và an toàn hay chưa.<br>
• <strong>Học từ ca lâm sàng thực tế:</strong> Trong khóa học online, Thầy Henrik Simon sẽ trực tiếp thị phạm và hướng dẫn xử lý trên bệnh nhân thật theo hình thức 1:1, giúp anh/chị hiểu rõ phản ứng cơ thể và cảm giác lực thực tế chứ không chỉ là lý thuyết suông.<br>
• <strong>Đặc quyền nâng cấp Offline:</strong> Toàn bộ học phí khóa Online sẽ được <strong>khấu trừ 100%</strong> khi anh/chị đăng ký tham gia các Workshop thực hành trực tiếp "cầm tay chỉ việc" cùng chuyên gia.<br><br>
Nhờ lộ trình này, anh/chị vừa chủ động xây chắc nền tảng đúng chuẩn ngay tại nhà, vừa rèn luyện kỹ năng với sự an tâm tuyệt đối mà không lo thao tác sai hay gây nguy hiểm ạ!`,
        cta: "register"
      },

      q2: {
        text: `Dạ anh/chị hoàn toàn yên tâm nhé ạ! Thực tế hơn 40% học viên xuất sắc tại Simon Center là Huấn luyện viên PT Gym, HLV Yoga và các anh chị chủ Spa.<br><br>
Triết lý đào tạo của Thầy Henrik Simon là <strong>"Dễ hiểu nhưng phải chuẩn"</strong>:<br>
• Mọi thuật ngữ giải phẫu phức tạp đều được chuyển hóa thành mô hình 3D trực quan và bài tập mô phỏng đời thường.<br>
• Anh/chị hiểu rõ bản chất vì sao khớp kẹt và cách mở khớp bằng đòn bẩy tự nhiên mà không cần học vẹt sách y khoa.<br><br>
Kiến thức này giúp anh/chị nâng tầm gói dịch vụ chỉnh tư thế (Posture Alignment), giải phóng khớp cổ chân, khớp háng, tăng hiệu quả và giá trị buổi trị liệu mình làm cho khách lên rất nhiều nhé ạ!<br><br>
Dạ hiện tại cơ sở hoặc phòng tập của anh/chị có thường xuyên gặp khách hàng than phiền về đau mỏi cổ vai gáy hay võng lưng không ạ? Anh/chị chia sẻ thêm với em nhé!`,
        cta: "register"
      },

      q3: {
        text: `Dạ em rất hiểu học phí là điều anh/chị luôn cân nhắc kỹ lưỡng khi tìm hiểu một chương trình đào tạo chuyên môn sâu ạ.<br><br>
Tại Simon Center, giá trị cốt lõi của khóa học không nằm ở số lượng chiêu thức bề nổi, mà tập trung vào <strong>sự an toàn tuyệt đối và chuẩn mực y khoa quốc tế</strong>:<br><br>
• <strong>Nền tảng cơ sinh học chuẩn Đức:</strong> Toàn bộ giáo trình kế thừa hơn 20 năm kinh nghiệm lâm sàng của Bác sĩ Henrik Simon (Viện DISC - Đức), giúp anh/chị hiểu rõ nguyên lý khóa khớp và đòn bẩy tự nhiên, không dùng sức gồng bắp tay.<br>
• <strong>Hệ thống Video với các góc quay khác nhau & Micro-Drills:</strong> Từng góc quay trực quan đa chiều, kết hợp các bài rèn lực phản xạ tại nhà giúp học viên tự tin làm chủ đôi bàn tay trước khi chạm vào người thật.<br>
• <strong>Đào tạo chuyên sâu phân tích X-quang & Cảnh báo đỏ (Red Flags):</strong> Giúp người thực hành nhận diện chính xác các chống chỉ định y khoa, bảo vệ an toàn cao nhất cho bệnh nhân và uy tín người thầy thuốc.<br>
• <strong>Đặc quyền khấu trừ 100%:</strong> Toàn bộ học phí khóa Online được khấu trừ 100% khi anh/chị tham gia lớp Thực hành Offline Cầm tay chỉ việc cùng Thầy Henrik Simon.<br><br>
Dạ anh/chị có muốn em gửi xem thử 1 video bài giảng mẫu với các góc quay khác nhau để trải nghiệm trực quan cách Thầy Henrik truyền đạt không ạ?`,
        cta: "trial"
      },

      q4: {
        text: `Dạ có dạy rất kỹ từ con số 0 anh nhé ạ! Đây chính là điểm khác biệt tự hào nhất của Simon Center.<br><br>
Khóa học hướng dẫn anh chi tiết:<br>
• Cách đọc các mốc giải phẫu trên phim chụp cột sống thẳng và nghiêng.<br>
• Đo đạc độ nghiêng xương cùng, độ lệch trục xương chậu (AP Pelvis View) chuẩn xác từng milimet.<br>
• Nhận diện thoái hóa, trượt đốt sống, gai xương và các bệnh lý nguy hiểm cấm nắn.<br><br>
🎁 <em>Đặc biệt: Khi đăng ký đợt này, anh được tặng kèm trọn bộ <strong>Cẩm nang phân tích phim X-quang cơ sinh học</strong> độc quyền biên soạn bằng tiếng Việt ạ.</em><br><br>
Dạ không biết trước đây anh/chị đã từng tiếp xúc với phim X-quang cột sống bao giờ chưa ạ? Cẩm nang này hướng dẫn từ con số 0 rất dễ hiểu nhé ạ!`,
        cta: "register"
      },

      q5: {
        text: `Khi hoàn thành chương trình, anh/chị sẽ được cấp <strong>Chứng nhận Hoàn thành Khóa học (Certificate of Completion)</strong> chính thức từ <em>Simon Chiropractic Center</em> do Bác sĩ Henrik Simon ký:<br><br>
• Chứng nhận này khẳng định anh/chị đã được học qua chương trình bồi dưỡng chuyên môn về nắn chỉnh cột sống <em>Specific Chiropractic</em> chuẩn quốc tế và nắm vững quy trình an toàn y khoa.<br>
• <strong>Về mặt pháp lý hành nghề:</strong> Để mở phòng khám hoặc cung cấp dịch vụ trị liệu y khoa có can thiệp tại Việt Nam, người hành nghề cần đáp ứng các văn bằng, chứng chỉ y tế chính quy do Bộ Y tế / Sở Y tế quy định (như Bác sĩ, Y sĩ YHCT, KTV Vật lý trị liệu). Chứng nhận của Simon Center là bảo chứng uy tín về kỹ thuật thực hành chuẩn xác bổ trợ đắc lực cho công việc của anh/chị ạ.`,
        cta: "register"
      },

      q6: {
        text: `Dạ <strong>ĐƯỢC KHẤU TRỪ 100%</strong> anh/chị nhé ạ! Đây là chính sách cực kỳ nhân văn và ưu đãi độc quyền của Simon Center.<br><br>
Toàn bộ số tiền anh/chị đã thanh toán cho khóa Online sẽ được <strong>khấu trừ 100% vào học phí khóa Offline Cầm tay chỉ việc cùng Thầy Henrik Simon (36.000.000đ)</strong>.<br><br>
Khoản đầu tư hôm nay không hề mất đi mà là bước đệm hoàn hảo: Anh/chị học vững lý thuyết và phản xạ trước, khi bước vào lớp thực hành cùng Thầy Henrik sẽ tiến bộ nhanh gấp 3 lần so với người chưa học qua online đấy ạ!<br><br>
Dạ đây là chính sách trợ lực tốt nhất cho học viên. Anh/chị có muốn giữ suất ưu đãi đợt này trước không ạ?`,
        cta: "register"
      },

      q7: {
        text: `Dạ, phương pháp giảng dạy của Thầy Henrik Simon tại Simon EDU Center sở hữu những ưu thế vượt trội mang tính bản quyền chuẩn y khoa quốc tế:<br><br>
• <strong>Chuẩn Y Khoa Cơ Sinh Học Châu Âu:</strong> Hệ thống kiến thức kế thừa hơn 20 năm nghiên cứu và điều trị thực tế của Bác sĩ Henrik Simon tại Đức, tập trung vào bản chất cơ sinh học khớp và giải phẫu chức năng.<br>
• <strong>Tính Chính Xác Cao (Specific Chiropractic):</strong> Phương pháp tập trung xác định đúng điểm đốt sống sai lệch (Subluxation), đưa khớp vào góc khóa an toàn rồi mới tác động lực nhẹ giải tỏa áp lực, tuyệt đối không dùng lực vặn xoắn bừa bãi.<br>
• <strong>Hệ Thống Sàng Lọc An Toàn Tuyệt Đối (Red Flags):</strong> Học viên được đào tạo bài bản các bài kiểm tra lâm sàng (như test động mạch sống nền De-Kleyn, kiểm tra bao xơ đĩa đệm, loãng xương) để nắm rõ ranh giới an toàn, đảm bảo sự an tâm 100% cho người bệnh.<br>
• <strong>Hệ Thống Video Đa Góc Quay & Mô Phỏng Lực:</strong> Từng kỹ thuật được quay chi tiết cận cảnh điểm tiếp xúc mỏm gai, kết hợp phương pháp Micro-drills giúp học viên rèn phản xạ và cảm nhận lực nhuần nhuyễn ngay tại nhà.`,
        cta: "trial"
      },

      q8: {
        text: `Dạ chị hoàn toàn yên tâm nhé ạ! Rất nhiều học viên nữ nhỏ nhắn 45kg tại Simon Center hiện đang nắn chỉnh rất mượt mà cho các khách hàng nam to béo 80–90kg.<br><br>
Bản chất của Chiropractic chuẩn y khoa là <strong>khoa học của tốc độ và trọng lực rơi cơ thể (Body Drop)</strong> ở thời điểm người bệnh thả lỏng cơ, hoàn toàn không dùng sức bắp tay.<br><br>
Thầy Henrik sẽ dạy chị cách khóa góc khớp (Pre-tension) và thả rơi trọng lượng cơ thể nhẹ nhàng. Chị nắn nhiều ca liên tục mỗi ngày vẫn thấy cơ thể nhẹ nhàng, hai cánh tay hoàn toàn thả lỏng và không hề tốn sức đâu ạ!<br><br>
Dạ chị có đang lo lắng về thể lực hay chiều cao của mình khi nắn chỉnh không ạ? Chị cứ chia sẻ thêm với em nhé!`,
        cta: "register"
      },

      q9: {
        text: `Dạ quy trình đăng ký và kích hoạt tài khoản diễn ra hoàn toàn tự động trong 1 phút ạ:<br><br>
1. Anh/chị chọn khóa học và quét mã QR chuyển khoản ngân hàng qua cổng SePay tự động (Mã thanh toán hiển thị rõ ràng trên màn hình).<br>
2. Ngay sau khi chuyển khoản thành công, hệ thống sẽ tự động gửi <strong>Email xác nhận đơn hàng</strong> kèm thông tin tài khoản học viện vào hòm thư của anh/chị.<br>
3. Trợ lý chuyên môn của Thầy Henrik Simon sẽ chủ động liên hệ qua Zalo/SĐT để gửi tài liệu học tập, hướng dẫn anh/chị vào lớp và thêm vào nhóm hỗ trợ chuyên môn kín ạ.`,
        cta: "register"
      },

      buy: {
        text: `Dạ tuyệt vời quá ạ! Tài khoản học được kích hoạt tự động ngay sau khi đăng ký anh/chị nhé ạ.<br><br>
Hiện tại khóa <strong>The Full Online Collection đang được áp dụng mức học phí ưu đãi 12.900.000đ</strong> (bao gồm toàn bộ video với các góc quay khác nhau xem dài hạn 24/7, hệ thống Micro-drills, bài Test qua môn và tặng kèm Cẩm nang đọc phim X-quang).<br><br>
Anh/chị bấm nút bên dưới để chuyển ngay đến Form đăng ký giữ suất ưu đãi đợt này nhé ạ:`,
        cta: "register_now"
      },
      hesitate: {
        text: `Dạ em hoàn toàn hiểu ạ! Quyết định đầu tư một khóa học chuyên môn sâu thì việc cân nhắc thấu đáo là rất cần thiết.<br><br>
Để anh/chị có cái nhìn thực tế nhất về bài giảng của Thầy Henrik Simon, em xin phép gửi tặng anh/chị <strong>1 Suất Học Thử Bài Giảng Mẫu với các góc quay khác nhau</strong> hoàn toàn miễn phí nhé ạ.<br><br>
Anh/chị bấm nút bên dưới để chuyển đến form nhận bài giảng mẫu qua Zalo/Email, đồng thời hệ thống sẽ <strong>tự động bảo lưu mức học phí ưu đãi 12.9 triệu</strong> cho anh/chị mà không sợ bị tăng giá về sau ạ:`,
        cta: "trial"
      },

      // --- CÂU HỎI MỚI: CHƯA BIẾT GÌ, CHƯA TỪNG HỌC, RẤT ĐAM MÊ ---
      c_zero_base_passion: {
        text: `Dạ em rất hoan nghênh và trân trọng niềm đam mê của anh/chị ạ! Anh/chị <strong>hoàn toàn theo học và làm chủ được bộ môn Chiropractic này</strong> nhé ạ!<br><br>
Tại Simon Center, hơn 60% học viên thành công cũng xuất phát điểm từ con số 0 tròn trĩnh giống hệt anh/chị — từ những người làm văn phòng, HLV thể hình PT, chủ spa đến những người có niềm đam mê muốn tự chữa lành cho người thân trong gia đình.<br><br>
💡 <strong>Vì sao người chưa từng học Y vẫn học tốt và tự tin hành nghề?</strong><br>
1. <strong>Giáo trình trực quan từ Đức:</strong> Thầy Henrik Simon không bắt học viên phải thuộc lòng các thuật ngữ giải phẫu Latin phức tạp, mà giải thích tường minh cơ chế đòn bẩy tự nhiên và chuyển động khớp qua mô hình 3D trực quan, dễ hiểu - dễ nhớ.<br>
2. <strong>Phương pháp Micro-drills rèn lực tại nhà:</strong> Kỹ thuật nắn chỉnh Chiropractic chuẩn Y khoa hoàn toàn không dùng sức bắp tay, mà sử dụng tốc độ và trọng lực rơi cơ thể (Body Drop). Anh/chị được rèn luyện trên đệm mút và bóng phản xạ tại nhà, giúp bàn tay hình thành phản xạ tự nhiên chuẩn xác trước khi chạm người thật — <strong>hoàn toàn không lo run tay</strong>.<br>
3. <strong>Ranh giới Cảnh báo đỏ (Red Flags) bảo vệ 100%:</strong> Giáo trình trang bị bài bản các test loại trừ bệnh lý nguy hiểm và các vùng chống chỉ định y khoa, giúp anh/chị luôn tự tin và bảo vệ an toàn cao nhất cho người bệnh.<br>
4. <strong>Lộ trình học linh hoạt theo nhu cầu:</strong> Anh/chị có thể bắt đầu bằng Module lẻ chuyên sâu (Thắt lưng hoặc Cổ gáy) với học phí chỉ <strong>1.000.000 VNĐ</strong> để tự trải nghiệm trước, hoặc học trọn bộ The Full Online Collection.<br><br>
Dạ hiện tại anh/chị đang muốn học để tự chăm sóc cho người thân trong gia đình hay định hướng phát triển nghề nghiệp trị liệu lâu dài vậy ạ? Anh/chị chia sẻ thêm với em nhé ạ!`,
        cta: "trial"
      },

      // --- CÂU HỎI MỚI: KINH PHÍ HẠN CHẾ / BẮT ĐẦU TIẾT KIỆM ---
      c_beginner_budget: {
        text: `Dạ em rất thấu hiểu nỗi băn khoăn về ngân sách khi bắt đầu tìm hiểu một bộ môn chuyên môn mới ạ!<br><br>
Tại Simon Center, trung tâm luôn có các giải pháp học tập linh hoạt để anh/chị bắt đầu thuận lợi nhất mà không phải chịu bất kỳ áp lực tài chính nào:<br><br>
• <strong>Lựa chọn 1 - Học thử MIỄN PHÍ 0đ:</strong> Anh/chị có thể đăng ký nhận ngay 1 bài giảng mẫu với các góc quay khác nhau chuẩn quốc tế để trực tiếp trải nghiệm phương pháp giảng dạy của Thầy Henrik Simon trước khi quyết định.<br>
• <strong>Lựa chọn 2 - Bắt đầu từ Module Lẻ thực chiến (1.000.000đ):</strong> Thay vì phải đầu tư cả khóa học lớn, anh/chị có thể học riêng 1 vùng chuyên biệt (Module Thắt lưng - Chậu 1tr hoặc Cổ vai gáy 1tr). Học xong áp dụng xử lý được ngay ca bệnh thực tế.<br>
• <strong>Đặc quyền khấu trừ 100%:</strong> Khi nâng cấp lên khóa lớn hơn (The Full Online Collection) hoặc lớp thực hành Offline Cầm tay chỉ việc sau này, <strong>toàn bộ 1.000.000đ đã đóng sẽ được khấu trừ 100%</strong> vào học phí khóa sau, anh/chị hoàn toàn không bị thiệt thòi chi phí.<br><br>
Dạ anh/chị có muốn đăng ký nhận bài giảng mẫu học thử miễn phí để trải nghiệm trước không ạ?`,
        cta: "trial"
      },

      // --- CÂU HỎI MỚI: THỜI GIAN & LỊCH HỌC ---
      c_schedule_duration: {
        text: `⏱️ <strong>THỜI GIAN HỌC & LỊCH TRÌNH ĐÀO TẠO:</strong><br><br>
• <strong>Khóa Online The Full Collection:</strong> Tài khoản học có giá trị <strong>xem dài hạn 24/7 không giới hạn thời gian</strong>. Anh/chị chủ động hoàn toàn về thời gian, học trên điện thoại hoặc máy tính bất kỳ lúc nào rảnh rỗi mà không sợ bị trôi bài.<br>
• <strong>Lộ trình tiếp thu trung bình của học viên:</strong><br>
  - <em>Tuần 1–3:</em> Nắm vững giải phẫu cơ sinh học, sờ nắn mốc xương và bảng Cảnh báo đỏ Red Flags.<br>
  - <em>Tuần 4–6:</em> Thuần thục phương pháp Micro-drills rèn lực, bộ pháp và các test lâm sàng.<br>
  - <em>Tuần 7–10:</em> Thực hành nhuần nhuyễn các kỹ thuật nắn chỉnh cột sống cổ, lưng, khung chậu và khớp ngoại vi.<br><br>
• <strong>Lớp Offline Cầm tay chỉ việc:</strong> Diễn ra tập trung trong <strong>4 ngày thực hành liên tục (thứ 5 đến Chủ nhật)</strong> định kỳ mỗi quý cùng Bác sĩ Henrik Simon tại trung tâm.`,
        cta: "register"
      },

      // --- CÂU HỎI MỚI: ĐỊA ĐIỂM HỌC ---
      c_location: {
        text: `📍 <strong>ĐỊA ĐIỂM HỌC & CƠ SỞ ĐÀO TẠO SIMON CENTER:</strong><br><br>
• <strong>Khóa E-Learning Online:</strong> Học trực tuyến mọi lúc mọi nơi trên nền tảng chuyên biệt với các góc quay khác nhau. Học viên ở khắp các tỉnh thành trên cả nước và cả kiều bào ở nước ngoài (Mỹ, Đức, Úc, Nhật...) đều theo học rất thuận tiện.<br><br>
• <strong>Khóa Thực hành Offline Cầm tay chỉ việc:</strong> Được tổ chức tại các cơ sở đào tạo tiêu chuẩn y khoa của Simon Center tại <strong>TP. Hồ Chí Minh</strong> và <strong>Hà Nội</strong>.<br>
• Lớp học giới hạn sĩ số để Bác sĩ Henrik Simon và trợ giảng chỉnh từng góc tay, bộ pháp và lực nắn cho từng học viên.`,
        cta: "register"
      },

      // --- CÂU HỎI MỚI: ĐẦU RA, MỞ PHÒNG KHÁM, THU NHẬP ---
      c_career_outcome: {
        text: `💼 <strong>ĐẦU RA NGHỀ NGHIỆP & CƠ HỘI MỞ PHÒNG KHÁM:</strong><br><br>
Hơn 500+ học viên đã tốt nghiệp tại Simon Center đang ứng dụng rất thành công theo 3 hướng:<br><br>
1. <strong>Chủ Spa / Phòng khám Đông y / Phục hồi chức năng:</strong> Bổ sung dịch vụ Chiropractic nắn chỉnh cột sống chuẩn y khoa, nâng tầm giá trị buổi trị liệu từ 200k lên <strong>600k – 1.200k/buổi</strong>.<br>
2. <strong>HLV PT Gym / Huấn luyện viên Yoga:</strong> Nâng cấp thành Chuyên gia Chỉnh sửa Tư thế & Phục hồi vận động (Posture & Mobility Specialist), gia tăng tỷ lệ khách hàng gắn bó lâu dài.<br>
3. <strong>Mở Cơ sở Trị liệu Cơ xương khớp:</strong> Được bảo trợ chuyên môn từ Simon Center, được cấp Chứng chỉ Hoàn thành có chữ ký Thầy Henrik Simon và hỗ trợ hội chẩn các ca bệnh khó xuyên suốt quá trình thực hành.<br><br>
🎯 <em>Định hướng bền vững:</em> Khóa học tập trung trang bị năng lực chẩn đoán và kỹ thuật chuẩn xác, giúp anh/chị xây dựng uy tín lâm sàng vững chắc và phục vụ bệnh nhân hiệu quả ngay sau khi hoàn thành!`,
        cta: "register"
      },

      // --- CÂU HỎI MỚI: BỆNH NHÂN TỰ HỎI KHÁM / CHỮA BỆNH ---
      c_patient_consult: {
        text: `🩺 <strong>TƯ VẤN THĂM KHÁM & ĐIỀU TRỊ CÙNG BÁC SĨ HENRIK SIMON:</strong><br><br>
Dạ em rất đồng cảm với tình trạng đau mỏi, khó chịu mà anh/chị hoặc người thân đang gặp phải ạ!<br><br>
Tại Simon Center, mọi ca bệnh đều được tiếp cận theo <strong>Chuẩn Y học Châu Âu</strong>:<br>
1. <strong>Tìm đúng gốc rễ nguyên nhân:</strong> Không nắn bẻ mò, bắt buộc kết hợp thăm khám lâm sàng và phân tích phim X-quang/MRI cơ sinh học.<br>
2. <strong>Điều trị bảo tồn an toàn tuyệt đối:</strong> Giải phóng chèn ép thần kinh và phục hồi đường cong sinh lý nhẹ nhàng, không tiêm, không phẫu thuật.<br><br>
Anh/chị có thể kết nối trực tiếp qua Zalo <strong>0389.609.938</strong> để gửi hình ảnh kết quả phim chụp (nếu có). Bác sĩ Henrik Simon sẽ xem và phân tích hội chẩn miễn phí giúp mình nhé ạ!`,
        cta: "register"
      },

      // --- CÂU HỎI MỚI: BÁC SĨ HENRIK SIMON LÀ AI ---
      c_simon_bio: {
        text: `👨‍⚕️ <strong>THÔNG TIN VỀ BÁC SĨ HENRIK SIMON:</strong><br><br>
• Bác sĩ Henrik Simon là Chuyên gia Trị liệu Thần kinh Cột sống Chiropractic hàng đầu đến từ <strong>Cộng hòa Liên bang Đức</strong>, với hơn <strong>20 năm kinh nghiệm lâm sàng</strong> điều trị tại châu Âu.<br>
• Ông là cựu giảng viên và chuyên gia nòng cốt kế thừa các nghiên cứu cơ sinh học tại <strong>Viện DISC (Đức)</strong>.<br>
• Tác giả của công trình đồ sộ <strong>hơn 350 bài giảng y khoa chuyên sâu</strong> về kỹ thuật nắn chỉnh cột sống, chẩn đoán hình ảnh X-quang và phương pháp phát lực ngón cái độc quyền (Simon-Technik).<br>
• Thầy Henrik Simon trực tiếp giảng dạy và trực tiếp cầm tay chỉ việc cho các học viên tại Việt Nam.`,
        cta: "register"
      },

      // --- CÂU HỎI MỚI: DỤNG CỤ, BÀN NẮN, ACTIVATOR ---
      c_table_equipment: {
        text: `🛠️ <strong>DỤNG CỤ HỖ TRỢ & BÀN NẮN CHIROPRACTIC:</strong><br><br>
• <strong>Điểm đặc sắc của phương pháp Henrik Simon:</strong> Khóa học tập trung rèn luyện <strong>đôi bàn tay và cơ chế đòn bẩy cơ thể (Body Drop)</strong> của chính bạn. Bạn có thể nắn chỉnh hiệu quả ngay trên giường khám thông thường mà <strong>hoàn toàn không bắt buộc phải mua bàn nắn đắt tiền tiền trăm triệu</strong>.<br>
• Khi điều kiện cho phép, Thầy cũng hướng dẫn sử dụng bàn nắn phân đoạn (Drop Table), đệm nêm chậu (Pelvic Blocks) và súng nắn Activator để hỗ trợ các ca bệnh đặc thù (người già loãng xương, trẻ em).`,
        cta: "register"
      },

      // --- NHÓM 2: CHUYÊN KHOA CHIROPRACTIC Y HỌC (TỪ 351 BÀI BRAIN.DB) ---
      c_redflags: {
        text: `🚨 <strong>HỆ THỐNG CẢNH BÁO ĐỎ (RED FLAGS) & CHỐNG CHỈ ĐỊNH Y KHOA:</strong><br><br>
Trong giáo trình của Bác sĩ Henrik Simon, đây là <strong>nguyên tắc số 1 để bảo vệ sinh mệnh nghề nghiệp</strong> của bạn:<br><br>
⛔ <strong>1. Chống Chỉ Định Tuyệt Đối (TUYỆT ĐỐI CẤM NẮN):</strong><br>
• <strong>Hội chứng chùm đuôi ngựa (Cauda Equina Syndrome):</strong> Sa đĩa đệm cấp tính gây tê mất cảm giác vùng đáy chậu (kiểu yên ngựa), bí tiểu hoặc mất tự chủ đại tiểu tiện ➔ Cấp cứu ngoại khoa mổ giải ép khẩn cấp trong 24h!<br>
• <strong>Gãy xương mới / Chấn thương chưa liền:</strong> Thời gian chờ an toàn tối thiểu 6 tuần đến 1 năm (tuyệt đối không nắn vào đốt gãy mỏm nha C2 hay mất vững cuống sống).<br>
• <strong>Tổn thương tiêu xương, ung thư / di căn:</strong> Di căn xương từ ung thư tiền liệt tuyến, ung thư vú, phổi (xạ hình xương không tổn thương không quá 3 tháng).<br>
• <strong>Viêm nhiễm cấp tính phá hủy khớp:</strong> Viêm tủy xương, lao cột sống, viêm khớp mủ.<br>
• <strong>Sau phẫu thuật cột sống:</strong> Vừa hàn xương, đặt nẹp vít dưới 6 tuần.<br><br>
⚠️ <strong>2. Chống Chỉ Định Tương Đối (Cần điều chỉnh kỹ thuật an toàn):</strong><br>
• <strong>Loãng xương nặng:</strong> CẤM LỰC NÉN DỌC trục thân đốt sống. Chỉ dùng lực xoay/trượt ngang tiếp xúc gai mỏm.<br>
• <strong>Xơ vữa động mạch đốt sống (A. vertebralis):</strong> Bắt buộc làm test De-Kleyn trước khi chạm vào vùng cổ.<br>
• Bệnh nhân đang dùng Corticoid liều cao kéo dài, bệnh ưa chảy máu (Hemophilia).<br><br>
<em>💡 Nắm vững Red Flags giúp bạn tự tin từ chối đúng lúc, chuyển viện đúng ca và hành nghề an toàn 100% và bền vững!</em><br><br>
Dạ trong thực tế điều trị, anh/chị đã từng gặp ca bệnh nào khiến mình băn khoăn không biết có nên nắn hay không chưa ạ? Anh/chị có thể chia sẻ triệu chứng để em cùng hội chẩn nhé ạ!`,
        cta: "register"
      },

      c_cavitation: {
        text: `💥 <strong>BẢN CHẤT TIẾNG "RẮC" (CAVITATION) TRONG CHIROPRACTIC:</strong><br><br>
Rất nhiều người lầm tưởng tiếng kêu là do "hai đầu xương va đập vào nhau" hoặc "xương bị gãy". Y học chứng cứ giải thích hoàn toàn khác:<br><br>
🔬 <strong>1. Hiện tượng Khí hóa (Cavitation) trong ổ dịch khớp:</strong><br>
• Khớp hoạt dịch được bao bọc kín bởi bao khớp chứa dịch hoạt dịch giàu khí hòa tan (chủ yếu là Nitơ, CO2 và Oxy).<br>
• Khi kỹ thuật viên dùng lực HVLA tốc độ cao đưa khớp vượt qua <strong>Rào cản đàn hồi sinh lý (Elastic Barrier)</strong>, thể tích khoang khớp đột ngột giãn nở.<br>
• Áp suất nội khớp giảm sâu (tạo áp suất âm) khiến chất khí thoát khỏi dung dịch, hình thành bong bóng khí và vỡ ra tích tắc, tạo nên âm thanh "rắc".<br><br>
⚠️ <strong>2. Tiếng kêu KHÔNG ĐỒNG NGHĨA với nắn thành công:</strong><br>
• Sau khi bọt khí vỡ, cần <strong>15–20 phút (Giai đoạn trơ - Refractory Period)</strong> để khí hòa tan trở lại vào dịch khớp.<br>
• <strong>Cảnh báo y khoa:</strong> Các clip vặn bẻ thô bạo trên mạng cố tình vặn xoắn nhiều lần để tạo âm thanh giòn tai sẽ làm <em>giãn dây chằng bao khớp, rách bao xơ đĩa đệm và gây mất vững cột sống (Hypermobility)</em>.<br>
• Specific Chiropractic chỉ cần mở đúng đốt kẹt (Fixation) bằng lực vi tế, không chạy theo tiếng kêu rôm rốp!<br><br>
Dạ anh/chị có hay gặp khách hàng hoặc bệnh nhân cứ đòi phải bẻ thật mạnh để nghe tiếng kêu to không ạ? Anh/chị chia sẻ cảm nhận thực tế nhé!`,
        cta: "register"
      },

      c_pelvis: {
        text: `🦴 <strong>CHÂN NGẮN - CHÂN DÀI & LỆCH KHUNG CHẬU (ILIUM PI vs ILIUM AS):</strong><br><br>
Hơn 90% trường hợp "chân ngắn chân dài" ngoài đời là <strong>Bất đối xứng chức năng</strong> do xoay xương chậu, không phải do xương chân ngắn thật bẩm sinh:<br><br>
📐 <strong>1. Ilium PI (Posterior-Inferior) – Tạo Chân Ngắn Chức Năng:</strong><br>
• Xương cánh chậu bị kẹt xoay ra sau và xuống dưới.<br>
• Trục xoay kéo ổ cối (Acetabulum) tiến lên trên ➔ Kéo đầu xương đùi lên cao ➔ <strong>Làm chân bên đó bị ngắn lại</strong> khi bệnh nhân nằm sấp.<br>
• <em>Dấu hiệu sờ nắn:</em> Gai chậu sau trên (SIPS) bên tổn thương bị hạ thấp và lồi rõ ra phía sau; mào chậu (Crista iliaca) bên đó cao hơn.<br><br>
📐 <strong>2. Ilium AS (Anterior-Superior) – Tạo Chân Dài Chức Năng:</strong><br>
• Xương cánh chậu bị kẹt xoay ra trước và lên trên.<br>
• Đẩy ổ cối xuống dưới ➔ <strong>Làm chân bên đó dài ra</strong>.<br>
• <em>Dấu hiệu:</em> SIPS bên tổn thương cao hơn và phẳng hơn; gai chậu trước trên (SIAS) thấp hơn.<br><br>
🎯 <strong>Giải pháp trị liệu:</strong><br>
Trong giáo trình Henrik Simon, bạn sẽ học cách dùng kỹ thuật nằm nghiêng (Side-lying Pelvis drop) hoặc kỹ thuật nằm sấp tiếp xúc ụ ngồi (Tuber ischiadicum) để đưa chậu về trung tính. Chiều dài 2 chân sẽ <strong>cân bằng ngay lập tức sau 1 buổi</strong>!<br><br>
Dạ anh/chị có đang theo dõi ca bệnh nào bị lệch hông hoặc bước đi nghiêng một bên không ạ? Nếu có hình ảnh tư thế hay phim X-quang, anh/chị cứ nhắn để em cùng Thầy Henrik xem giúp nhé ạ!`,
        cta: "register"
      },

      c_isg: {
        text: `⚡ <strong>KẸT KHỚP CÙNG CHẬU (ISG / SACROILIAC BLOCKADE):</strong><br><br>
Khớp cùng chậu (ISG) là trung tâm truyền lực giữa thân mình và hai chi dưới. Kẹt ISG là nguyên nhân hàng đầu gây đau lưng dưới hay bị chẩn đoán nhầm với thoát vị đĩa đệm.<br><br>
📍 <strong>1. Vị trí đau & Triệu chứng điển hình:</strong><br>
• Đau nhói khu trú tại mào chậu sau, ngay dưới gai chậu sau trên SIPS (Dấu hiệu chỉ ngón tay Fortin).<br>
• Đau lan xuống mông, mặt sau đùi (nhưng hiếm khi vượt quá khớp gối).<br>
• <strong>Điểm đặc trưng:</strong> Đau chói khi chuyển tư thế từ ngồi sang đứng, khi bước lên bậc cầu thang hoặc đứng dồn lực lên một chân.<br><br>
🩺 <strong>2. Bộ 3 Nghiệm Pháp Thăm Khám Vàng:</strong><br>
• <strong>Nghiệm pháp Mennell:</strong> Bệnh nhân nằm sấp, thầy thuốc cố định xương cùng, nâng đùi duỗi tối đa ra sau. Đau nhói tại khớp cùng chậu là dương tính.<br>
• <strong>Nghiệm pháp Patrick (FABERE):</strong> Gập - Dang - Xoay ngoài háng (chân bắt chéo số 4). Ép gối xuống bàn: Nếu đau phía trước bẹn ➔ Tổn thương khớp háng; nếu đau phía sau mông chậu ➔ Kẹt khớp cùng chậu ISG.<br>
• <strong>Vorlauf-Test:</strong> Bệnh nhân đứng thẳng, cúi người ra trước; bên ISG bị khóa cứng thì gai SIPS sẽ bị kéo chạy lên trên sớm hơn bên lành.<br><br>
<em>Thầy Henrik Simon dạy kỹ thuật nắn chỉnh giải phóng ISG bằng lực rơi đòn bẩy chỉ mất 3 giây là giải tỏa cơn đau tức thì!</em><br><br>
Dạ trên ca bệnh này, người bệnh đau nhiều hơn khi đứng lâu hay khi đổi tư thế ngồi dậy ạ? Anh/chị mô tả thêm để em trao đổi sâu hơn nhé ạ!`,
        cta: "register"
      },

      c_disc: {
        text: `📉 <strong>THOÁT VỊ ĐĨA ĐỆM L4-L5, L5-S1 & PHÂN BIỆT HỘI CHỨNG CƠ HÌNH LÊ:</strong><br><br>
Đây là ca lâm sàng phổ biến nhất tại các phòng khám cơ xương khớp:<br><br>
🔬 <strong>1. Phân biệt rễ thần kinh bị chèn ép:</strong><br>
• <strong>Rễ L4 (Đĩa L3-L4):</strong> Đau lan mặt trước đùi, cẳng chân trong; giảm phản xạ gân bánh chè; yếu cơ tứ đầu đùi (khó đứng lên từ tư thế ngồi xổm).<br>
• <strong>Rễ L5 (Đĩa L4-L5 - hay gặp nhất):</strong> Đau lan mặt ngoài đùi, cẳng chân trước ngoài, mu bàn chân và ngón chân cái; yếu cơ duỗi dài ngón cái (không đi được bằng gót chân).<br>
• <strong>Rễ S1 (Đĩa L5-S1):</strong> Đau lan mặt sau đùi, bắp chân, gót chân và bờ ngoài ngón út; giảm phản xạ gân gót Achilles; yếu cơ bắp chân (không đứng kiễng gót chân được).<br><br>
⚡ <strong>2. Phân biệt Hội Chứng Cơ Hình Lê (Piriformis Syndrome):</strong><br>
• Dây thần kinh tọa không bị ép ở cột sống mà bị co thắt, bó nghẽn bởi cơ hình lê nằm sâu trong mông.<br>
• <em>Khám lâm sàng:</em> Ấn điểm giữa mông (điểm xuất chiếu cơ hình lê) bệnh nhân giật nảy người vì đau buốt lan xuống chân; nghiệm pháp Lasègue chỉ đau khi xoay khớp háng vào trong khép đùi; phim MRI cột sống thắt lưng không thấy khối thoát vị lớn.<br><br>
💡 <strong>Lưu ý nắn chỉnh:</strong> Tuyệt đối không nắn vặn xoắn thô bạo vào đĩa đệm đang rách cấp. Simon Center dạy kỹ thuật giải áp rễ thần kinh tự nhiên và nắn các đốt lân cận để chuyển tải trọng lực an toàn!<br><br>
Dạ cơn đau của bệnh nhân có bị lan dọc xuống bắp chân hay ngón chân khi cúi người không ạ? Anh/chị chia sẻ chi tiết thêm với em nhé ạ!`,
        cta: "register"
      },

      c_c1_atlas: {
        text: `🧠 <strong>ĐỐT ĐỘI C1 (ATLAS) & ĐAU NỬA ĐẦU, CHÓNG MẶT TIỀN ĐÌNH:</strong><br><br>
Đốt sống cổ trên cùng C1 (Atlas) là "nhạc trưởng" điều phối toàn bộ trục sinh cơ học cơ thể và tuần hoàn não bộ:<br><br>
🔍 <strong>1. Đặc điểm giải phẫu học độc nhất:</strong><br>
• C1 không có thân đốt sống và không có đĩa đệm, ôm trọn lấy mỏm nha (Dens) của đốt C2 (Axis).<br>
• <strong>Động mạch đốt sống (A. vertebralis):</strong> Phải uốn khúc chữ S ngặt nghèo luồn qua lỗ mỏm ngang của C1 trước khi chui qua lỗ chẩm vào sọ để hợp thành Động mạch thân nền nuôi não bộ, tiểu não và tiền đình ốc tai.<br><br>
⚡ <strong>2. Hậu quả khi C1 bị di lệch (Atlas Subluxation):</strong><br>
• <strong>Đau đầu Cervicogenic & Migraine:</strong> Chèn ép rễ thần kinh C1-C2-C3 kích hoạt nhân dây thần kinh sinh ba (Trigemino-cervical complex), gây đau buốt nửa đầu bốc từ sau gáy lên hốc mắt.<br>
• <strong>Chóng mặt, mất thăng bằng, ù tai:</strong> Giảm lưu lượng dòng máu đốt sống - thân nền.<br>
• <strong>Mất ngủ kinh niên, căng thẳng:</strong> Kéo căng màng cứng và kích hoạt hệ thần kinh giao cảm cổ.<br><br>
🚨 <strong>NGUYÊN TẮC AN TOÀN SỐ 1:</strong><br>
Trước khi nắn vùng C1, Bác sĩ Henrik Simon bắt buộc học viên thực hiện nghiệm pháp <strong>De-Kleyn / Hautant (ngửa xoay đầu tối đa kiểm tra chóng mặt, rung giật nhãn cầu)</strong> để loại trừ 100% nguy cơ hẹp động mạch sống nền, chống tai biến mạch máu não!`,
        cta: "register"
      },

      c_tmj: {
        text: `🦷 <strong>KHỚP THÁI DƯƠNG HÀM (TMG / TMJ) – HÁ MIỆNG LỆCH & KÊU LỤC CỤC:</strong><br><br>
Khớp cắn hàm là một trong những khớp hoạt động nhiều nhất trên cơ thể và liên kết mật thiết với đốt sống cổ C1–C3:<br><br>
⚙️ <strong>1. Cơ chế sinh bệnh:</strong><br>
• Bên trong ổ khớp TMG có một đĩa sụn chêm mỏng (Discus articularis) ngăn cách lồi cầu xương hàm dưới và hố thái dương.<br>
• Khi cơ chân bướm ngoài (M. pterygoideus lateralis) bị co rút một bên hoặc do thói quen nhai một bên, đĩa sụn bị kéo lệch ra trước.<br>
• <strong>Hiện tượng kêu cục cục (Clicking):</strong> Khi há miệng, lồi cầu xương hàm phải "nhảy chồm" qua gờ đĩa sụn, tạo tiếng lách cách. Khi đóng miệng, lồi cầu lại trượt tụt ra sau tạo tiếng click thứ hai.<br>
• Nếu đĩa sụn kẹt cứng không về vị trí được: Gây <strong>Khóa hàm (Kiefersperre)</strong> — miệng há không quá 2 ngón tay.<br><br>
🎯 <strong>2. Phác đồ xử lý chuẩn DISC từ Henrik Simon:</strong><br>
1. Thao tác giải phóng điểm co thắt cơ chân bướm (Intra-oral trigger point release) trong khoang miệng.<br>
2. Kỹ thuật nắn kéo giãn trục và trượt lồi cầu hàm dưới (Caput mandibulae) về vị trí trung tính.<br>
3. Điều chỉnh cân bằng đốt đội C1 và xương bướm sọ não. Tiếng kêu lục cục và lệch khớp cắn biến mất sau vài thao tác êm ái!`,
        cta: "register"
      },

      c_osteoporosis: {
        text: `👵 <strong>BỆNH NHÂN LOÃNG XƯƠNG (OSTEOPOROSIS) CÓ NẮN ĐƯỢC KHÔNG?</strong><br><br>
Rất nhiều học viên hỏi: *"Người cao tuổi thoái hóa nặng, loãng xương có nắn được không, có sợ gãy xương không?"*<br><br>
Bác sĩ Henrik Simon giải thích rõ trong giáo trình:<br><br>
📖 <strong>1. Bản chất giải phẫu học xương loãng:</strong><br>
• Quá trình mất khoáng và tiêu bè xương xảy ra chủ yếu ở <strong>xương xốp (thân đốt sống, cổ xương đùi)</strong>.<br>
• Các cấu trúc như <strong>mỏm gai, mỏm ngang và cung sống lại ít bị mất khoáng hơn nhiều</strong>.<br>
• Do đó, trong Y học chỉnh hình: Loãng xương là <strong>Chống Chỉ Định Tương Đối</strong> (không phải chống chỉ định tuyệt đối)!<br><br>
⛔ <strong>2. LƯU Ý SỐNG CÒN – NGUY CƠ GÃY LÚN ĐỐT SỐNG (Sinterungsfrakturen):</strong><br>
• <strong>TUYỆT ĐỐI CẤM:</strong> Tạo lực nén dọc theo trục cột sống (nén từ trên xuống dưới, đè ép trục dọc) ở người loãng xương. Thao tác bẻ thô bạo có thể làm xẹp lún thân đốt sống ngay lập tức!<br><br>
✅ <strong>3. Kỹ thuật an toàn tuyệt đối từ Henrik Simon:</strong><br>
• Sử dụng <strong>Phương pháp ngón tay cái (Simon-Technik)</strong> và kỹ thuật xung lực tiếp tuyến vuông góc với thân đốt sống.<br>
• Chỉ tác động lực vi tế lên mỏm gai và mỏm ngang để mở kẹt đĩa đệm, không gây bất kỳ áp lực nào lên thân xương xốp. Người già 70–80 tuổi được nắn rất êm, nhẹ nhõm và an toàn 100%!`,
        cta: "register"
      },

      c_extremity: {
        text: `🦵 <strong>KHỚP NGOẠI VI: KẸT SỤN CHÊM GỐI, LẬT SƠ MI CỔ CHÂN & TENNIS ELBOW:</strong><br><br>
Chương 8 & Chương 10 trong giáo trình Henrik Simon cung cấp hệ thống kỹ thuật chi tiết cho tứ chi:<br><br>
⚽ <strong>1. Kẹt sụn chêm gối (Meniscus Blockade):</strong><br>
• Khi vận động xoay gối đột ngột, sụn chêm trong hoặc ngoài bị kẹt vào khe khớp đùi - chày ➔ Gối không thể duỗi thẳng hết mức (khóa khớp gối).<br>
• <em>Kỹ thuật nắn:</em> Kéo giãn trục cẳng chân kết hợp xoay xương chày (Tibia Rotation) và giải phóng bánh chè. Sụn chêm tự trượt về ổ khớp, gối duỗi thẳng ngay tức thì.<br><br>
👟 <strong>2. Lật sơ mi cổ chân mạn tính (Chấn thương lật sấp / lật ngửa):</strong><br>
• Hơn 80% lật sơ mi làm xương sên (Talus) bị trượt ra sau và đầu dưới xương mác trượt ra trước tại khớp nhảy trên (OSG) và dưới (USG).<br>
• Nếu không nắn chỉnh xương sên, cổ chân sẽ mất vững vĩnh viễn và liên tục bị lật tái hồi.<br><br>
🎾 <strong>3. Đau khuỷu tay Tennis Elbow (Viêm lồi cầu ngoài):</strong><br>
• Thực chất gốc bệnh thường do di lệch xoay đầu xương quay (Caput radii) và kẹt rễ cổ C6. Kỹ thuật nắn chỉnh xương quay kết hợp giải phóng cân cơ giúp hết đau dứt điểm mà không cần tiêm Corticoid!`,
        cta: "register"
      },

      c_xray: {
        text: `🔬 <strong>HỆ THỐNG ĐỌC PHIM X-QUANG CƠ SINH HỌC CHUẨN DISC:</strong><br><br>
Đọc phim X-quang là "con mắt thứ ba" của một Chiropractor chuyên nghiệp. Tại Simon Center, bạn được dạy đo đạc chính xác từng góc:<br><br>
📐 <strong>1. Các Chỉ Số Cơ Sinh Học Vàng:</strong><br>
• <strong>Góc nghiêng xương cùng (Sacral Base Angle):</strong> Chuẩn bình thường là 36°–42°. Nếu góc tăng cao ➔ Cột sống thắt lưng quá ưỡn (Hyperlordose), đĩa đệm L5-S1 chịu lực cắt cực đại gây đau thắt lưng mạn tính.<br>
• <strong>Đường trọng lực Ferguson:</strong> Thả đường dọi từ tâm thân đốt L3 phải rơi đúng bờ trước xương cùng.<br>
• <strong>Phim thẳng chậu (AP Pelvis View):</strong> Đo chênh lệch chiều cao mào chậu (Crest height), đường kính lỗ bịt và độ xoay của xương cánh chậu để xác định chuẩn xác Ilium PI hay AS.<br><br>
🔍 <strong>2. Phát hiện sớm Cảnh báo đỏ trên phim:</strong><br>
• <strong>Trượt đốt sống (Spondylolisthesis):</strong> Nhìn rõ gãy eo cung sống (Spondylolysis) qua tư thế chếch 3/4 ("dấu hiệu chú chó cổ ngắn"). Phân độ Meyerding I, II, III, IV để biết ca nào được nắn và ca nào cấm nắn.<br>
• Nhận diện cầu xương gai bắt cầu (DISH / Dính khớp Bechterew) — vùng này tuyệt đối cấm bẻ vì cột sống đã hóa đá giòn dễ gãy.<br><br>
<em>🎁 Học viên đăng ký khóa học được tặng Cẩm nang phân tích phim X-quang độc quyền bằng tiếng Việt!</em>`,
        cta: "register"
      },

      c_hvla_simon: {
        text: `🎯 <strong>KỸ THUẬT HVLA & PHƯƠNG PHÁP NGÓN CÁI (SIMON-TECHNIK):</strong><br><br>
Đây là đỉnh cao tinh hoa lâm sàng hơn 20 năm của Bác sĩ Henrik Simon:<br><br>
⚡ <strong>1. Kỹ thuật HVLA (High-Velocity Low-Amplitude):</strong><br>
• <strong>Vận tốc cực cao (High Velocity):</strong> Thao tác phát lực diễn ra dưới 100 mili-giây — nhanh hơn nhiều so với thời gian phản xạ co cứng cơ tự vệ của bệnh nhân.<br>
• <strong>Biên độ cực ngắn (Low Amplitude):</strong> Quãng đường dịch chuyển khớp chỉ từ 2–3 milimet. Đưa khớp vượt nhẹ qua rào cản đàn hồi sinh lý nhưng <strong>tuyệt đối không bao giờ chạm đến giới hạn giải phẫu (Anatomical Limit)</strong>, đảm bảo an toàn tuyệt đối cho dây chằng và bao khớp.<br><br>
👍 <strong>2. Độc quyền Simon-Technik (Ngón tay cái):</strong><br>
• Thay vì dùng cạnh bàn tay hay cẳng tay tì đè thô bạo, Thầy Henrik Simon sử dụng đệm ngón tay cái tiếp xúc chuẩn xác từng milimet lên mấu gai/mỏm ngang.<br>
• Kết hợp kỹ thuật <strong>Shoulder-Drop (thả rơi vai)</strong> và <strong>Recoil ("lò xo bật lại")</strong>: Lực phát ra từ trọng lượng cơ thể rơi tự do, không hề dùng sức gồng cơ bắp tay.<br>
• Thao tác êm ái đến mức bệnh nhân lớn tuổi thoái hóa nặng hay trẻ nhỏ đều cảm thấy dễ chịu ngay lập tức!`,
        cta: "register"
      },

      c_pediatric: {
        text: `👶 <strong>CHIROPRACTIC TRẺ EM & HỘI CHỨNG KISS / KIDD Ở TRẺ SƠ SINH:</strong><br><br>
Chương 5.8 trong giáo trình Henrik Simon dành riêng cho nắn chỉnh nhi khoa:<br><br>
🍼 <strong>1. Hội chứng KISS (Kopfgelenkinduzierte Symmetriestörung):</strong><br>
• Là hội chứng rối loạn đối xứng do kẹt khớp đầu - cổ (C0-C1) sau quá trình chuyển dạ khó (sinh mổ, sinh hút giác, kẹp forceps hoặc dây rốn quấn cổ).<br>
• <strong>Dấu hiệu nhận biết sớm ở trẻ:</strong> Đầu luôn nghiêng và xoay về một bên cố định (vẹo cổ bẩm sinh); khóc thét dạ đề không rõ nguyên nhân; chỉ bú được một bên ngực mẹ, bên còn lại không ngậm được; toàn thân uốn cong hình quả chuối khi ngủ.<br><br>
🧸 <strong>2. Nguyên Tắc Nắn Chỉnh Nhi Khoa Cực Kỳ Nghiêm Ngặt:</strong><br>
• <strong>TUYỆT ĐỐI KHÔNG CÓ THAO TÁC BẺ VẶN Ở TRẺ NHỎ!</strong><br>
• Toàn bộ kỹ thuật chỉnh hình nhi khoa chỉ sử dụng <strong>áp lực vi mô bằng đầu ngón tay (Micro-pressure)</strong>: Lực tác động cực nhẹ, chỉ tương đương lực bạn ấn ngón tay lên một quả cà chua chín mềm mà không làm dập vỏ.<br>
• Kích thích thụ thể thần kinh bản thể để khớp tự giải phóng và tái lập cân bằng trục sọ cổ. Trẻ bú ngoan, ngủ sâu giấc và hết vẹo đầu ngay sau trị liệu!`,
        cta: "register"
      }
    }
  };

  // Trạng thái hiện tại
  let currentCategory = "course";
  let isChatOpen = false;
  let chatHistory = [];

  // =============================================================================
  // UI INJECTION: CHÈN NÚT CHAT & CỬA SỔ CHAT VÀO DOM
  // =============================================================================
  function injectChatbot() {
    const existingStickyCol = document.querySelector('.fixed.bottom-5.right-4') || 
                              document.querySelector('.fixed.bottom-14.md\\:bottom-5.right-4') ||
                              document.querySelector('.fixed.bottom-5');

    const toggleBtnWrapper = document.createElement("div");
    toggleBtnWrapper.className = "relative group shrink-0";
    toggleBtnWrapper.innerHTML = `
      <button id="chiroChatToggle" onclick="window.toggleChiroChat()" 
        class="w-13 h-13 sm:w-14 sm:h-14 rounded-full text-white flex items-center justify-center transition transform hover:scale-110 relative border-2 border-amber-300 shadow-2xl"
        style="background: linear-gradient(135deg, #4A121E 0%, #8F1D35 60%, #D97706 100%);"
        title="Trợ Lý Tư Vấn Y Khoa Simon Center 24/7">
        <span class="text-2xl" id="chatBtnIcon">💬</span>
        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-ping"></span>
        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
      </button>
      <span class="absolute right-16 top-2.5 bg-[#360B14] text-white text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow-xl pointer-events-none border border-amber-300/40 z-50">
        Chat Tư Vấn Y Khoa 24/7
      </span>
    `;

    if (existingStickyCol) {
      existingStickyCol.insertBefore(toggleBtnWrapper, existingStickyCol.firstChild);
    } else {
      const fallbackBtnContainer = document.createElement("div");
      fallbackBtnContainer.className = "fixed bottom-5 right-4 z-50 flex flex-col gap-3 items-center";
      fallbackBtnContainer.appendChild(toggleBtnWrapper);
      document.body.appendChild(fallbackBtnContainer);
    }

    const chatModal = document.createElement("div");
    chatModal.id = "chiroChatWindow";
    chatModal.className = "fixed bottom-4 sm:bottom-6 right-3 sm:right-24 z-[1000] w-[370px] sm:w-[420px] max-w-[calc(100vw-1.5rem)] h-[600px] max-h-[88vh] bg-white rounded-2xl shadow-2xl border-2 border-brand-crimson/20 flex flex-col overflow-hidden hidden transform transition-all duration-300";
    chatModal.innerHTML = `
      <style>
        #chiroChatWindow {
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        .chiro-chat-header {
          background: linear-gradient(135deg, #360B14 0%, #4A121E 50%, #8F1D35 100%);
        }
        .chiro-bot-bubble {
          background: #FDFBF7;
          border: 1px solid rgba(217, 119, 6, 0.25);
          color: #1A1D20;
          font-size: 13px;
          line-height: 1.68;
        }
        .chiro-user-bubble {
          background: #8F1D35;
          color: #FFFFFF;
        }
        .chiro-chip {
          background: #F4F5F7;
          border: 1px solid #E2E8F0;
          color: #334155;
          transition: all 0.2s ease;
        }
        .chiro-chip:hover {
          background: #FEF3C7;
          border-color: #F59E0B;
          color: #92400E;
          transform: translateY(-1px);
        }
        .chiro-cta-btn {
          background: linear-gradient(135deg, #8F1D35 0%, #76162A 100%);
          transition: all 0.2s ease;
        }
        .chiro-cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px -2px rgba(143, 29, 53, 0.4);
        }
        .chat-scroll::-webkit-scrollbar {
          width: 5px;
          height: 4px;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        @keyframes chiroCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .chiro-cursor {
          display: inline-block;
          width: 2.5px;
          height: 14px;
          background-color: #8F1D35;
          margin-left: 2px;
          vertical-align: -1.5px;
          animation: chiroCursorBlink 0.75s infinite;
          border-radius: 1px;
        }
      </style>

      <!-- HEADER CỬA SỔ CHAT -->
      <div class="chiro-chat-header text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-white/15 shrink-0">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div class="w-10 h-10 rounded-full bg-white/10 border-2 border-amber-300 flex items-center justify-center font-black text-amber-300 text-base shadow">
              SC
            </div>
            <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border border-white"></span>
          </div>
          <div>
            <div class="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
              <span>Trợ Lý Chuyên Môn Simon Center</span>
            </div>
            <div class="text-[10px] text-amber-200 flex items-center space-x-1 mt-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              <span>Tra cứu Y khoa &amp; Khóa học • 24/7</span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-1 sm:space-x-1.5">
          <button type="button" id="chiroAiToggleBtn" onclick="window.openGeminiSettingsModal()" title="Cài đặt Google Gemini AI" 
            class="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-300/40 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 transition shadow-2xs">
            <span id="chiroAiDot" class="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
            <span id="chiroAiStatusLabel">AI Gemini</span>
          </button>
          <button onclick="window.clearChiroChat()" title="Làm mới cuộc trò chuyện" class="text-white/70 hover:text-white p-1.5 text-xs rounded-lg hover:bg-white/10 transition">
            🔄
          </button>
          <button onclick="window.toggleChiroChat()" title="Đóng chat" class="text-white/80 hover:text-white p-1 text-lg rounded-lg hover:bg-white/10 transition font-bold leading-none">
            ✕
          </button>
        </div>
      </div>

      <!-- TIN NHẮN CHAT (MESSAGES) -->
      <div id="chiroChatMessages" class="chat-scroll flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-[#F8FAFC] relative">
        <!-- Nội dung tin nhắn -->
      </div>

      <!-- MODAL CẤU HÌNH GOOGLE GEMINI AI -->
      <div id="chiroGeminiModal" class="hidden absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
        <div class="bg-white rounded-2xl p-4 shadow-2xl border border-amber-200 text-gray-800 text-xs w-full max-w-sm space-y-3">
          <div class="flex items-center justify-between border-b border-gray-100 pb-2">
            <div class="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-brand-wine">
              <span class="text-base">🤖</span>
              <span>Cài Đặt Trí Tuệ Nhân Tạo Google Gemini</span>
            </div>
            <button type="button" onclick="window.closeGeminiSettingsModal()" class="text-gray-400 hover:text-gray-600 text-base font-bold p-1">✕</button>
          </div>
          <p class="text-[11px] text-gray-600 leading-relaxed">
            Gắn API Key của <strong>Google Gemini</strong> để Chatbot suy nghĩ sâu, thấu hiểu ngữ cảnh và trò chuyện linh hoạt 100% như ChatGPT!
          </p>
          <div class="space-y-1">
            <label class="font-bold text-[11px] text-gray-700 block">Google Gemini API Key:</label>
            <input type="password" id="geminiApiKeyInput" placeholder="Dán API Key (AIzaSy...)" 
              class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-crimson font-mono text-gray-900 bg-gray-50" />
            <div class="flex justify-between items-center pt-0.5">
              <a href="https://aistudio.google.com/apikey" target="_blank" class="text-brand-crimson hover:underline text-[10px] font-semibold">
                👉 Lấy API Key miễn phí tại Google AI Studio
              </a>
              <button type="button" onclick="window.toggleApiKeyVisibility()" class="text-[10px] text-gray-500 hover:text-gray-700 font-medium">Hiện/Ẩn</button>
            </div>
          </div>
          <div class="space-y-1">
            <label class="font-bold text-[11px] text-gray-700 block">Mô hình AI:</label>
            <select id="geminiModelSelect" class="w-full px-2.5 py-1.5 border border-gray-300 rounded-xl text-xs bg-gray-50">
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Mới nhất, Siêu nhanh &amp; Thông minh)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ổn định, Tiết kiệm)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Suy luận y học chuyên sâu)</option>
            </select>
          </div>
          <div id="geminiTestStatus" class="hidden p-2 rounded-xl text-[11px] font-medium"></div>
          <div class="flex items-center gap-2 pt-1">
            <button type="button" onclick="window.saveGeminiConfig()" class="flex-1 bg-brand-crimson hover:bg-brand-wine text-white font-bold py-2 px-3 rounded-xl transition shadow text-xs">
              💾 Lưu &amp; Kích Hoạt
            </button>
            <button type="button" onclick="window.testGeminiConnection()" class="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-2 px-3 rounded-xl transition text-xs">
              🧪 Thử Kết Nối
            </button>
          </div>
        </div>
      </div>

      <!-- THANH CHUYỂN TAB CHỦ ĐỀ GỢI Ý (KHÓA HỌC / CHUYÊN KHOA) -->
      <div class="px-2.5 pt-2 pb-1 bg-white border-t border-gray-200 flex items-center justify-between gap-1 shrink-0">
        <span class="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Chủ đề:</span>
        <div class="flex items-center gap-1">
          <button type="button" id="tabBtnCourse" onclick="window.switchChiroCategory('course')" 
            class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-brand-crimson text-white shadow-xs">
            🎓 Khóa Học (12)
          </button>
          <button type="button" id="tabBtnClinical" onclick="window.switchChiroCategory('clinical')" 
            class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 border border-gray-200">
            🩺 Hỏi Chuyên Khoa (12)
          </button>
        </div>
      </div>

      <!-- GỢI Ý CÂU HỎI NHANH (QUICK CHIPS) -->
      <div id="chiroQuickChipsContainer" class="px-2.5 pb-2 pt-1 bg-white overflow-x-auto whitespace-nowrap text-xs flex gap-1.5 chat-scroll shrink-0 border-b border-gray-100">
        <!-- Chips render động -->
      </div>

      <!-- KHUNG NHẬP TIN NHẮN (INPUT BAR) -->
      <div class="p-2.5 sm:p-3 bg-white shrink-0">
        <form id="chiroChatForm" onsubmit="window.handleChiroSend(event)" class="flex items-center space-x-2">
          <input type="text" id="chiroChatInput" placeholder="Hỏi về bệnh học, X-quang, kỹ thuật nắn, học phí..." 
            class="flex-1 bg-gray-100 hover:bg-gray-50 focus:bg-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-crimson transition text-gray-800"
            autocomplete="off" />
          <button type="submit" class="bg-brand-crimson hover:bg-brand-crimsonHover text-white w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow transition transform hover:scale-105" title="Gửi tin nhắn">
            <svg class="w-4 h-4 fill-current rotate-90" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          </button>
        </form>
        <div class="text-[10px] text-gray-400 text-center mt-1.5 flex items-center justify-center space-x-2">
          <span>🔒 Y đức chuẩn mực</span>
          <span>•</span>
          <span>Kế thừa 20+ năm Bác Sĩ Henrik Simon</span>
          <span>•</span>
          <a href="tel:0389609938" class="text-brand-crimson font-bold hover:underline">Hotline: 0389.609.938</a>
        </div>
      </div>
    `;

    document.body.appendChild(chatModal);
    updateAiBadgeStatus();
  }

  // =============================================================================
  // LOGIC ĐIỀU HÀNH CHATBOT
  // =============================================================================
  window.toggleChiroChat = function () {
    const chatWindow = document.getElementById("chiroChatWindow");
    const chatBtnIcon = document.getElementById("chatBtnIcon");
    if (!chatWindow) return;

    isChatOpen = !isChatOpen;
    if (isChatOpen) {
      chatWindow.classList.remove("hidden");
      if (chatBtnIcon) chatBtnIcon.innerText = "✕";
      updateAiBadgeStatus();
      if (chatHistory.length === 0) {
        initGreeting();
      }
      setTimeout(() => {
        document.getElementById("chiroChatInput")?.focus();
      }, 300);
    } else {
      chatWindow.classList.add("hidden");
      if (chatBtnIcon) chatBtnIcon.innerText = "💬";
    }
  };

  function initGreeting() {
    const greetingText = (BOT_DATA.greetings && BOT_DATA.greetings[currentCategory]) || BOT_DATA.greetings?.course || BOT_DATA.greeting;
    appendBotMessage(greetingText, null, true);
    renderQuickChips();
  }

  window.switchChiroCategory = function (cat) {
    if (currentCategory === cat) return;
    currentCategory = cat;
    const btnCourse = document.getElementById("tabBtnCourse");
    const btnClinical = document.getElementById("tabBtnClinical");

    if (cat === "course") {
      if (btnCourse) btnCourse.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-brand-crimson text-white shadow-xs";
      if (btnClinical) btnClinical.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 border border-gray-200";
    } else {
      if (btnClinical) btnClinical.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-brand-crimson text-white shadow-xs";
      if (btnCourse) btnCourse.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 border border-gray-200";
    }

    renderQuickChips();

    // Nếu người dùng vừa mở chat chưa hỏi câu nào (chỉ mới có lời chào khởi tạo), cập nhật lời chào đúng theo tab
    if (chatHistory.length <= 1) {
      chatHistory = [];
      const messagesContainer = document.getElementById("chiroChatMessages");
      if (messagesContainer) messagesContainer.innerHTML = "";
      const greetingText = (BOT_DATA.greetings && BOT_DATA.greetings[currentCategory]) || BOT_DATA.greetings?.course;
      appendBotMessage(greetingText, null, true);
    }
  };

  function renderQuickChips() {
    const container = document.getElementById("chiroQuickChipsContainer");
    if (!container) return;
    container.innerHTML = "";

    const activeList = BOT_DATA.categories[currentCategory]?.questions || [];
    activeList.forEach(q => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chiro-chip px-2.5 py-1.5 rounded-full text-[11px] font-semibold shrink-0 cursor-pointer shadow-2xs";
      chip.innerText = q.text;
      chip.onclick = () => {
        handleQuestionClick(q.id, q.text);
      };
      container.appendChild(chip);
    });
  }

  function handleQuestionClick(id, questionText) {
    appendUserMessage(questionText);
    showTypingIndicator(() => {
      if (id === "c_courses_and_pricing") {
        sendCourseListAndPricingSequence();
        return;
      }
      const ans = BOT_DATA.answers[id];
      if (ans) {
        appendBotMessage(ans.text, ans.cta);
      } else {
        appendBotMessage(`Dạ chuyên viên Simon Center đã nhận được thông tin câu hỏi của anh/chị. Anh/chị có thể để lại số điện thoại hoặc nhấn nút bên dưới để chuyên viên tư vấn chi tiết nhé ạ!`, "register");
      }
    });
  }

  function appendBotMessage(htmlContent, ctaType = null, isInstant = false, onComplete = null) {
    chatHistory.push({ sender: "bot", text: htmlContent, cta: ctaType });
    const messagesContainer = document.getElementById("chiroChatMessages");
    if (!messagesContainer) {
      if (typeof onComplete === "function") onComplete();
      return;
    }

    const msgDiv = document.createElement("div");
    msgDiv.className = "flex items-start space-x-2 text-xs leading-relaxed max-w-[94%]";
    
    let ctaHtml = "";
    if (ctaType === "register" || ctaType === "register_now") {
      ctaHtml = `
        <div class="mt-3 pt-2.5 border-t border-amber-200/60 space-y-1.5">
          <button onclick="window.scrollToRegisterForm('buy')" class="chiro-cta-btn w-full text-white text-xs font-bold py-2 px-3 rounded-xl shadow flex items-center justify-center space-x-1.5">
            <span>👉 Xem Học Phí / Giữ Suất Ưu Đãi (12.9Tr)</span>
          </button>
          <a href="https://zalo.me/0389609938" target="_blank" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-xs flex items-center justify-center space-x-1 transition">
            <span>💬 Hội Chẩn Ca Bệnh / Zalo Bác Sĩ: 0389.609.938</span>
          </a>
        </div>
      `;
    } else if (ctaType === "trial") {
      ctaHtml = `
        <div class="mt-3 pt-2.5 border-t border-amber-200/60 space-y-1.5">
          <button onclick="window.scrollToRegisterForm('trial')" class="bg-amber-600 hover:bg-amber-700 text-white w-full text-xs font-bold py-2 px-3 rounded-xl shadow flex items-center justify-center space-x-1.5 transition">
            <span>🎁 Điền Form Nhận Video Học Thử & Giữ Ưu Đãi</span>
          </button>
          <a href="https://zalo.me/0389609938" target="_blank" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-xs flex items-center justify-center space-x-1 transition">
            <span>💬 Hội Chẩn Ca Bệnh / Zalo Bác Sĩ: 0389.609.938</span>
          </a>
          <a href="tel:0389609938" class="block text-center text-[11px] text-gray-500 hover:text-brand-crimson font-medium pt-0.5">
            Hotline Hỗ Trợ 24/7: 0389.609.938
          </a>
        </div>
      `;
    }

    if (isInstant) {
      msgDiv.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-brand-wine text-amber-300 font-extrabold flex items-center justify-center text-[10px] shrink-0 shadow border border-amber-300/40 mt-0.5">
          SC
        </div>
        <div class="chiro-bot-bubble p-3 rounded-2xl rounded-tl-xs shadow-xs">
          <div>${htmlContent}</div>
          ${ctaHtml}
        </div>
      `;
      messagesContainer.appendChild(msgDiv);
      setTimeout(() => {
        try {
          const topTarget = msgDiv.offsetTop - 8;
          messagesContainer.scrollTo({ top: Math.max(0, topTarget), behavior: "smooth" });
        } catch (err) {
          msgDiv.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        if (typeof onComplete === "function") {
          setTimeout(onComplete, 80);
        }
      }, 60);
      return;
    }

    // --- HIỆU ỨNG GÕ CHỮ TỪNG TỪ CHUẨN CHATGPT (TRUE STREAMING TYPEWRITER) ---
    msgDiv.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-brand-wine text-amber-300 font-extrabold flex items-center justify-center text-[10px] shrink-0 shadow border border-amber-300/40 mt-0.5">
        SC
      </div>
      <div class="chiro-bot-bubble p-3 rounded-2xl rounded-tl-xs shadow-xs w-full">
        <div class="chiro-stream-content"></div>
        <div class="chiro-stream-cta hidden opacity-0 transition-all duration-500 transform translate-y-2">
          ${ctaHtml}
        </div>
      </div>
    `;

    messagesContainer.appendChild(msgDiv);
    
    const scrollTarget = msgDiv.offsetTop - 10;
    messagesContainer.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });

    const contentBox = msgDiv.querySelector(".chiro-stream-content");
    const ctaBox = msgDiv.querySelector(".chiro-stream-cta");

    streamHtmlTypewriter(contentBox, htmlContent, () => {
      if (ctaHtml && ctaBox) {
        ctaBox.classList.remove("hidden");
        requestAnimationFrame(() => {
          ctaBox.classList.remove("opacity-0", "translate-y-2");
          ctaBox.classList.add("opacity-100", "translate-y-0");
          const dist = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight;
          if (dist < 120) {
            messagesContainer.scrollTo({
              top: messagesContainer.scrollHeight,
              behavior: "smooth"
            });
          }
          if (typeof onComplete === "function") {
            setTimeout(onComplete, 300);
          }
        });
      } else {
        if (typeof onComplete === "function") {
          setTimeout(onComplete, 300);
        }
      }
    });
  }

  // Gửi chuỗi 2 tin nhắn tự động cho câu hỏi Danh sách khóa học & Học phí
  function sendCourseListAndPricingSequence() {
    appendBotMessage(BOT_DATA.answers.c_courses_and_pricing_part1.text, null, false, () => {
      showShortTypingIndicator(() => {
        appendBotMessage(BOT_DATA.answers.c_courses_and_pricing_part2.text, BOT_DATA.answers.c_courses_and_pricing_part2.cta);
      }, "✍️ Simon Center đang gửi thêm lưu ý chuyên môn...");
    });
  }

  // ── ĐỘNG CƠ GÕ CHỮ TỪNG TỪ CHUẨN CHATGPT (STREAMING TYPEWRITER ENGINE) ──
  function streamHtmlTypewriter(targetElement, htmlContent, onComplete) {
    const messagesContainer = document.getElementById("chiroChatMessages");
    targetElement.innerHTML = htmlContent;

    // Trích xuất toàn bộ Text Nodes trong cấu trúc DOM đã dựng sẵn (bảo tồn nguyên vẹn mọi thẻ HTML)
    const textNodes = [];
    const walker = document.createTreeWalker(targetElement, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push({
        node: node,
        fullText: node.nodeValue
      });
      node.nodeValue = ""; // Làm rỗng ban đầu để gõ dần từng từ
    }

    if (textNodes.length === 0) {
      if (typeof onComplete === "function") onComplete();
      return;
    }

    // Tạo con trỏ nhấp nháy chuẩn ChatGPT
    const cursor = document.createElement("span");
    cursor.className = "chiro-cursor";
    targetElement.appendChild(cursor);

    let nodeIdx = 0;
    let charIdx = 0;

    // XỬ LÝ CUỘN THÔNG MINH (CHO PHÉP NGƯỜI DÙNG TỰ DO CUỘN LÊN ĐỌC BẤT CỨ LÚC NÀO)
    let userScrolledUp = false;

    const onWheel = (e) => {
      if (e.deltaY < 0) {
        // Người dùng cuộn chuột/touchpad lên -> Ngay lập tức tạm dừng tự động cuộn xuống
        userScrolledUp = true;
      } else if (messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 35) {
        // Người dùng cuộn lại sát đáy -> Tiếp tục theo dõi
        userScrolledUp = false;
      }
    };

    const onTouchMove = () => {
      const dist = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight;
      if (dist > 50) {
        userScrolledUp = true;
      } else {
        userScrolledUp = false;
      }
    };

    const onScroll = () => {
      const dist = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight;
      if (dist > 65) {
        userScrolledUp = true;
      } else if (dist <= 25) {
        userScrolledUp = false;
      }
    };

    if (messagesContainer) {
      messagesContainer.addEventListener("wheel", onWheel, { passive: true });
      messagesContainer.addEventListener("touchmove", onTouchMove, { passive: true });
      messagesContainer.addEventListener("scroll", onScroll, { passive: true });
    }

    function cleanupScrollListeners() {
      if (messagesContainer) {
        messagesContainer.removeEventListener("wheel", onWheel);
        messagesContainer.removeEventListener("touchmove", onTouchMove);
        messagesContainer.removeEventListener("scroll", onScroll);
      }
    }

    function smoothScrollDown() {
      if (!messagesContainer || userScrolledUp) return;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function typeNextTick() {
      if (nodeIdx >= textNodes.length) {
        if (cursor && cursor.parentNode) cursor.remove();
        cleanupScrollListeners();
        smoothScrollDown();
        if (typeof onComplete === "function") onComplete();
        return;
      }

      const current = textNodes[nodeIdx];
      const full = current.fullText;

      // Nếu là khoảng trắng đơn thuần (newline, tab...), hiển thị ngay và sang node tiếp theo
      if (!full.trim()) {
        current.node.nodeValue = full;
        nodeIdx++;
        charIdx = 0;
        typeNextTick();
        return;
      }

      // Tìm ranh giới từ tiếp theo (khoảng trắng tiếp theo)
      const nextSpace = full.indexOf(" ", charIdx);
      let nextChunkEnd;
      if (nextSpace === -1) {
        nextChunkEnd = full.length;
      } else {
        nextChunkEnd = nextSpace + 1;
      }

      charIdx = nextChunkEnd;
      current.node.nodeValue = full.slice(0, charIdx);

      // Đặt con trỏ ngay sau vị trí đang gõ
      if (current.node.parentNode) {
        current.node.parentNode.insertBefore(cursor, current.node.nextSibling);
      }

      smoothScrollDown();

      // Tính toán độ trễ gõ phím chân thực như người gõ phím / ChatGPT streaming
      const lastChar = full.charAt(charIdx - 1) || (charIdx >= 2 ? full.charAt(charIdx - 2) : "");
      let delay = Math.floor(Math.random() * 14) + 24; // 24ms - 38ms mỗi từ

      if (lastChar === "." || lastChar === "!" || lastChar === "?") {
        delay = 180; // Dừng nhịp suy nghĩ ngắt câu
      } else if (lastChar === "," || lastChar === ";" || lastChar === ":" || lastChar === "—") {
        delay = 95; // Dừng nhẹ ở dấu phẩy
      }

      if (charIdx >= full.length) {
        nodeIdx++;
        charIdx = 0;
      }

      setTimeout(typeNextTick, delay);
    }

    setTimeout(typeNextTick, 60);
  }

  function appendUserMessage(text) {
    chatHistory.push({ sender: "user", text: text });
    const messagesContainer = document.getElementById("chiroChatMessages");
    if (!messagesContainer) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = "flex items-end justify-end space-x-2 text-xs leading-relaxed max-w-[88%] ml-auto";
    msgDiv.innerHTML = `
      <div class="chiro-user-bubble p-3 rounded-2xl rounded-tr-xs shadow-xs font-medium">
        ${escapeHtml(text)}
      </div>
    `;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // =============================================================================
  // 🧠 ĐỘNG CƠ TƯ VẤN TRÍ TUỆ NHÂN TẠO GEMINI (GEMINI AI API INTEGRATION)
  // =============================================================================
  async function callGeminiAPI(userMessage, history) {
    const apiKey = (GEMINI_CONFIG.apiKey || "").trim();
    if (!apiKey) throw new Error("Chưa cấu hình API Key");

    const contents = [];
    const recent = (history || []).slice(-6);
    recent.forEach(msg => {
      if (msg.sender === "user") {
        contents.push({ role: "user", parts: [{ text: msg.text }] });
      } else if (msg.sender === "bot") {
        const clean = (msg.text || "").replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
        if (clean) {
          contents.push({ role: "model", parts: [{ text: clean.slice(0, 600) }] });
        }
      }
    });

    contents.push({
      role: "user",
      parts: [{
        text: `[Khách đang ở Tab: ${currentCategory === 'course' ? 'Tư Vấn Khóa Học' : 'Hội Chẩn Bệnh Học'}]. Câu hỏi của khách: "${userMessage}"`
      }]
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: GEMINI_SYSTEM_PROMPT }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Lỗi HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawAiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawAiText) throw new Error("Phản hồi rỗng từ Gemini API");

    return formatGeminiMarkdownToHtml(rawAiText);
  }

  function formatGeminiMarkdownToHtml(text) {
    if (!text) return "";
    let html = text.trim();

    // Headers
    html = html.replace(/^### (.*$)/gim, '<strong class="text-brand-crimson block mt-2 mb-1 text-xs">$1</strong>');
    html = html.replace(/^## (.*$)/gim, '<strong class="text-brand-crimson block mt-2 mb-1 text-xs">$1</strong>');
    html = html.replace(/^# (.*$)/gim, '<strong class="text-brand-crimson block mt-2 mb-1 text-xs">$1</strong>');

    // Bold & Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Bullet points
    html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '• $1<br>');
    html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '$1. $2<br>');

    // Line breaks & paragraphs
    html = html.replace(/\n\n+/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/(<br>){3,}/g, '<br><br>');

    return html;
  }

  // Quản lý Modal & Trạng thái Gemini AI
  window.openGeminiSettingsModal = function () {
    const modal = document.getElementById("chiroGeminiModal");
    const input = document.getElementById("geminiApiKeyInput");
    const select = document.getElementById("geminiModelSelect");
    const statusDiv = document.getElementById("geminiTestStatus");

    if (modal) modal.classList.remove("hidden");
    if (input) input.value = GEMINI_CONFIG.apiKey || "";
    if (select) select.value = GEMINI_CONFIG.model || "gemini-2.5-flash";
    if (statusDiv) {
      statusDiv.className = "hidden p-2 rounded-xl text-[11px] font-medium";
      statusDiv.innerHTML = "";
    }
  };

  window.closeGeminiSettingsModal = function () {
    const modal = document.getElementById("chiroGeminiModal");
    if (modal) modal.classList.add("hidden");
  };

  window.toggleApiKeyVisibility = function () {
    const input = document.getElementById("geminiApiKeyInput");
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
  };

  window.saveGeminiConfig = function () {
    const input = document.getElementById("geminiApiKeyInput");
    const select = document.getElementById("geminiModelSelect");
    const statusDiv = document.getElementById("geminiTestStatus");

    const key = (input ? input.value.trim() : "");
    const model = (select ? select.value : "gemini-2.5-flash");

    GEMINI_CONFIG.apiKey = key;
    GEMINI_CONFIG.model = model;
    GEMINI_CONFIG.enabled = !!key;

    localStorage.setItem("CHIRO_GEMINI_API_KEY", key);
    localStorage.setItem("CHIRO_GEMINI_MODEL", model);
    localStorage.setItem("CHIRO_GEMINI_ENABLED", key ? "true" : "false");

    updateAiBadgeStatus();

    if (statusDiv) {
      statusDiv.className = "p-2 rounded-xl text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 block";
      statusDiv.innerHTML = key 
        ? "✅ Đã lưu cấu hình! Trợ lý Gemini AI hiện đang hoạt động trực tiếp."
        : "ℹ️ Đã xóa API Key. Chatbot sẽ chạy ở chế độ Chuyên môn Nội bộ.";
    }

    setTimeout(() => {
      window.closeGeminiSettingsModal();
    }, 1200);
  };

  window.testGeminiConnection = async function () {
    const input = document.getElementById("geminiApiKeyInput");
    const select = document.getElementById("geminiModelSelect");
    const statusDiv = document.getElementById("geminiTestStatus");

    const key = (input ? input.value.trim() : "");
    const model = (select ? select.value : "gemini-2.5-flash");

    if (!key) {
      if (statusDiv) {
        statusDiv.className = "p-2 rounded-xl text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 block";
        statusDiv.innerText = "⚠️ Vui lòng dán API Key vào ô trước khi thử kết nối.";
      }
      return;
    }

    if (statusDiv) {
      statusDiv.className = "p-2 rounded-xl text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 block";
      statusDiv.innerText = "⏳ Đang kết nối thử tới Google AI Server...";
    }

    try {
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const res = await fetch(testUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Xin chào, phản hồi 1 câu ngắn xác nhận kết nối." }] }]
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "OK";

      if (statusDiv) {
        statusDiv.className = "p-2 rounded-xl text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 block";
        statusDiv.innerText = `✅ Kết nối thành công tới ${model}! Phản hồi: "${reply.trim()}"`;
      }
    } catch (err) {
      if (statusDiv) {
        statusDiv.className = "p-2 rounded-xl text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 block";
        statusDiv.innerText = `❌ Kết nối thất bại: ${err.message}`;
      }
    }
  };

  function updateAiBadgeStatus() {
    const badge = document.getElementById("chiroAiToggleBtn");
    const dot = document.getElementById("chiroAiDot");
    const label = document.getElementById("chiroAiStatusLabel");
    if (!badge || !dot || !label) return;

    if (GEMINI_CONFIG.apiKey && GEMINI_CONFIG.enabled) {
      dot.className = "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse";
      label.innerText = "✨ Gemini AI (Bật)";
      badge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-300/40 bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-200 transition shadow-2xs cursor-pointer";
    } else {
      dot.className = "w-1.5 h-1.5 rounded-full bg-amber-400";
      label.innerText = "⚙️ Cài Gemini AI";
      badge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-300/40 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 transition shadow-2xs cursor-pointer";
    }
  }

  window.handleChiroSend = function (e) {
    e.preventDefault();
    const input = document.getElementById("chiroChatInput");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    appendUserMessage(text);
    input.value = "";

    // 1. NẾU GEMINI AI ĐÃ CẤU HÌNH VÀ KÍCH HOẠT: GỌI GEMINI TRỰC TIẾP
    if (GEMINI_CONFIG.apiKey && GEMINI_CONFIG.enabled) {
      showTypingIndicator((removeIndicator) => {
        callGeminiAPI(text, chatHistory)
          .then((aiResponseHtml) => {
            if (typeof removeIndicator === "function") removeIndicator();
            let cta = "trial";
            const lowerRes = aiResponseHtml.toLowerCase();
            if (lowerRes.includes("dang ky") || lowerRes.includes("hoc phi") || lowerRes.includes("12.9") || lowerRes.includes("1.000.000") || lowerRes.includes("bang gia")) {
              cta = "register";
            }
            appendBotMessage(aiResponseHtml, cta);
          })
          .catch((err) => {
            console.warn("[Gemini API Error -> Fallback Local NLP]:", err);
            if (typeof removeIndicator === "function") removeIndicator();
            matchAndReply(text);
          });
      }, "🧠 Gemini AI đang tra cứu y khoa & suy nghĩ câu trả lời...");
      return;
    }

    // 2. CHẾ ĐỘ MẶC ĐỊNH: BỘ MÁY CHUYÊN MÔN NỘI BỘ (LOCAL MEDICAL NLP)
    showTypingIndicator(() => {
      matchAndReply(text);
    });
  };

  // =============================================================================
  // ĐỘNG CƠ NHẬN DIỆN Ý ĐỊNH & TRA CỨU KIẾN THỨC CHUYÊN KHOA (NLP ENGINE)
  // =============================================================================
  function normalizeText(str) {
    if (!str) return "";
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
    str = str.replace(/\u02C6|\u0306|\u031B/g, "");
    return str.trim();
  }

  function matchAndReply(userInput) {
    const raw = userInput.toLowerCase();
    const norm = normalizeText(userInput);

    // =========================================================
    // 0. NHÓM TRẢ LỜI CỤ THỂ CHI TIẾT TỪNG MODULE / NHU CẦU ĐẶC BIỆT
    // =========================================================

    // 00. Khách hỏi khóa học / sản phẩm có phù hợp với tôi không / dành cho đối tượng nào / ai nên học
    const isTargetAudienceQuery = 
      (norm.includes("phu hop") || norm.includes("hop voi toi") || norm.includes("danh cho ai") || 
       norm.includes("ai nen hoc") || norm.includes("doi tuong") || norm.includes("ai co the hoc") ||
       (norm.includes("san pham") && (norm.includes("phu hop") || norm.includes("cho toi")))) &&
      !norm.includes("tuoi") && !norm.includes("50") && !norm.includes("60") && !norm.includes("gia") &&
      !norm.includes("nu") && !norm.includes("nho con") && !norm.includes("yeu");

    if (isTargetAudienceQuery) {
      appendBotMessage(BOT_DATA.answers.c_target_audience.text, BOT_DATA.answers.c_target_audience.cta);
      return;
    }

    // 0a. Học riêng phần lưng / thắt lưng / chậu (Ví dụ: "Tôi chỉ muốn học một phần nắn chỉnh phần lưng thôi thì sao?")
    const isLearnLumbar = 
      ((norm.includes("hoc") || norm.includes("day") || norm.includes("khoa") || norm.includes("lop") || currentCategory === "course") && 
       (norm.includes("phan lung") || norm.includes("that lung") || norm.includes("vung lung") || norm.includes("cot song that lung") || norm.includes("hoc lung") || norm.includes("nan lung") || norm.includes("l1") || norm.includes("l5"))) ||
      ((norm.includes("mot phan") || norm.includes("rieng") || norm.includes("le") || norm.includes("chi muon")) && (norm.includes("lung") || norm.includes("that lung")));

    if (isLearnLumbar) {
      appendBotMessage(BOT_DATA.answers.c_lumbar_part.text, BOT_DATA.answers.c_lumbar_part.cta);
      return;
    }

    // 0b. Học riêng phần cổ vai gáy / đốt sống cổ / HWS
    const isLearnCervical = 
      ((norm.includes("hoc") || norm.includes("day") || norm.includes("khoa") || norm.includes("lop") || currentCategory === "course") && 
       (norm.includes("co vai gay") || norm.includes("vai gay") || norm.includes("phan co") || norm.includes("dot song co") || norm.includes("vung co") || norm.includes("hoc co") || norm.includes("nan co") || norm.includes("c1") || norm.includes("c7"))) ||
      ((norm.includes("mot phan") || norm.includes("rieng") || norm.includes("le") || norm.includes("chi muon")) && (norm.includes("co vai gay") || norm.includes("vai gay") || norm.includes("vung co") || norm.includes("phan co") || norm.includes("gay")));

    if (isLearnCervical) {
      appendBotMessage(BOT_DATA.answers.c_cervical_part.text, BOT_DATA.answers.c_cervical_part.cta);
      return;
    }

    // 0c. Học nắn chỉnh tứ chi / tay chân / khớp ngoại vi (gối, cổ chân, vai, khuỷu)
    const isLearnExtremity = 
      (norm.includes("hoc") || norm.includes("day") || norm.includes("khoa") || norm.includes("lop") || currentCategory === "course") && 
      (norm.includes("tu chi") || norm.includes("tay chan") || norm.includes("khop goi") || norm.includes("co chan") || norm.includes("khuyu tay") || norm.includes("khop vai") || norm.includes("ngoai vi"));

    if (isLearnExtremity) {
      appendBotMessage(BOT_DATA.answers.c_extremity_part.text, BOT_DATA.answers.c_extremity_part.cta);
      return;
    }

    // 0d. Lớn tuổi / 50 tuổi / 60 tuổi / già có học được không
    const isAgeQuery = 
      (norm.includes("tuoi") || norm.includes("50") || norm.includes("60") || norm.includes("lon tuoi") || norm.includes("gia") || norm.includes("trung nien")) &&
      (norm.includes("hoc") || norm.includes("khoa") || currentCategory === "course");

    if (isAgeQuery) {
      appendBotMessage(BOT_DATA.answers.c_age_limit.text, BOT_DATA.answers.c_age_limit.cta);
      return;
    }

    // 0e. Xem lại / tài khoản dài hạn / có giới hạn thời gian không
    const isLifetimeQuery = 
      norm.includes("tron doi") || norm.includes("xem lai") || norm.includes("vinh vien") || 
      norm.includes("xem duoc bao lau") || norm.includes("gioi han thoi gian") || norm.includes("xem di xem lai") || 
      norm.includes("tai khoan hoc") || norm.includes("mat tai khoan") || norm.includes("het han");

    if (isLifetimeQuery) {
      appendBotMessage(BOT_DATA.answers.c_relearn_lifetime.text, BOT_DATA.answers.c_relearn_lifetime.cta);
      return;
    }

    // 0f. Ở nước ngoài / kiều bào / thanh toán quốc tế / lệch múi giờ
    const isAbroadQuery = 
      norm.includes("nuoc ngoai") || norm.includes("kieu bao") || norm.includes("o my") || 
      norm.includes("o uc") || norm.includes("o duc") || norm.includes("canada") || 
      norm.includes("nhat ban") || norm.includes("dai loan") || norm.includes("lech mui gio") || 
      norm.includes("paypal") || norm.includes("the quoc te");

    if (isAbroadQuery) {
      appendBotMessage(BOT_DATA.answers.c_abroad_learn.text, BOT_DATA.answers.c_abroad_learn.cta);
      return;
    }

    // 0g. Hỗ trợ sau khóa học / đồng hành / hội chẩn ca khó
    const isSupportQuery = 
      norm.includes("sau khoa hoc") || norm.includes("sau khi hoc") || norm.includes("dong hanh") || 
      norm.includes("ho tro ca kho") || norm.includes("hoi chan ca kho") || norm.includes("ho tro sau") || 
      norm.includes("gap ca kho");

    if (isSupportQuery) {
      appendBotMessage(BOT_DATA.answers.c_post_course_support.text, BOT_DATA.answers.c_post_course_support.cta);
      return;
    }

    // 0h. Người mới bắt đầu / Chưa biết gì / Chưa từng học qua / Rất đam mê / Có học được không
    // Ví dụ câu hỏi: "Tôi chưa biết gì về môn này, chưa từng học qua, nhưng rất đam mê. Tôi theo học được không?"
    const isZeroBasePassion = 
      (norm.includes("chua biet") || norm.includes("chua tung hoc") || norm.includes("chua hoc qua") || 
       norm.includes("dam me") || norm.includes("theo hoc duoc khong") || norm.includes("hoc duoc khong") || 
       norm.includes("lam duoc khong") || norm.includes("nguoi moi") || norm.includes("chua co kien thuc") || 
       norm.includes("mat goc") || norm.includes("kho khong") || norm.includes("co kho khong")) &&
      !norm.includes("it tien") && !norm.includes("kinh phi") && !norm.includes("ngan sach") && !norm.includes("gia");

    if (isZeroBasePassion) {
      appendBotMessage(BOT_DATA.answers.c_zero_base_passion.text, BOT_DATA.answers.c_zero_base_passion.cta);
      return;
    }

    // ---------------------------------------------------------
    // A. NHÓM CHUYÊN KHOA Y HỌC & BỆNH HỌC (TỪ 351 BÀI BRAIN.DB)
    // ---------------------------------------------------------

    // 1. Cảnh báo đỏ / Chống chỉ định / Nguy hiểm / Cauda Equina
    if (
      norm.includes("red flag") || norm.includes("redflag") || norm.includes("canh bao do") || 
      norm.includes("chong chi dinh") || norm.includes("cam nan") || norm.includes("tai bien") || 
      norm.includes("nguy hiem") || norm.includes("chum duoi ngua") || norm.includes("cauda") || 
      norm.includes("tieu xuong") || norm.includes("ung thu") || norm.includes("gay xuong")
    ) {
      appendBotMessage(BOT_DATA.answers.c_redflags.text, BOT_DATA.answers.c_redflags.cta);
      return;
    }

    // 2. Tiếng kêu rắc / Cavitation / Khí hóa / Bọt khí
    if (
      norm.includes("tieng rac") || norm.includes("keu rac") || norm.includes("tieng keu") || 
      norm.includes("cavitation") || norm.includes("khi hoa") || norm.includes("bot khi") || 
      norm.includes("keu rom rop") || norm.includes("be rang rac") || norm.includes("gian day chang")
    ) {
      appendBotMessage(BOT_DATA.answers.c_cavitation.text, BOT_DATA.answers.c_cavitation.cta);
      return;
    }

    // 3. Khung chậu, Chân ngắn chân dài, Ilium PI / AS
    if (
      norm.includes("chan ngan") || norm.includes("chan dai") || norm.includes("lech chau") || 
      norm.includes("lech khung chau") || norm.includes("ilium pi") || norm.includes("ilium as") || 
      norm.includes("pi ilium") || norm.includes("as ilium") || norm.includes("sips") || 
      norm.includes("mao chau") || norm.includes("crista iliaca") || norm.includes("xuong chau")
    ) {
      appendBotMessage(BOT_DATA.answers.c_pelvis.text, BOT_DATA.answers.c_pelvis.cta);
      return;
    }

    // 4. Khớp cùng chậu (ISG / Sacroiliac)
    if (
      norm.includes("isg") || norm.includes("cung chau") || norm.includes("khop cung chau") || 
      norm.includes("sacroiliac") || norm.includes("mennell") || norm.includes("nghiem phap patrick") || 
      norm.includes("vorlauf") || norm.includes("dau mao chau")
    ) {
      appendBotMessage(BOT_DATA.answers.c_isg.text, BOT_DATA.answers.c_isg.cta);
      return;
    }

    // 5. Thoát vị đĩa đệm, Thần kinh tọa, Cơ hình lê, L4-L5, L5-S1
    if (
      norm.includes("thoat vi") || norm.includes("dia dem") || norm.includes("than kinh toa") || 
      norm.includes("l4") || norm.includes("l5") || norm.includes("s1") || 
      norm.includes("co hinh le") || norm.includes("piriformis") || norm.includes("lasegue") || 
      norm.includes("bragard") || norm.includes("dau lung")
    ) {
      appendBotMessage(BOT_DATA.answers.c_disc.text, BOT_DATA.answers.c_disc.cta);
      return;
    }

    // 6. Cột sống cổ C1 Atlas, C2 Axis, Đau đầu, Chóng mặt, Tiền đình
    if (
      norm.includes("c1") || norm.includes("atlas") || norm.includes("c2") || norm.includes("axis") || 
      norm.includes("dot doi") || norm.includes("dot truc") || norm.includes("dau dau") || 
      norm.includes("migraine") || norm.includes("chong mat") || norm.includes("tien dinh") || 
      norm.includes("mat ngu") || norm.includes("dong mach dot song") || norm.includes("de-kleyn") || 
      norm.includes("dekleyn") || norm.includes("hautant")
    ) {
      appendBotMessage(BOT_DATA.answers.c_c1_atlas.text, BOT_DATA.answers.c_c1_atlas.cta);
      return;
    }

    // 7. Khớp thái dương hàm TMG, TMJ, Khóa hàm, Kêu lục cục
    if (
      norm.includes("tmg") || norm.includes("tmj") || norm.includes("thai duong ham") || 
      norm.includes("khop ham") || norm.includes("ha mieng") || norm.includes("can lech") || 
      norm.includes("kiefersperre") || norm.includes("cung ham") || norm.includes("nhai lech")
    ) {
      appendBotMessage(BOT_DATA.answers.c_tmj.text, BOT_DATA.answers.c_tmj.cta);
      return;
    }

    // 8. Loãng xương, Người già, Lún đốt sống
    if (
      norm.includes("loang xuong") || norm.includes("osteoporos") || norm.includes("nguoi gia") || 
      norm.includes("nguoi lon tuoi") || norm.includes("lun dot song") || norm.includes("luc nen doc")
    ) {
      appendBotMessage(BOT_DATA.answers.c_osteoporosis.text, BOT_DATA.answers.c_osteoporosis.cta);
      return;
    }

    // 9. Khớp ngoại vi: Gối, Sụn chêm, Cổ chân, Lật sơ mi, Tennis Elbow, Cổ tay
    if (
      norm.includes("sun chem") || norm.includes("meniscus") || norm.includes("khop goi") || 
      norm.includes("lat so mi") || norm.includes("co chan") || norm.includes("xeng sen") || 
      norm.includes("talus") || norm.includes("tennis elbow") || norm.includes("ong co tay") || 
      norm.includes("carpal tunnel") || norm.includes("hallux valgus") || norm.includes("chan bet")
    ) {
      appendBotMessage(BOT_DATA.answers.c_extremity.text, BOT_DATA.answers.c_extremity.cta);
      return;
    }

    // 10. Đọc phim X-quang, Đo góc trượt, Ferguson
    if (
      norm.includes("x-quang") || norm.includes("xquang") || norm.includes("phim") || 
      norm.includes("xray") || norm.includes("mri") || norm.includes("doc phim") || 
      norm.includes("goc truot") || norm.includes("sacral base") || norm.includes("ferguson")
    ) {
      appendBotMessage(BOT_DATA.answers.c_xray.text, BOT_DATA.answers.c_xray.cta);
      return;
    }

    // 11. Kỹ thuật HVLA, Simon-Technik ngón cái, Recoil, Phát lực
    if (
      norm.includes("hvla") || norm.includes("simon-technik") || norm.includes("simon technik") || 
      norm.includes("ngon cai") || norm.includes("ngon tay cai") || norm.includes("recoil") || 
      norm.includes("shoulder drop") || norm.includes("phat luc")
    ) {
      appendBotMessage(BOT_DATA.answers.c_hvla_simon.text, BOT_DATA.answers.c_hvla_simon.cta);
      return;
    }

    // 12. Trẻ em, Trẻ sơ sinh, Hội chứng KISS, KIDD
    if (
      norm.includes("tre em") || norm.includes("tre so sinh") || norm.includes("em be") || 
      norm.includes("kiss") || norm.includes("kidd") || norm.includes("veo co bam sinh") || 
      norm.includes("khoc da de")
    ) {
      appendBotMessage(BOT_DATA.answers.c_pediatric.text, BOT_DATA.answers.c_pediatric.cta);
      return;
    }

    // ---------------------------------------------------------
    // B. NHÓM TUYỂN SINH, KHÓA HỌC & BÁN HÀNG CHUẨN Y ĐỨC
    // ---------------------------------------------------------

    // 13. Kinh phí ban đầu hạn chế / Ít tiền / Tiết kiệm ngân sách
    if (
      norm.includes("khong co qua nhieu tien") || norm.includes("khong co tien") || norm.includes("it tien") || 
      norm.includes("kinh phi") || norm.includes("ngan sach") || norm.includes("chua du tien") || 
      norm.includes("khong du tien") || norm.includes("tiet kiem")
    ) {
      appendBotMessage(BOT_DATA.answers.c_beginner_budget.text, BOT_DATA.answers.c_beginner_budget.cta);
      return;
    }

    // 14. Bệnh nhân tự hỏi tư vấn chữa bệnh cho bản thân hoặc người thân
    if (
      (norm.includes("toi bi") || norm.includes("em bi") || norm.includes("minh bi") || 
       norm.includes("nguoi nha bi") || norm.includes("kham o dau") || norm.includes("chi phi kham") || 
       norm.includes("chua duoc khong") || norm.includes("co tri duoc khong") || norm.includes("kham chua")) &&
      !norm.includes("khoa hoc") && !norm.includes("hoc online")
    ) {
      appendBotMessage(BOT_DATA.answers.c_patient_consult.text, BOT_DATA.answers.c_patient_consult.cta);
      return;
    }

    // 15. Thời gian học, lịch học, học bao lâu
    if (
      norm.includes("bao lau") || norm.includes("thoi gian") || norm.includes("may thang") || 
      norm.includes("may buoi") || norm.includes("lich hoc") || norm.includes("gio hoc") || 
      norm.includes("bao lau thi lam duoc") || norm.includes("co kip khong") || norm.includes("gioi han")
    ) {
      appendBotMessage(BOT_DATA.answers.c_schedule_duration.text, BOT_DATA.answers.c_schedule_duration.cta);
      return;
    }

    // 16. Địa điểm học: ở đâu, TP.HCM, Hà Nội, tỉnh xa
    if (
      norm.includes("o dau") || norm.includes("dia diem") || norm.includes("dia chi") || 
      norm.includes("tphcm") || norm.includes("sai gon") || norm.includes("ha noi") || 
      norm.includes("da nang") || norm.includes("o tinh") || norm.includes("o xa") || norm.includes("o nuoc ngoai")
    ) {
      appendBotMessage(BOT_DATA.answers.c_location.text, BOT_DATA.answers.c_location.cta);
      return;
    }

    // 17. Đầu ra nghề nghiệp, mở phòng khám, cơ hội việc làm, thu nhập
    if (
      norm.includes("dau ra") || norm.includes("phong kham") || norm.includes("mo tiem") || 
      norm.includes("kiem tien") || norm.includes("thu nhap") || norm.includes("co viec lam") || 
      norm.includes("co khach") || norm.includes("hanh nghe duoc khong") ||
      (norm.includes("mo") && (norm.includes("phong") || norm.includes("tiem") || norm.includes("co so")))
    ) {
      appendBotMessage(BOT_DATA.answers.c_career_outcome.text, BOT_DATA.answers.c_career_outcome.cta);
      return;
    }

    // 18. Thông tin về Bác sĩ Henrik Simon
    if (
      (norm.includes("henrik simon") && (norm.includes("la ai") || norm.includes("nuoc nao") || norm.includes("bac si") || norm.includes("thay"))) ||
      norm.includes("giang vien la ai")
    ) {
      appendBotMessage(BOT_DATA.answers.c_simon_bio.text, BOT_DATA.answers.c_simon_bio.cta);
      return;
    }

    // 19. Dụng cụ hỗ trợ, bàn nắn, drop table, activator
    if (
      norm.includes("ban nan") || norm.includes("dung cu") || norm.includes("drop table") || 
      norm.includes("activator") || norm.includes("thiet bi") || norm.includes("mua ban")
    ) {
      appendBotMessage(BOT_DATA.answers.c_table_equipment.text, BOT_DATA.answers.c_table_equipment.cta);
      return;
    }

    // 20. Khách muốn mua / đăng ký / học phí / chuyển khoản
    if (
      norm.includes("dang ky") || norm.includes("mua") || norm.includes("chot") || 
      norm.includes("chuyen khoan") || norm.includes("stk") || norm.includes("giu cho") || 
      norm.includes("uu dai")
    ) {
      appendBotMessage(BOT_DATA.answers.buy.text, BOT_DATA.answers.buy.cta);
      return;
    }

    // 21. Khách do dự / chưa mua / suy nghĩ thêm / đắt
    if (
      norm.includes("suy nghi") || norm.includes("chua mua") || norm.includes("ban voi") || 
      norm.includes("de sau") || norm.includes("tu tu") || norm.includes("chua co tien") || 
      norm.includes("can nhac")
    ) {
      appendBotMessage(BOT_DATA.answers.hesitate.text, BOT_DATA.answers.hesitate.cta);
      return;
    }

    // 22. Khách hỏi online có làm được không / run tay
    if (
      norm.includes("online") || norm.includes("run tay") || norm.includes("video") || 
      norm.includes("thuc hanh") || norm.includes("qua mang") || norm.includes("micro-drill")
    ) {
      appendBotMessage(BOT_DATA.answers.q1.text, BOT_DATA.answers.q1.cta);
      return;
    }

    // 23. Khách hỏi PT / Spa / tay ngang / chưa học Y
    if (
      norm.includes("pt") || norm.includes("gym") || norm.includes("spa") || 
      norm.includes("tay ngang") || norm.includes("chua hoc y") || norm.includes("yoga") || 
      norm.includes("massage")
    ) {
      appendBotMessage(BOT_DATA.answers.q2.text, BOT_DATA.answers.q2.cta);
      return;
    }

    // 23b. Khách hỏi danh sách các khóa học / bảng giá / học phí bao nhiêu (2 tin nhắn tự động)
    const isCourseListAndPricing = 
      norm.includes("khoa hoc gi") || norm.includes("cac khoa hoc") || norm.includes("nhung khoa hoc") ||
      norm.includes("co nhung khoa") || norm.includes("co cac khoa") || norm.includes("co khoa hoc nao") ||
      norm.includes("danh sach khoa") || norm.includes("cac goi hoc") || norm.includes("cac lop hoc") ||
      norm.includes("bang gia") || norm.includes("gia ca") || norm.includes("gia bao nhieu") ||
      norm.includes("hoc phi bao nhieu") || norm.includes("bao nhieu tien") ||
      norm.includes("chi phi khoa hoc") || norm.includes("gia khoa hoc") ||
      (norm.includes("khoa hoc") && (norm.includes("gia") || norm.includes("hoc phi") || norm.includes("bao nhieu") || norm.includes("chi phi"))) ||
      (norm.includes("co") && norm.includes("khoa") && (norm.includes("gi") || norm.includes("nao"))) ||
      (norm.includes("gia") && norm.includes("bao nhieu")) ||
      (norm.includes("hoc phi") && !norm.includes("dat") && !norm.includes("mac") && !norm.includes("cao")) ||
      (norm.includes("chi phi") && !norm.includes("kham") && !norm.includes("chua"));

    if (isCourseListAndPricing) {
      sendCourseListAndPricingSequence();
      return;
    }

    // 24. Khách so sánh giá / học phí sao đắt / lý do giá trị
    if (
      norm.includes("sao dat") || norm.includes("dat the") || norm.includes("mac the") || 
      norm.includes("dat qua") || norm.includes("mac qua") || norm.includes("gia cao") || 
      norm.includes("hoc phi cao") || norm.includes("sao lai dat") || norm.includes("2-3 ngay") || 
      norm.includes("so sanh gia") || norm.includes("dat hon")
    ) {
      appendBotMessage(BOT_DATA.answers.q3.text, BOT_DATA.answers.q3.cta);
      return;
    }

    // 25. Khách hỏi chứng chỉ / pháp lý / bằng cấp
    if (
      norm.includes("chung chi") || norm.includes("bang") || norm.includes("phap ly") || 
      norm.includes("hanh nghe") || norm.includes("giay phep") || norm.includes("so y te")
    ) {
      appendBotMessage(BOT_DATA.answers.q5.text, BOT_DATA.answers.q5.cta);
      return;
    }

    // 26. Khách hỏi khấu trừ lên Offline
    if (
      norm.includes("khau tru") || norm.includes("offline") || norm.includes("tru tien") || 
      norm.includes("hoc tiep")
    ) {
      appendBotMessage(BOT_DATA.answers.q6.text, BOT_DATA.answers.q6.cta);
      return;
    }

    // 27. Khác gì bẻ khớp thông thường / tiktok
    if (
      norm.includes("khac gi") || norm.includes("be khop") || norm.includes("tiktok") || 
      norm.includes("thong thuong") || norm.includes("chuyen biet")
    ) {
      appendBotMessage(BOT_DATA.answers.q7.text, BOT_DATA.answers.q7.cta);
      return;
    }

    // 28. Nữ nhỏ con / sức yếu / khách nam to béo
    if (
      norm.includes("nu") || norm.includes("nho con") || norm.includes("suc") || 
      norm.includes("yeu") || norm.includes("to beo") || norm.includes("80kg") || 
      norm.includes("90kg")
    ) {
      appendBotMessage(BOT_DATA.answers.q8.text, BOT_DATA.answers.q8.cta);
      return;
    }

    // 29. Trả góp
    if (
      norm.includes("tra gop") || norm.includes("the tin dung") || norm.includes("chia nho")
    ) {
      appendBotMessage(BOT_DATA.answers.q9.text, BOT_DATA.answers.q9.cta);
      return;
    }

    // ---------------------------------------------------------
    // C. BỘ XỬ LÝ LINH HOẠT THÔNG MINH KHI NGOÀI CÁC TỪ KHÓA CỐ ĐỊNH
    // ---------------------------------------------------------

    // Ngữ cảnh 1: Chào hỏi thân mật
    if (
      norm === "chao" || norm === "hello" || norm === "hi" || norm === "alo" || 
      norm.includes("chao ad") || norm.includes("chao em") || norm.includes("chao ban") || 
      norm.includes("xin chao") || norm === "ad" || norm === "ad oi"
    ) {
      if (currentCategory === "course") {
        appendBotMessage(
          `Dạ em chào anh/chị ạ! Rất vui được đón tiếp anh/chị tại Simon Center.<br><br>
Em đang sẵn sàng tư vấn chi tiết về <strong>Chương Trình Đào Tạo Chiropractic Chuẩn Y Khoa</strong> của Bác sĩ Henrik Simon.<br><br>
Anh/chị có thể trao đổi bất kỳ thông tin nào: <em>lộ trình cho người mới từ số 0, học từng module lẻ (lưng - chậu 1tr, cổ gáy 1tr), trọn bộ Online toàn diện 12.9tr, lớp thực hành Offline Cầm tay chỉ việc hay bài giảng mẫu học thử miễn phí</em>.<br><br>
Dạ anh/chị đang muốn bắt đầu từ nội dung nào hay đang quan tâm nắn chỉnh cho vùng cột sống nào vậy ạ? Anh/chị cứ nhắn tự nhiên cho em nhé ạ!`,
          "trial"
        );
      } else {
        appendBotMessage(
          `Dạ em chào anh/chị ạ! Rất vui được đón tiếp anh/chị tại Simon Center.<br><br>
Em là Trợ lý Chuyên môn hỗ trợ <strong>Hội Chẩn & Bệnh Học Cột Sống</strong> cùng Bác sĩ Henrik Simon.<br><br>
Anh/chị có thể trao đổi cùng em về các ca lâm sàng thực tế: <em>phân tích phim X-quang, thoát vị đĩa đệm, đau thần kinh tọa, kẹt khớp cùng chậu ISG, khớp thái dương hàm hay ranh giới Cảnh báo đỏ (Red Flags)</em>.<br><br>
Dạ ca bệnh của anh/chị đang có triệu chứng hoặc kết quả chẩn đoán hình ảnh như thế nào ạ? Anh/chị chia sẻ chi tiết để em cùng hội chẩn nhé ạ!`,
          "register"
        );
      }
      return;
    }

    // Ngữ cảnh 2: Có liên quan đến học tập / khóa học / đào tạo
    if (
      norm.includes("hoc") || norm.includes("khoa") || norm.includes("dao tao") || 
      norm.includes("video") || norm.includes("lop") || norm.includes("huong dan") || 
      norm.includes("giang day") || norm.includes("ky nang") || norm.includes("bai giang")
    ) {
      appendBotMessage(
        `Dạ em chào anh/chị ạ! Về chương trình đào tạo của Bác sĩ Henrik Simon tại Simon Center:<br><br>
• Khóa học được thiết kế chuẩn Y khoa Quốc tế kế thừa từ Viện DISC (Đức), hướng dẫn bài bản từ giải phẫu cơ sinh học đến kỹ thuật nắn chỉnh thực chiến qua <strong>hệ thống video với các góc quay khác nhau</strong> kết hợp quay cận cảnh góc khóa khớp.<br>
• Dù anh/chị xuất phát điểm từ con số 0 hay đã là kỹ thuật viên vật lý trị liệu/HLV Gym, phương pháp Micro-drills của Thầy sẽ giúp anh/chị định hình phản xạ chuẩn xác và tự tin thực hành an toàn.<br><br>
🎁 Để anh/chị trải nghiệm thực tế phương pháp giảng dạy, em xin gửi tặng anh/chị <strong>1 Bài giảng mẫu với các góc quay khác nhau hoàn toàn miễn phí</strong>. Anh/chị bấm nút bên dưới để nhận ngay nhé ạ!`,
        "trial"
      );
      return;
    }

    // Ngữ cảnh 3: Có liên quan đến triệu chứng đau / bệnh lý
    if (
      norm.includes("dau") || norm.includes("moi") || norm.includes("benh") || 
      norm.includes("cot song") || norm.includes("khop") || norm.includes("te") || 
      norm.includes("co") || norm.includes("nhuc") || norm.includes("xuong") || norm.includes("gay")
    ) {
      appendBotMessage(
        `Dạ em rất đồng cảm với triệu chứng khó chịu mà anh/chị đang gặp phải ạ!<br><br>
Trong Trị liệu Thần kinh Cột sống Chiropractic, hầu hết các cơn đau hay tê bì đều bắt nguồn từ <strong>sai lệch trục cơ sinh học hoặc chèn ép rễ thần kinh cục bộ</strong>.<br><br>
🩺 Để đảm bảo an toàn tuyệt đối:<br>
1. Tuyệt đối không tự ý vặn bẻ khớp thô bạo khi chưa xác định rõ nguyên nhân.<br>
2. Anh/chị có thể chụp và gửi hình ảnh phim X-quang hoặc MRI (nếu có) qua Zalo <strong>0389.609.938</strong> để Bác sĩ Henrik Simon và đội ngũ chuyên môn Simon Center hỗ trợ đọc phim và hội chẩn phân tích miễn phí giúp anh/chị nhé ạ!`,
        "register"
      );
      return;
    }

    // Ngữ cảnh 4: Câu hỏi mở khác - Trả lời theo đúng ngữ cảnh tab đã chọn
    if (currentCategory === "course") {
      appendBotMessage(
        `Dạ em rất hiểu và trân trọng câu hỏi này của anh/chị ạ!<br><br>
Về chương trình đào tạo Chiropractic của Bác sĩ Henrik Simon, trung tâm luôn có các giải pháp học tập linh hoạt sát nhất với nhu cầu thực tế của từng học viên (từ học lẻ từng phần thắt lưng / cổ gáy 1 triệu đến khóa toàn diện Online hoặc lớp thực hành Offline Cầm tay chỉ việc).<br><br>
Để em hỗ trợ chu đáo và chính xác nhất, anh/chị có thể chia sẻ thêm: Hiện tại anh/chị đang muốn học để tự chăm sóc gia đình, bổ trợ công việc PT/Spa hay phát triển chuyên sâu mở cơ sở trị liệu vậy ạ?`,
        "trial"
      );
    } else {
      appendBotMessage(
        `Dạ em rất hiểu và trân trọng câu hỏi chuyên môn này của anh/chị ạ!<br><br>
Trong Trị liệu Thần kinh Cột sống Chiropractic, mỗi tình trạng đau hay triệu chứng lâm sàng đều gắn liền với cơ chế cơ sinh học và ranh giới an toàn riêng biệt.<br><br>
Để Thầy Henrik Simon và đội ngũ y khoa có thể tư vấn chuẩn xác nhất cho ca bệnh này: Cơn đau xuất hiện bao lâu rồi và có kèm theo tê buốt lan xuống tay hay chân không ạ? Nếu anh/chị đã có kết quả chụp X-quang hoặc MRI, anh/chị có thể gửi qua Zalo <strong>0389.609.938</strong> để Bác sĩ hỗ trợ phân tích chi tiết nhé ạ!`,
        "register"
      );
    }
  }

  function showTypingIndicator(callback, customInitialText = null) {
    const messagesContainer = document.getElementById("chiroChatMessages");
    if (!messagesContainer) {
      if (typeof callback === "function") callback();
      return;
    }

    // Xóa indicator cũ nếu còn
    const oldIndicator = document.getElementById("chiroTypingIndicator");
    if (oldIndicator) oldIndicator.remove();

    const typingDiv = document.createElement("div");
    typingDiv.id = "chiroTypingIndicator";
    typingDiv.className = "flex items-center space-x-2 text-xs py-1 transition-all duration-300";
    typingDiv.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-brand-wine text-amber-300 font-extrabold flex items-center justify-center text-[10px] shrink-0 shadow border border-amber-300/40">SC</div>
      <div class="bg-amber-50/90 border border-amber-200/80 px-3.5 py-2 rounded-2xl rounded-tl-xs flex items-center space-x-2 shadow-xs">
        <div class="flex items-center space-x-1">
          <span class="w-2 h-2 bg-brand-crimson rounded-full animate-bounce" style="animation-delay: 0s"></span>
          <span class="w-2 h-2 bg-brand-crimson rounded-full animate-bounce" style="animation-delay: 0.18s"></span>
          <span class="w-2 h-2 bg-brand-crimson rounded-full animate-bounce" style="animation-delay: 0.36s"></span>
        </div>
        <span id="chiroThinkingText" class="text-[11px] font-semibold text-brand-crimson animate-pulse ml-1">${customInitialText || "💭 Đang phân tích tình trạng & đối chiếu giải phẫu..."}</span>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const thinkingLabel = document.getElementById("chiroThinkingText");

    // Nếu là chế độ gọi AI (có customInitialText), gọi callback ngay và truyền hàm gỡ bỏ indicator
    if (customInitialText) {
      if (typeof callback === "function") {
        callback(() => {
          if (typingDiv && typingDiv.parentNode) typingDiv.remove();
        });
      }
      return;
    }

    // Giai đoạn 1: Đang phân tích cơ chế giải phẫu (700ms)
    setTimeout(() => {
      if (thinkingLabel) {
        thinkingLabel.innerText = "🧠 Đang tra cứu phác đồ cơ sinh học cùng Thầy Henrik Simon...";
      }
    }, 700);

    // Giai đoạn 2: Đang soạn câu trả lời (sau 1450ms)
    setTimeout(() => {
      if (thinkingLabel) {
        thinkingLabel.innerText = "✍️ Simon Center đang soạn câu trả lời...";
      }
    }, 1450);

    // Thời gian suy nghĩ tự nhiên giống ChatGPT (1.8s - 2.2s)
    const thinkingTime = Math.floor(Math.random() * 300) + 1850;
    setTimeout(() => {
      if (typingDiv && typingDiv.parentNode) typingDiv.remove();
      if (typeof callback === "function") callback();
    }, thinkingTime);
  }

  // Indicator gõ phím ngắn tự nhiên giữa 2 tin nhắn liên tiếp (~1.2s)
  function showShortTypingIndicator(callback, text = "✍️ Simon Center đang soạn thêm thông tin...") {
    const messagesContainer = document.getElementById("chiroChatMessages");
    if (!messagesContainer) {
      if (typeof callback === "function") callback();
      return;
    }

    const oldIndicator = document.getElementById("chiroTypingIndicator");
    if (oldIndicator) oldIndicator.remove();

    const typingDiv = document.createElement("div");
    typingDiv.id = "chiroTypingIndicator";
    typingDiv.className = "flex items-center space-x-2 text-xs py-1 transition-all duration-300";
    typingDiv.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-brand-wine text-amber-300 font-extrabold flex items-center justify-center text-[10px] shrink-0 shadow border border-amber-300/40">SC</div>
      <div class="bg-amber-50/90 border border-amber-200/80 px-3.5 py-2 rounded-2xl rounded-tl-xs flex items-center space-x-2 shadow-xs">
        <div class="flex items-center space-x-1">
          <span class="w-2 h-2 bg-brand-crimson rounded-full animate-bounce" style="animation-delay: 0s"></span>
          <span class="w-2 h-2 bg-brand-crimson rounded-full animate-bounce" style="animation-delay: 0.18s"></span>
          <span class="w-2 h-2 bg-brand-crimson rounded-full animate-bounce" style="animation-delay: 0.36s"></span>
        </div>
        <span class="text-[11px] font-semibold text-brand-crimson animate-pulse ml-1">${text}</span>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    setTimeout(() => {
      if (typingDiv && typingDiv.parentNode) typingDiv.remove();
      if (typeof callback === "function") callback();
    }, 1250);
  }

  // Cuộn mượt đến Form đăng ký
  window.scrollToRegisterForm = function (actionType = "register") {
    const targetForm = document.getElementById("register-form");
    if (targetForm) {
      window.toggleChiroChat();
      targetForm.scrollIntoView({ behavior: "smooth", block: "start" });
      
      const formBox = targetForm.querySelector(".bg-brand-slate") || targetForm;
      formBox.style.transition = "all 0.4s ease";
      formBox.style.boxShadow = "0 0 0 4px rgba(143, 29, 53, 0.4)";
      setTimeout(() => {
        formBox.style.boxShadow = "";
      }, 2500);

      setTimeout(() => {
        const nameInput = document.getElementById("regName");
        if (nameInput) nameInput.focus();
      }, 600);
    } else {
      window.location.href = "index.html#register-form";
    }
  };

  window.clearChiroChat = function () {
    chatHistory = [];
    const container = document.getElementById("chiroChatMessages");
    if (container) container.innerHTML = "";
    initGreeting();
  };

  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectChatbot);
  } else {
    injectChatbot();
  }
})();
