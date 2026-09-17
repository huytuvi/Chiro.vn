/**
 * SIMON CENTER CHIROPRACTIC CHATBOT
 * Kịch bản bán hàng & tư vấn chuẩn Y đức từ sales_script.md & brain.db
 */

(function () {
  if (window.ChiroChatbotLoaded) return;
  window.ChiroChatbotLoaded = true;

  // Dữ liệu kịch bản chuẩn từ sales_script.md
  const BOT_DATA = {
    greeting: `Dạ em chào anh/chị ạ! Cảm ơn anh/chị đã ghé thăm <strong>Simon Center</strong>.<br><br>Dạ không biết anh/chị đang quan tâm đến <strong>Chương trình đào tạo Nắn chỉnh Cột sống chuẩn Y khoa Đức</strong> để nâng cao tay nghề, hay anh/chị đang cần hỗ trợ tư vấn trị liệu cơ xương khớp cho bản thân ạ?<br><br>Anh/chị có thể chọn nhanh các câu hỏi bên dưới hoặc nhắn trực tiếp để em hỗ trợ đúng nhu cầu nhất nhé ạ!`,
    
    quickQuestions: [
      { id: "q1", text: "🎓 Học online liệu có làm được thật không?" },
      { id: "q2", text: "🩺 PT Gym / Spa / chưa học Y có học được không?" },
      { id: "q3", text: "💰 Sao học phí 14.9tr cao hơn lớp 2-3 ngày?" },
      { id: "q4", text: "📊 Khóa học có dạy đọc phim X-quang không?" },
      { id: "q5", text: "📜 Chứng chỉ hoàn thành & Pháp lý hành nghề" },
      { id: "q6", text: "🤝 Mua khóa Online sau lên Offline có được trừ tiền?" },
      { id: "q7", text: "🔥 Nắn chuẩn Đức khác gì bẻ khớp thông thường?" },
      { id: "q8", text: "💪 Nữ nhỏ con có nắn được khách nam 90kg không?" },
      { id: "q9", text: "💳 Có chính sách trả góp qua thẻ tín dụng không?" },
      { id: "buy", text: "⚡ Đăng ký khóa học / Nhận ưu đãi ngay" },
      { id: "hesitate", text: "🤔 Tôi chưa sẵn sàng mua ngay / Cần suy nghĩ thêm" }
    ],

    answers: {
      q1: {
        text: `Dạ em rất hiểu nỗi băn khoăn này của anh/chị ạ! Nắn chỉnh là môn thực hành trực tiếp, nên nếu chỉ xem video lý thuyết thụ động thì chắc chắn không ai dám làm cả.<br><br>Khóa học tại Simon Center được Thầy Henrik Simon thiết kế theo <strong>Quy trình sư phạm 3 bước chuẩn Đức</strong> để giải quyết triệt để rào cản này:<br><br>
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
Kiến thức này giúp anh/chị nâng tầm gói dịch vụ chỉnh tư thế (Posture Alignment), giải phóng khớp cổ chân, khớp háng, tăng giá trị buổi tập lên 500k – 1tr/buổi nhé ạ!`,
        cta: "register"
      },
      q3: {
        text: `Dạ em rất hiểu khi mới tìm hiểu, học phí chắc chắn là điều anh/chị cân nhắc kỹ lưỡng đầu tiên ạ.<br><br>
Nhưng khi bước vào điều trị thực tế, các anh chị học viên đều nhận ra: Một khóa học ngắn ngày giá rẻ thường chỉ dạy vài ba thao tác bẻ khớp theo cảm tính, không dạy đọc phim X-quang và không dạy Cảnh báo đỏ (Red Flags).<br><br>
Trong ngành y, <strong>rủi ro lớn nhất không phải là học phí đắt hay rẻ, mà là lỡ tay nắn sai vào một ca chống chỉ định</strong> (rách bao xơ đĩa đệm, loãng xương nặng hay thiểu năng tuần hoàn não) thì hậu quả về sức khỏe người bệnh và uy tín cả đời không gì bù đắp được.<br><br>
Khóa học Simon Center bảo vệ anh/chị an toàn 100%. Về kinh tế, sau khi học xong anh/chị chỉ cần tiếp nhận <strong>5–6 bệnh nhân</strong> tại phòng khám là đã thu hồi hoàn toàn 14.9 triệu, nhưng tay nghề chuẩn Đức thì theo anh/chị trọn đời nhé ạ!`,
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
        text: `Dạ sau khi hoàn thành các bài giảng và vượt qua bài test cuối khóa, anh/chị sẽ được cấp <strong>Chứng Chỉ Hoàn Thành (Certificate of Completion)</strong> có chữ ký xác nhận trực tiếp của Bác sĩ Henrik Simon, chứng nhận hoàn thành chương trình đào tạo chuẩn Viện DISC CHLB Đức ạ.<br><br>
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
• <strong>Specific Chiropractic chuẩn Đức:</strong> Phân tích tìm đúng <strong>đốt sai lệch nguyên phát (Primary Subluxation)</strong> — chỉ nắn đốt kẹt, tuyệt đối không nắn vào đốt lỏng bù trừ. Kỹ thuật HVLA vận tốc cao biên độ nhỏ êm ái, bệnh nhân chưa kịp sợ thì khớp đã mở ra nhẹ nhõm, không hề gây đau đớn ạ!`,
        cta: "register"
      },
      q8: {
        text: `Dạ chị hoàn toàn yên tâm nhé ạ! Rất nhiều học viên nữ nhỏ nhắn 45kg tại Simon Center hiện đang nắn chỉnh rất mượt mà cho các khách hàng nam to béo 80–90kg.<br><br>
Bản chất của Chiropractic chuẩn Đức là <strong>khoa học của tốc độ và trọng lực rơi cơ thể (F = m · a)</strong>, hoàn toàn không dùng sức bắp tay.<br><br>
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
      }
    }
  };

  function injectChatbot() {
    // 1. Chèn nút mở Chatbot vào thanh sticky buttons ở góc dưới phải
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

    // 2. Chèn Cửa sổ Chatbot chính
    const chatModal = document.createElement("div");
    chatModal.id = "chiroChatWindow";
    chatModal.className = "fixed bottom-4 sm:bottom-6 right-3 sm:right-24 z-[1000] w-[360px] sm:w-[400px] max-w-[calc(100vw-1.5rem)] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border-2 border-brand-crimson/20 flex flex-col overflow-hidden hidden transform transition-all duration-300";
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
            <div class="font-extrabold text-xs sm:text-sm text-white">
              Trợ Lý Chuyên Môn Simon Center
            </div>
            <div class="text-[10px] text-amber-200 flex items-center space-x-1 mt-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              <span>Chuẩn Viện DISC Đức • Trực tuyến 24/7</span>
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
      <div id="chiroChatMessages" class="chat-scroll flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-[#F8FAFC]">
        <!-- Nội dung tin nhắn -->
      </div>

      <!-- GỢI Ý CÂU HỎI NHANH (QUICK CHIPS) -->
      <div id="chiroQuickChipsContainer" class="p-2.5 bg-white border-t border-gray-200 overflow-x-auto whitespace-nowrap text-xs flex gap-1.5 chat-scroll shrink-0">
        <!-- Chips render động -->
      </div>

      <!-- KHUNG NHẬP TIN NHẮN (INPUT BAR) -->
      <div class="p-2.5 sm:p-3 bg-white border-t border-gray-200 shrink-0">
        <form id="chiroChatForm" onsubmit="window.handleChiroSend(event)" class="flex items-center space-x-2">
          <input type="text" id="chiroChatInput" placeholder="Hỏi về khóa học, kỹ thuật nắn, học phí..." 
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
          <a href="tel:0389609938" class="text-brand-crimson font-bold hover:underline">Hotline: 0389.609.938</a>
        </div>
      </div>
    `;

    document.body.appendChild(chatModal);
  }

  let isChatOpen = false;
  let chatHistory = [];

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

  function appendBotMessage(htmlContent, ctaType = null) {
    chatHistory.push({ sender: "bot", text: htmlContent, cta: ctaType });
    const messagesContainer = document.getElementById("chiroChatMessages");
    if (!messagesContainer) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = "flex items-start space-x-2 text-xs leading-relaxed max-w-[92%]";
    
    let ctaHtml = "";
    if (ctaType === "register" || ctaType === "register_now") {
      ctaHtml = `
        <div class="mt-3 pt-2.5 border-t border-amber-200/60 space-y-1.5">
          <button onclick="window.scrollToRegisterForm('buy')" class="chiro-cta-btn w-full text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow flex items-center justify-center space-x-1.5">
            <span>👉 Đến Form Đăng Ký / Giữ Suất Ưu Đãi (14.9Tr)</span>
          </button>
          <a href="https://zalo.me/0389609938" target="_blank" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-xs flex items-center justify-center space-x-1 transition">
            <span>💬 Nhắn Zalo Bác Sĩ Tư Vấn: 0389.609.938</span>
          </a>
        </div>
      `;
    } else if (ctaType === "trial") {
      ctaHtml = `
        <div class="mt-3 pt-2.5 border-t border-amber-200/60 space-y-1.5">
          <button onclick="window.scrollToRegisterForm('trial')" class="bg-amber-600 hover:bg-amber-700 text-white w-full text-xs font-bold py-2.5 px-3 rounded-xl shadow flex items-center justify-center space-x-1.5 transition">
            <span>🎁 Điền Form Nhận Video Học Thử & Giữ Ưu Đãi</span>
          </button>
          <a href="tel:0389609938" class="block text-center text-[11px] text-gray-500 hover:text-brand-crimson font-medium pt-0.5">
            Hoặc gọi Hotline: 0389.609.938 (Hỗ trợ 24/7)
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
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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

  function renderQuickChips() {
    const container = document.getElementById("chiroQuickChipsContainer");
    if (!container) return;
    container.innerHTML = "";
    BOT_DATA.quickQuestions.forEach(q => {
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

  function matchAndReply(userInput) {
    const lower = userInput.toLowerCase();

    // 1. Khách muốn mua / đăng ký / học phí / chuyển khoản
    if (lower.includes("dang ky") || lower.includes("mua") || lower.includes("chot") || lower.includes("chuyen khoan") || lower.includes("stk") || lower.includes("giu cho") || lower.includes("uu dai")) {
      const ans = BOT_DATA.answers.buy;
      appendBotMessage(ans.text, ans.cta);
      return;
    }

    // 2. Khách do dự / chưa mua / suy nghĩ thêm / đắt
    if (lower.includes("suy nghi") || lower.includes("chua mua") || lower.includes("ban voi") || lower.includes("de sau") || lower.includes("tu tu") || lower.includes("chua co tien") || lower.includes("can nhac")) {
      const ans = BOT_DATA.answers.hesitate;
      appendBotMessage(ans.text, ans.cta);
      return;
    }

    // 3. Khách hỏi online có làm được không / run tay
    if (lower.includes("online") || lower.includes("run tay") || lower.includes("video") || lower.includes("thuc hanh") || lower.includes("qua mang")) {
      const ans = BOT_DATA.answers.q1;
      appendBotMessage(ans.text, ans.cta);
      return;
    }

    // 4. Khách hỏi PT / Spa / tay ngang / chưa học Y
    if (lower.includes("pt") || lower.includes("gym") || lower.includes("spa") || lower.includes("tay ngang") || lower.includes("chua hoc y") || lower.includes("yoga") || lower.includes("massage")) {
      const ans = BOT_DATA.answers.q2;
      appendBotMessage(ans.text, ans.cta);
      return;
    }

    // 5. Khách so sánh giá / học phí sao đắt / 14.9
    if (lower.includes("hoc phi") || lower.includes("gia") || lower.includes("dat") || lower.includes("14.9") || lower.includes("bao nhieu") || lower.includes("2-3 ngay") || lower.includes("so sanh")) {
      const ans = BOT_DATA.answers.q3;
      appendBotMessage(ans.text, ans.cta);
      return;
    }

    // 6. Khách hỏi X-quang / đọc phim
    if (lower.includes("x-quang") || lower.includes("xquang") || lower.includes("phim") || lower.includes("xray") || lower.includes("mri") || lower.includes("doc phim")) {
      const ans = BOT_DATA.answers.q4;
      appendBotMessage(ans.text, ans.cta);
      return;
    }

    // 7. Khách hỏi chứng chỉ / pháp lý / bằng cấp
    if (lower.includes("chung chi") || lower.includes("bang") || lower.includes("phap ly") || lower.includes("hanh nghe") || lower.includes("giay phep") || lower.includes("so y te")) {
      const ans = BOT_DATA.answers.q5;
      appendBotMessage(ans.text, ans.cta);
      return;
    }

    // 8. Khách hỏi khấu trừ lên Offline
    if (lower.includes("khau tru") || lower.includes("offline") || lower.includes("henrik simon") || lower.includes("tru tien") || lower.includes("hoc tiep")) {
      const ans = BOT_DATA.answers.q6;
      appendBotMessage(ans.text, ans.cta);
      return;
    }

    // 9. Khác gì bẻ khớp thông thường / tiktok
    if (lower.includes("khac gi") || lower.includes("be khop") || lower.includes("rom rop") || lower.includes("tiktok") || lower.includes("thong thuong")) {
      const ans = BOT_DATA.answers.q7;
      appendBotMessage(ans.text, ans.cta);
      return;
    }

    // 10. Nữ nhỏ con / sức yếu / khách nam to béo
    if (lower.includes("nu") || lower.includes("nho con") || lower.includes("suc") || lower.includes("yeu") || lower.includes("to beo") || lower.includes("80kg") || lower.includes("90kg")) {
      const ans = BOT_DATA.answers.q8;
      appendBotMessage(ans.text, ans.cta);
      return;
    }

    // 11. Trả góp
    if (lower.includes("tra gop") || lower.includes("the tin dung") || lower.includes("chia nho")) {
      const ans = BOT_DATA.answers.q9;
      appendBotMessage(ans.text, ans.cta);
      return;
    }

    // 12. Mặc định
    appendBotMessage(
      `Dạ em cảm ơn câu hỏi của anh/chị ạ! Bác sĩ Henrik Simon và đội ngũ chuyên môn Simon Center luôn sẵn sàng giải đáp chi tiết theo tình trạng thực tế của anh/chị.<br><br>
Anh/chị có thể bấm nút bên dưới để <strong>Điền form đăng ký / nhận tài liệu tư vấn miễn phí</strong>, hoặc nhắn tin qua Zalo <strong>0389.609.938</strong> để chuyên viên hỗ trợ anh/chị ngay nhé ạ!`,
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
    }, 400);
  }

  // Cuộn mượt đến Form đăng ký / Danh sách chờ
  window.scrollToRegisterForm = function (actionType = "register") {
    const targetForm = document.getElementById("register-form");
    if (targetForm) {
      window.toggleChiroChat();
      
      targetForm.scrollIntoView({ behavior: "smooth", block: "start" });
      
      // Hiệu ứng highlight form
      const formBox = targetForm.querySelector(".bg-brand-slate") || targetForm;
      formBox.style.transition = "all 0.4s ease";
      formBox.style.boxShadow = "0 0 0 4px rgba(143, 29, 53, 0.4)";
      setTimeout(() => {
        formBox.style.boxShadow = "";
      }, 2500);

      // Focus vào ô input họ tên
      setTimeout(() => {
        const nameInput = document.getElementById("regName");
        if (nameInput) nameInput.focus();
      }, 600);
    } else {
      // Nếu ở trang khác, chuyển hướng về trang chủ tới đúng form
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
