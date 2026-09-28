---
name: tinh-chi-phi-vps-ai
description: Tính toán chính xác chi phí vận hành VPS và AI Agent API (DeepSeek/Gemini/OpenAI) theo số lượng yêu cầu (requests) hoặc token sử dụng. Dùng khi user nói "tính chi phí vps", "tính tiền api ai", "chi phí chạy bot telegram", "ước tính chi phí goclaw".
---

# Skill: Tính Chi Phí Vận Hành VPS & AI Agent

## 1. Mục đích
Dùng script Python để tính toán chính xác 100% chi phí hạ tầng (VPS + LLM API) cho dự án AI Agent dựa trên số liệu thực tế, tránh tính nhẩm mơ hồ.

## 2. Quy trình thực hiện
1. Đọc số lượng request/ngày hoặc số người dùng từ yêu cầu của User.
2. Chạy script `scripts/calculate_cost.py` với các tham số tương ứng.
3. Tổng hợp kết quả và trả về bảng phân tích chi tiết chi phí theo tháng (VND).

## 3. Cấu hình bảng giá mặc định
- **VPS 123host (NVMe P1):** 130,000 VND / tháng.
- **DeepSeek V3 API:** ~7,000 VND / 1,000,000 token (~0.28 USD).
- **Trung bình 1 tin nhắn Telegram:** ~1,500 token (Prompt + Completion).
