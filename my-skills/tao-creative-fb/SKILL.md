---
name: tao-creative-fb
description: Skill Cấp 3 sản xuất full content (gồm cả Ảnh visual 1024x1024 và Văn bản caption đi đôi) cho Facebook Business Page với 2 Mode: Mode 1 (Content Free - auto post organic hằng ngày) và Mode 2 (Creative Ads - 3 bộ creative ảnh + copy ghép cặp cho Ads Manager).
---

# Skill `tao-creative-fb` — Sản Xuất Full Content + Auto-Post Facebook

Skill này chịu trách nhiệm sinh full content (mỗi bài xuất ra luôn có **CẢ ẢNH VÀ VĂN BẢN đi đôi với nhau**) cho Facebook Page theo đúng brand voice từ `brain.db` (Bác sĩ Henrik Simon / Chiro.vn).

---

## 2 Mode Hoạt Động

### MODE 1 — CONTENT FREE (Đăng Page Hằng Ngày)
- **Trigger phrases**: `"tạo content cho ngày mai"`, `"gen bài Page"`, `"content free"`, `"content organic"`
- **Quy trình 4 bước**:
  1. **Ý tưởng**: Tạo 3 đề xuất ý tưởng ngắn (Tiêu đề + Angle) cho người dùng chọn (1/2/3).
  2. **Sinh Full Content**:
     - 1 Ảnh visual 1024x1024 chuyên nghiệp bằng `scripts/gen_image.py`.
     - 1 Caption bài viết ~80-150 từ (Hook + Body + Soft CTA + Hashtags) qua `scripts/gen_caption.py`.
  3. **Preview**: Gửi bản xem trước gồm Ảnh và Caption cho người dùng duyệt (Duyệt "OK" hoặc "Đổi").
  4. **Post**: Khi người dùng duyệt "OK", đăng bài lên Facebook qua `scripts/post_facebook.py`. (Nếu `DRY_RUN=true`, lưu file preview local không post thật).

---

### MODE 2 — CREATIVE ADS (Tạo Bộ Creative Cho Quảng Cáo)
- **Trigger phrases**: `"tạo creative ads"`, `"gen ads"`, `"cần creative cho chiến dịch"`, `"3 bộ creative"`
- **Quy trình**:
  - Sinh **3 BỘ CREATIVE hoàn chỉnh** — mỗi bộ là một cặp ghép đôi (1 Ảnh Ads 1024x1024 + 1 Ad Copy ~80-150 từ).
  - 3 bộ khai thác 3 Angle khác nhau:
    - **Bộ 1 (Pain Point)**: Khoét sâu nỗi đau cổ vai gáy / thoát vị / sai lệch đốt sống.
    - **Bộ 2 (Solution)**: Kỹ thuật nắn chỉnh chuẩn y khoa Châu Âu của Thầy Henrik Simon.
    - **Bộ 3 (Social Proof)**: Học viên nữ 45kg nắn khách 90kg / Kết quả lâm sàng / Uy tín 20 năm.
  - **Không tự đăng**: Trả về 3 bộ đầy đủ ảnh + copy để người dùng copy paste vào Facebook Ads Manager.

---

## Cấu trúc thư mục Skill

```
tao-creative-fb/
├── SKILL.md
├── scripts/
│   ├── gen_image.py
│   ├── gen_caption.py
│   ├── post_facebook.py
│   └── env.example
└── assets/
    ├── image-prompt-templates.md
    └── caption-templates.md
```

## Biến môi trường bắt buộc (`.env`)
- `OPENAI_API_KEY`: Key gọi OpenAI API (DALL-E 3 / GPT Image)
- `FB_PAGE_ID`: ID của Fanpage Facebook
- `FB_PAGE_TOKEN`: Token truy cập Page
- `DRY_RUN`: `true` (Test preview) hoặc `false` (Đăng thật lên Facebook)
