# BẢNG CẤU HÌNH BẢN GỐC AI MODEL (ĐỂ HOÀN TÁC TIẾT KIỆM TOKEN)

Để tối ưu chi phí và quay trở lại dùng 100% Free Tier (Google AI Studio & DeepSeek), đây là bảng cấu hình gốc cần khôi phục lại sau khi kết thúc đợt test:

| Agent | Vai trò | Provider Gốc (Miễn phí/Rẻ) | Model Gốc | Provider Hiện Tại (Đang Test) | Model Hiện Tại |
|---|---|---|---|---|---|
| **Optimus Prime** (`optimus-chiro`) | Trưởng nhóm | `aistudio` | `gemini-3.6-flash` | `openai` | `gpt-4o-mini` |
| **Họa Sĩ** (`tao-hinh-fb`) | Tạo ảnh | `aistudio` | `models/gemini-3.1-flash-lite` | `openai` | `gpt-4o-mini` |
| **Cây Bút** (`viet-bai-f`) | Viết caption | `deepseek` | `deepseek-flash` | `openai` | `gpt-4o-mini` |
| **Đạo Diễn** (`lam-video-fb`) | Làm video | `deepseek` | `deepseek-flash` | `deepseek` | `deepseek-flash` |

---

## 📌 LƯU Ý RESET KHÔI PHỤC:
- **Thời gian Google AI Studio Reset Quota 20 lượt/ngày**: **07:00 sáng mỗi ngày** (Giờ Việt Nam).
- Khi kết thúc quá trình test, chỉ cần bảo AI: *"Khôi phục lại cấu hình Model gốc tiết kiệm token"*, AI sẽ chạy lệnh chuyển toàn bộ về Google AI Studio / DeepSeek hoàn toàn miễn phí.
