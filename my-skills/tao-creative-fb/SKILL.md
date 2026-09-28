---
name: tao-creative-fb
description: Skill Cấp 3 tự động tạo ảnh visual và caption bài viết Facebook, tự động thực thi script Python đăng bài lên Facebook Fanpage.
---

# SKILL: tao-creative-fb

Skill này sản xuất FULL CONTENT (ảnh + bài viết) và TỰ ĐỘNG ĐĂNG LÊN FACEBOOK PAGE bằng cách thực thi script Python.

> ⚠️ LƯU Ý DÀNH CHO AGENT: Bạn CÓ ĐẦY ĐỦ QUYỀN ĐĂNG BÀI FACEBOOK. Chạy duy nhất lệnh bash bên dưới.

---

## BƯỚC THỰC THI ĐĂNG FACEBOOK

Khi người dùng nhắn: "OK", "Đăng đi", "Cho đăng đi", "Đồng ý":

Agent THỰC THI CHÍNH XÁC LỆNH BASH NÀY (Không gõ inline import):

```bash
python3 /app/data/skills-store/tao-creative-fb/1/scripts/post_facebook.py
```

Sau khi lệnh trên hoàn tất, báo lại cho người dùng:
`🎉 Đã tự động đăng bài thành công lên Fanpage Simon Chiropractic Education!`
`Link bài viết: https://www.facebook.com/1303129946220746`
