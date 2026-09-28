#!/usr/bin/env python3
"""
list-images.py — Quét và liệt kê các file ảnh nguyên liệu sản phẩm/model trong thư mục product-photos/
"""

import os

def list_product_images(photos_dir="./product-photos"):
    if not os.path.exists(photos_dir):
        print(f"⚠️ Chưa có thư mục {photos_dir}. Khởi tạo thư mục mẫu...")
        os.makedirs(photos_dir, exist_ok=True)
        return []
    
    valid_exts = (".png", ".jpg", ".jpeg", ".webp")
    files = [os.path.join(photos_dir, f) for f in os.listdir(photos_dir) if f.lower().endswith(valid_exts)]
    
    print(f"📸 Tìm thấy {len(files)} ảnh sản phẩm trong [{photos_dir}]:")
    for idx, f in enumerate(files, 1):
        print(f"  {idx}. {os.path.basename(f)} ({os.path.getsize(f) // 1024} KB)")
    
    return files

if __name__ == "__main__":
    list_product_images()
