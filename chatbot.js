/**
 * SIMON CENTER CHIROPRACTIC CHATBOT v2.0
 * Tích hợp Kịch bản bán hàng chuẩn Y đức & Động cơ Tra cứu Chuyên khoa Chiropractic
 * Dựa trên 351 bài Y khoa chuyên sâu của Thầy Henrik Simon trong brain.db
 */

(function () {
  if (window.ChiroChatbotLoaded) return;
  window.ChiroChatbotLoaded = true;

  // =============================================================================
  // 📝 HỆ THỐNG DỮ LIỆU CHATBOT (BOT_DATA):
  // 1. Gồm 2 nhóm: 'course' (Khóa học & Tuyển sinh) và 'clinical' (Chuyên khoa Y học)
  // 2. Tự động nhận diện từ khóa chuyên môn sâu từ 351 bài kiến thức brain.db
  // =============================================================================
  const BOT_DATA = {
    greeting: `Dạ em chào anh/chị ạ! Cảm ơn anh/chị đã ghé thăm <strong>Simon Center</strong>.<br><br>Em là Trợ lý Chuyên môn Simon Center. Em có thể hỗ trợ anh/chị cả 2 mảng:<br>
• 🎓 <strong>Tư vấn các Khóa đào tạo Nắn chỉnh Cột sống Chuẩn Y khoa</strong> (Học phí, lộ trình E-Learning, lớp Offline cầm tay chỉ việc cùng Bác sĩ Henrik Simon).<br>
• 🩺 <strong>Giải đáp Kiến thức Chuyên khoa Chiropractic</strong> (Cảnh báo đỏ Red Flags, đọc phim X-quang, lệch chậu chân ngắn chân dài, thoát vị đĩa đệm, khớp cùng chậu ISG, khớp cắn hàm TMG, kỹ thuật ngón cái...).<br><br>
Anh/chị có thể chọn nhanh các chủ đề bên dưới hoặc gõ trực tiếp câu hỏi để em giải đáp nhé ạ!`,

    // DANH MỤC CÂU HỎI NHANH THEO 2 TAB
    categories: {
      course: {
        label: "🎓 Khóa Học (10)",
        questions: [
          { id: "q1", text: "🎓 Học online liệu có làm được thật không?" },
          { id: "q2", text: "🩺 PT Gym / Spa / chưa học Y có học được không?" },
          { id: "q3", text: "💰 Sao học phí 14.9tr cao hơn lớp 2-3 ngày?" },
          { id: "q4", text: "📊 Khóa học có dạy đọc phim X-quang không?" },
          { id: "q5", text: "📜 Chứng chỉ hoàn thành & Pháp lý hành nghề" },
          { id: "q6", text: "🤝 Mua khóa Online sau lên Offline có được trừ tiền?" },
          { id: "q7", text: "🔥 Nắn Specific chuyên biệt khác gì bẻ khớp thông thường?" },
          { id: "q8", text: "💪 Nữ nhỏ con có nắn được khách nam 90kg không?" },
          { id: "q9", text: "💳 Có chính sách trả góp qua thẻ tín dụng không?" },
          { id: "buy", text: "⚡ Đăng ký khóa học / Nhận ưu đãi ngay" }
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
      // --- NHÓM 1: TUYỂN SINH & KHÓA HỌC (TỪ SALES SCRIPT) ---
      q1: {
        text: `Dạ em rất hiểu nỗi băn khoăn này của anh/chị ạ! Nắn chỉnh là môn thực hành trực tiếp, nên nếu chỉ xem video lý thuyết thụ động thì chắc chắn không ai dám làm cả.<br><br>Khóa học tại Simon Center được Thầy Henrik Simon thiết kế theo <strong>Quy trình sư phạm 3 bước chuẩn y khoa</strong> để giải quyết triệt để rào cản này:<br><br>
1. <strong>Video 4K góc nhìn người nắn (POV):</strong> Camera đặt đúng tầm mắt người đứng nắn, zoom sát từng milimet điểm tiếp xúc xương, góc khóa khớp và hướng phát lực.<br>
2. <strong>Phương pháp Micro-drills rèn lực tại nhà:</strong> Rèn luyện tốc độ, bộ pháp và lực rơi cơ thể trên đệm mút/bóng phản xạ. Tay anh/chị có phản xạ tự nhiên chuẩn xác trước khi chạm người thật nên <strong>hoàn toàn không bị run tay</strong>.<br>
3. <strong>Hệ thống Test lâm sàng qua môn bắt buộc:</strong> Nắm chắc chỉ định và dấu hiệu nguy hiểm (Red Flags) mới mở khóa bài tiếp theo.<br><br>
<em>Đặc biệt: Toàn bộ 14.9 triệu tiền khóa Online sẽ được <strong>khấu trừ 100%</strong> khi anh/chị đăng ký lên khóa Offline 4 ngày Cầm tay chỉ việc cùng Thầy Henrik Simon nhé ạ!</em>`,
        cta: "register"
      },
      q2: {
        text: `Dạ anh/chị hoàn toàn yên tâm nhé ạ! Thực tế hơn 40% học viên xuất sắc tại Simon Center là Huấn luyện viên PT Gym, HLV Yoga và các anh chị chủ Spa.<br><br>
Triết lý đào tạo của Thầy Henrik Simon là <strong>"Dễ hiểu nhưng phải chuẩn"</strong>:<br>
• Mọi thuật ngữ giải phẫu phức tạp đều được chuyển hóa thành mô hình 3D trực quan và bài tập mô phỏng đời thường.<br>
• Anh/chị hiểu rõ bản chất vì sao khớp kẹt và cách mở khớp bằng đòn bẩy tự nhiên mà không cần học vẹt sách y khoa.<br><br>
Kiến thức này giúp anh/chị nâng tầm gói dịch vụ chỉnh tư thế (Posture Alignment), giải phóng khớp cổ chân, khớp háng, tăng hiệu quả và giá trị buổi trị liệu mình làm cho khách lên rất nhiều nhé ạ!`,
        cta: "register"
      },
      q3: {
        text: `Dạ em rất hiểu khi mới tìm hiểu, học phí chắc chắn là điều anh/chị cân nhắc kỹ lưỡng đầu tiên ạ.<br><br>
Nhưng khi bước vào điều trị thực tế, các anh chị học viên đều nhận ra: Một khóa học ngắn ngày giá rẻ thường chỉ dạy vài ba thao tác bẻ khớp theo cảm tính, không dạy đọc phim X-quang và không dạy Cảnh báo đỏ (Red Flags).<br><br>
Trong ngành y, <strong>rủi ro lớn nhất không phải là học phí đắt hay rẻ, mà là lỡ tay nắn sai vào một ca chống chỉ định</strong> (rách bao xơ đĩa đệm, loãng xương nặng hay thiểu năng tuần hoàn não) thì hậu quả về sức khỏe người bệnh và uy tín cả đời không gì bù đắp được.<br><br>
Khóa học Simon Center bảo vệ anh/chị an toàn 100%. Về kinh tế, sau khi học xong anh/chị chỉ cần tiếp nhận <strong>5–6 bệnh nhân</strong> tại phòng khám là đã thu hồi hoàn toàn 14.9 triệu, nhưng tay nghề chuẩn y khoa thì theo anh/chị trọn đời nhé ạ!`,
        cta: "register"
      },
      q4: {
        text: `Dạ có dạy rất kỹ từ con số 0 anh nhé ạ! Đây chính là điểm khác biệt tự hào nhất của Simon Center.<br><br>
Khóa học hướng dẫn anh chi tiết:<br>
• Cách đọc các mốc giải phẫu trên phim chụp cột sống thẳng và nghiêng.<br>
• Đo đạc độ nghiêng xương cùng, độ lệch trục xương chậu (AP Pelvis View) chuẩn xác từng milimet.<br>
• Nhận diện thoái hóa, trượt đốt sống, gai xương và các bệnh lý nguy hiểm cấm nắn.<br><br>
🎁 <em>Đặc biệt: Khi đăng ký đợt này, anh được tặng kèm trọn bộ <strong>Cẩm nang phân tích phim X-quang cơ sinh học</strong> độc quyền biên soạn bằng tiếng Việt ạ.</em>`,
        cta: "register"
      },
      q5: {
        text: `Dạ sau khi hoàn thành các bài giảng và vượt qua bài test cuối khóa, anh/chị sẽ được cấp <strong>Chứng Chỉ Hoàn Thành (Certificate of Completion)</strong> có chữ ký xác nhận trực tiếp của Bác sĩ Henrik Simon, chứng nhận hoàn thành chương trình đào tạo chuẩn y khoa quốc tế kế thừa từ Viện DISC ạ.<br><br>
<em>Về mặt pháp lý minh bạch:</em> Khóa học cung cấp tri thức khoa học và nâng cao tay nghề thực hành để ứng dụng chăm sóc sức khỏe, phục hồi chức năng vận động. Còn để mở phòng khám chữa bệnh độc lập tại Việt Nam, người hành nghề cần tuân thủ đầy đủ quy định của Bộ Y tế về Giấy phép hành nghề y tế theo luật định nhé ạ.`,
        cta: "register"
      },
      q6: {
        text: `Dạ <strong>ĐƯỢC KHẤU TRỪ 100%</strong> anh nhé ạ! Đây là chính sách cực kỳ nhân văn và ưu đãi độc quyền của Simon Center.<br><br>
Toàn bộ số tiền 14.9 triệu anh đã thanh toán cho khóa Online sẽ được <strong>khấu trừ 100% vào học phí khóa Offline Cầm tay chỉ việc 4 ngày cùng Thầy Henrik Simon (40.000.000đ)</strong>.<br><br>
Khoản đầu tư hôm nay không hề mất đi mà là bước đệm hoàn hảo: Anh học vững lý thuyết và phản xạ trước, khi bước vào lớp thực hành cùng Thầy Henrik sẽ tiến bộ nhanh gấp 3 lần so với người chưa học qua online đấy ạ!`,
        cta: "register"
      },
      q7: {
        text: `Dạ khác biệt nằm ở 2 chữ <strong>"Chuyên Biệt (Specific)"</strong> và <strong>"An Toàn"</strong> anh nhé ạ:<br><br>
• <strong>Bẻ khớp thông thường / Clip mạng:</strong> Vặn xoắn thô bạo toàn thân để tạo tiếng kêu rôm rốp cho đã tai. Âm thanh đó chỉ là bọt khí bao khớp thoát ra, bẻ thô bạo rất dễ làm dãn dây chằng bao khớp và rách bao xơ đĩa đệm.<br>
• <strong>Specific Chiropractic chuyên biệt:</strong> Phân tích tìm đúng <strong>đốt sai lệch nguyên phát (Primary Subluxation)</strong> — chỉ nắn đốt kẹt, tuyệt đối không nắn vào đốt lỏng bù trừ. Kỹ thuật HVLA vận tốc cao biên độ nhỏ êm ái, bệnh nhân chưa kịp sợ thì khớp đã mở ra nhẹ nhõm, không hề gây đau đớn ạ!`,
        cta: "register"
      },
      q8: {
        text: `Dạ chị hoàn toàn yên tâm nhé ạ! Rất nhiều học viên nữ nhỏ nhắn 45kg tại Simon Center hiện đang nắn chỉnh rất mượt mà cho các khách hàng nam to béo 80–90kg.<br><br>
Bản chất của Chiropractic chuẩn y khoa là <strong>khoa học của tốc độ và trọng lực rơi cơ thể (F = m · a)</strong>, hoàn toàn không dùng sức bắp tay.<br><br>
Thầy Henrik sẽ dạy chị cách khóa góc khớp (Pre-tension) và thả rơi trọng lượng cơ thể (Body Drop) trong một phần mười giây. Chị nắn 10 ca liên tục mỗi ngày vẫn thấy cơ thể nhẹ nhàng, hai cánh tay hoàn toàn thả lỏng và không hề tốn sức đâu ạ!`,
        cta: "register"
      },
      q9: {
        text: `Dạ bên em CÓ hỗ trợ phương án <strong>thanh toán trả góp linh hoạt qua thẻ tín dụng</strong> kỳ hạn 3, 6, 9 hoặc 12 tháng anh nhé ạ.<br><br>
Tính ra mỗi tháng anh chỉ cần thanh toán khoảng hơn 1 triệu đồng — tương đương thu nhập từ 2 ca nắn chỉnh tại phòng khám, rất nhẹ nhàng về dòng tiền.<br><br>
Ngay khi kích hoạt, anh được cấp tài khoản học trọn đời và nhận trọn bộ cẩm nang X-quang ngay lập tức. Anh nhắn Zalo hoặc để lại thông tin để em hỗ trợ kiểm tra biểu phí ưu đãi nhất cho anh nhé ạ!`,
        cta: "register"
      },
      buy: {
        text: `Dạ tuyệt vời quá ạ! Tài khoản học được kích hoạt tự động ngay sau khi đăng ký anh/chị nhé ạ.<br><br>
Hiện tại khóa <strong>The Full Online Collection đang được áp dụng mức học phí ưu đãi 14.900.000đ</strong> (bao gồm toàn bộ video 4K POV trọn đời, hệ thống Micro-drills, bài Test qua môn và tặng kèm Cẩm nang đọc phim X-quang).<br><br>
Anh/chị bấm nút bên dưới để chuyển ngay đến Form đăng ký giữ suất ưu đãi đợt này nhé ạ:`,
        cta: "register_now"
      },
      hesitate: {
        text: `Dạ em hoàn toàn hiểu ạ! Quyết định đầu tư một khóa học chuyên môn sâu thì việc cân nhắc thấu đáo là rất cần thiết.<br><br>
Để anh/chị có cái nhìn thực tế nhất về bài giảng của Thầy Henrik Simon, em xin phép gửi tặng anh/chị <strong>1 Suất Học Thử Bài Giảng Mẫu 4K POV</strong> hoàn toàn miễn phí nhé ạ.<br><br>
Anh/chị bấm nút bên dưới để chuyển đến form nhận bài giảng mẫu qua Zalo/Email, đồng thời hệ thống sẽ <strong>tự động bảo lưu mức học phí ưu đãi 14.9 triệu</strong> cho anh/chị mà không sợ bị tăng giá về sau ạ:`,
        cta: "trial"
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
<em>💡 Nắm vững Red Flags giúp bạn tự tin từ chối đúng lúc, chuyển viện đúng ca và hành nghề an toàn 100% trọn đời!</em>`,
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
• Specific Chiropractic chỉ cần mở đúng đốt kẹt (Fixation) bằng lực vi tế, không chạy theo tiếng kêu rôm rốp!`,
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
Trong giáo trình Henrik Simon, bạn sẽ học cách dùng kỹ thuật nằm nghiêng (Side-lying Pelvis drop) hoặc kỹ thuật nằm sấp tiếp xúc ụ ngồi (Tuber ischiadicum) để đưa chậu về trung tính. Chiều dài 2 chân sẽ <strong>cân bằng ngay lập tức sau 1 buổi</strong>!`,
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
<em>Thầy Henrik Simon dạy kỹ thuật nắn chỉnh giải phóng ISG bằng lực rơi đòn bẩy chỉ mất 3 giây là giải tỏa cơn đau tức thì!</em>`,
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
💡 <strong>Lưu ý nắn chỉnh:</strong> Tuyệt đối không nắn vặn xoắn thô bạo vào đĩa đệm đang rách cấp. Simon Center dạy kỹ thuật giải áp rễ thần kinh tự nhiên và nắn các đốt lân cận để chuyển tải trọng lực an toàn!`,
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
        <div class="flex items-center space-x-1">
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

      <!-- THANH CHUYỂN TAB CHỦ ĐỀ GỢI Ý (KHÓA HỌC / CHUYÊN KHOA) -->
      <div class="px-2.5 pt-2 pb-1 bg-white border-t border-gray-200 flex items-center justify-between gap-1 shrink-0">
        <span class="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Chủ đề:</span>
        <div class="flex items-center gap-1">
          <button type="button" id="tabBtnCourse" onclick="window.switchChiroCategory('course')" 
            class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-brand-crimson text-white shadow-xs">
            🎓 Khóa Học (10)
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
    appendBotMessage(BOT_DATA.greeting);
    renderQuickChips();
  }

  window.switchChiroCategory = function (cat) {
    currentCategory = cat;
    const btnCourse = document.getElementById("tabBtnCourse");
    const btnClinical = document.getElementById("tabBtnClinical");

    if (cat === "course") {
      btnCourse.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-brand-crimson text-white shadow-xs";
      btnClinical.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 border border-gray-200";
    } else {
      btnClinical.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-brand-crimson text-white shadow-xs";
      btnCourse.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 border border-gray-200";
    }

    renderQuickChips();
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
      const ans = BOT_DATA.answers[id];
      if (ans) {
        appendBotMessage(ans.text, ans.cta);
      } else {
        appendBotMessage(`Dạ chuyên viên Simon Center đã nhận được thông tin câu hỏi của anh/chị. Anh/chị có thể để lại số điện thoại hoặc nhấn nút bên dưới để chuyên viên tư vấn chi tiết nhé ạ!`, "register");
      }
    });
  }

  function appendBotMessage(htmlContent, ctaType = null) {
    chatHistory.push({ sender: "bot", text: htmlContent, cta: ctaType });
    const messagesContainer = document.getElementById("chiroChatMessages");
    if (!messagesContainer) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = "flex items-start space-x-2 text-xs leading-relaxed max-w-[94%]";
    
    let ctaHtml = "";
    if (ctaType === "register" || ctaType === "register_now") {
      ctaHtml = `
        <div class="mt-3 pt-2.5 border-t border-amber-200/60 space-y-1.5">
          <button onclick="window.scrollToRegisterForm('buy')" class="chiro-cta-btn w-full text-white text-xs font-bold py-2 px-3 rounded-xl shadow flex items-center justify-center space-x-1.5">
            <span>👉 Xem Học Phí / Giữ Suất Ưu Đãi (14.9Tr)</span>
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
          <a href="tel:0389609938" class="block text-center text-[11px] text-gray-500 hover:text-brand-crimson font-medium pt-0.5">
            Hotline Hỗ Trợ 24/7: 0389.609.938
          </a>
        </div>
      `;
    }

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

    // FIX LỖI CUỘN: Cuộn mượt đến đầu của tin nhắn mới
    setTimeout(() => {
      try {
        const topTarget = msgDiv.offsetTop - 8;
        messagesContainer.scrollTo({
          top: Math.max(0, topTarget),
          behavior: "smooth"
        });
      } catch (err) {
        msgDiv.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
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

  window.handleChiroSend = function (e) {
    e.preventDefault();
    const input = document.getElementById("chiroChatInput");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    appendUserMessage(text);
    input.value = "";

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

    // 13. Khách muốn mua / đăng ký / học phí / chuyển khoản
    if (
      norm.includes("dang ky") || norm.includes("mua") || norm.includes("chot") || 
      norm.includes("chuyen khoan") || norm.includes("stk") || norm.includes("giu cho") || 
      norm.includes("uu dai")
    ) {
      appendBotMessage(BOT_DATA.answers.buy.text, BOT_DATA.answers.buy.cta);
      return;
    }

    // 14. Khách do dự / chưa mua / suy nghĩ thêm / đắt
    if (
      norm.includes("suy nghi") || norm.includes("chua mua") || norm.includes("ban voi") || 
      norm.includes("de sau") || norm.includes("tu tu") || norm.includes("chua co tien") || 
      norm.includes("can nhac")
    ) {
      appendBotMessage(BOT_DATA.answers.hesitate.text, BOT_DATA.answers.hesitate.cta);
      return;
    }

    // 15. Khách hỏi online có làm được không / run tay
    if (
      norm.includes("online") || norm.includes("run tay") || norm.includes("video") || 
      norm.includes("thuc hanh") || norm.includes("qua mang") || norm.includes("micro-drill")
    ) {
      appendBotMessage(BOT_DATA.answers.q1.text, BOT_DATA.answers.q1.cta);
      return;
    }

    // 16. Khách hỏi PT / Spa / tay ngang / chưa học Y
    if (
      norm.includes("pt") || norm.includes("gym") || norm.includes("spa") || 
      norm.includes("tay ngang") || norm.includes("chua hoc y") || norm.includes("yoga") || 
      norm.includes("massage")
    ) {
      appendBotMessage(BOT_DATA.answers.q2.text, BOT_DATA.answers.q2.cta);
      return;
    }

    // 17. Khách so sánh giá / học phí sao đắt / 14.9
    if (
      norm.includes("hoc phi") || norm.includes("gia") || norm.includes("dat") || 
      norm.includes("14.9") || norm.includes("bao nhieu") || norm.includes("2-3 ngay") || 
      norm.includes("so sanh")
    ) {
      appendBotMessage(BOT_DATA.answers.q3.text, BOT_DATA.answers.q3.cta);
      return;
    }

    // 18. Khách hỏi chứng chỉ / pháp lý / bằng cấp
    if (
      norm.includes("chung chi") || norm.includes("bang") || norm.includes("phap ly") || 
      norm.includes("hanh nghe") || norm.includes("giay phep") || norm.includes("so y te")
    ) {
      appendBotMessage(BOT_DATA.answers.q5.text, BOT_DATA.answers.q5.cta);
      return;
    }

    // 19. Khách hỏi khấu trừ lên Offline
    if (
      norm.includes("khau tru") || norm.includes("offline") || norm.includes("henrik simon") || 
      norm.includes("tru tien") || norm.includes("hoc tiep")
    ) {
      appendBotMessage(BOT_DATA.answers.q6.text, BOT_DATA.answers.q6.cta);
      return;
    }

    // 20. Khác gì bẻ khớp thông thường / tiktok
    if (
      norm.includes("khac gi") || norm.includes("be khop") || norm.includes("tiktok") || 
      norm.includes("thong thuong") || norm.includes("chuyen biet")
    ) {
      appendBotMessage(BOT_DATA.answers.q7.text, BOT_DATA.answers.q7.cta);
      return;
    }

    // 21. Nữ nhỏ con / sức yếu / khách nam to béo
    if (
      norm.includes("nu") || norm.includes("nho con") || norm.includes("suc") || 
      norm.includes("yeu") || norm.includes("to beo") || norm.includes("80kg") || 
      norm.includes("90kg")
    ) {
      appendBotMessage(BOT_DATA.answers.q8.text, BOT_DATA.answers.q8.cta);
      return;
    }

    // 22. Trả góp
    if (
      norm.includes("tra gop") || norm.includes("the tin dung") || norm.includes("chia nho")
    ) {
      appendBotMessage(BOT_DATA.answers.q9.text, BOT_DATA.answers.q9.cta);
      return;
    }

    // ---------------------------------------------------------
    // C. MẶC ĐỊNH KHI CÂU HỎI NGOÀI PHẠM VI NHẬN DIỆN
    // ---------------------------------------------------------
    appendBotMessage(
      `Dạ em cảm ơn câu hỏi rất hay của anh/chị ạ! Bác sĩ Henrik Simon và đội ngũ chuyên môn Simon Center luôn sẵn sàng giải đáp chuyên sâu theo từng trường hợp thực tế của anh/chị.<br><br>
Anh/chị có thể bấm nút bên dưới để <strong>Điền form tư vấn / nhận tài liệu y khoa mẫu</strong>, hoặc nhắn trực tiếp qua Zalo <strong>0389.609.938</strong> để trao đổi cùng Bác sĩ chuyên môn nhé ạ!`,
      "register"
    );
  }

  function showTypingIndicator(callback) {
    const messagesContainer = document.getElementById("chiroChatMessages");
    if (!messagesContainer) return;

    const typingDiv = document.createElement("div");
    typingDiv.id = "chiroTypingIndicator";
    typingDiv.className = "flex items-center space-x-2 text-xs text-gray-500 italic";
    typingDiv.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-brand-wine text-amber-300 font-extrabold flex items-center justify-center text-[9px] shrink-0">SC</div>
      <div class="bg-gray-200 px-3 py-1.5 rounded-full flex items-center space-x-1">
        <span class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
        <span class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.15s"></span>
        <span class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.3s"></span>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    setTimeout(() => {
      typingDiv.remove();
      callback();
    }, 380);
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
