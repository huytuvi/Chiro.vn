#!/usr/bin/env python3
"""
upload-higgsfield.py — Wrapper chuẩn bị nguyên liệu và cung cấp checklist thao tác trên Higgsfield UI/API.
"""

import sys

def higgsfield_workflow_guide():
    print("=" * 60)
    print("🚀 HIGGSFIELD WORKFLOW CHECKLIST")
    print("=" * 60)
    print("1. Truy cập Higgsfield Image -> Chọn Model Stream 4.5.")
    print("2. Upload các ảnh tham chiếu trong thư mục product-photos/ vào panel Reference.")
    print("3. Chọn Tỷ lệ khung hình: 9:16 (Dọc).")
    print("4. TẮT Chế độ Free (Chuyển sang Paid mode ~3-5 credit/ảnh).")
    print("5. Nhập Prompt & Negative Prompt từ gen-prompt.py -> Bấm Generate.")
    print("6. Tải ảnh ưng ý -> Chuyển sang Tab Video -> Chọn Kling 2.6 hoặc Kling 3.0.")
    print("7. Paste Prompt motion 'orbit nhẹ chậm' -> Render 5s MP4.")
    print("=" * 60)

if __name__ == "__main__":
    higgsfield_workflow_guide()
