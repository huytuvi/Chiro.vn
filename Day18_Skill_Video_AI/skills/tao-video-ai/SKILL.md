---
name: tao-video-ai
description: Quy trình 7 bước sản xuất video AI 15-25s chuyên nghiệp bằng Higgsfield (Stream 4.5 + Kling 2.6/3.0) theo workflow private Workshop KP3.
---

# Skill Sản Xuất Video AI Trên Higgsfield (tao-video-ai)

Quy trình tự động hóa sản xuất Video AI 15-25 giây chuẩn đăng Reels / TikTok / YouTube Shorts hoặc gửi cho khách hàng/bạn bè.

## 📌 Tổng Quan Workflow 7 Bước

1. **Pick Chủ Đề & Bối Cảnh**: Hướng A (Sản phẩm/Bán hàng) hoặc Hướng B (Fun/Tặng bạn bè).
2. **Tạo Kịch Bản & Prompt (ChatGPT/Gemini)**: Sinh Storyboard 3-5 cảnh + Prompts tiếng Anh cho Stream 4.5 & Kling 2.6/3.0.
3. **Sinh Ảnh Higgsfield Stream 4.5**: Tỷ lệ 9:16, Upload ảnh reference sản phẩm/gương mặt, test 1 ảnh trước khi batch.
4. **Mặc Đồ Cho Model (KOC Fashion nếu có)**: Ghép gương mặt model + bộ đồ outfit với Stream 4.5 (khóa face & skin tone).
5. **Animate Kling 2.6 / 3.0**: Sử dụng cú máy "slow gentle orbit shot", thời lượng 5s, tắt audio để tiết kiệm credit.
6. **Multishot (Kling 3.0 Custom/Auto)**: Nối 2-3 góc quay (cận -> toàn -> chi tiết) trong 1 video 5s tiết kiệm 50% credit.
7. **Edit CapCut & Key Zoom**: Ghép video clip 5s với ảnh tĩnh đã áp dụng hiệu ứng "Pan right" / "Zoom in slow" (2-3s).

---

## 🛠 Hướng Dẫn Gọi Scripts & Assets

- Script sinh prompt tự động từ danh sách chủ đề: `python3 scripts/gen-prompt.py`
- Script kiểm tra danh sách ảnh sản phẩm đầu vào: `python3 scripts/list-images.py`
- Hướng dẫn upload & thao tác trên Higgsfield UI/API: `python3 scripts/upload-higgsfield.py`

## 📁 Cấu Trúc Thư Mục Skill
```
tao-video-ai/
├── SKILL.md
├── scripts/
│   ├── gen-prompt.py
│   ├── list-images.py
│   └── upload-higgsfield.py
├── assets/
│   ├── brand-style.md
│   ├── camera-prompts.md
│   └── negative-prompt.txt
└── references/
    ├── koc-format.md
    ├── cinematic-format.md
    └── troubleshoot.md
```
