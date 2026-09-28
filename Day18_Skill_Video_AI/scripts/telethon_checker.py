#!/usr/bin/env python3
"""
Telethon Telegram Seller Checker
Tự động tìm kiếm thông tin tài khoản Higgsfield và ChatGPT Plus trong nhóm Telegram (MMOVN / Chợ Giời)
và kiểm tra uy tín seller.
"""

import os
import sys
import re
import asyncio
from telethon import TelegramClient

def load_env():
    env_path = "/Users/huybui/Desktop/Chiro_course/.env"
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip()

load_env()

API_ID = os.getenv("TELEGRAM_API_ID", "27839087")
API_HASH = os.getenv("TELEGRAM_API_HASH", "d80694e03696fe5b9e76d6e1153547bc")
SESSION_NAME = "/Users/huybui/Desktop/Chiro_course/Day18_Skill_Video_AI/scripts/mmovn_checker_session"

async def main():
    print("=" * 60)
    print("🤖 TELEGRAM SELLER CHECKER — DAY 18 (HIGGSFIELD & CHATGPT PLUS)")
    print("=" * 60)
    
    if not API_ID or not API_HASH:
        print("❌ Thiếu API_ID hoặc API_HASH!")
        return

    print(f"🔑 API ID: {API_ID}")
    print(f"🔑 API HASH: {API_HASH[:6]}...{API_HASH[-4:]}")
    
    client = TelegramClient(SESSION_NAME, int(API_ID), API_HASH)
    
    PHONE_NUMBER = "+84868794241"
    print(f"\n⚡ Đang khởi động Telegram Client với số {PHONE_NUMBER}... (Telethon sẽ gửi Mã OTP qua Telegram)")
    await client.start(phone=PHONE_NUMBER)

    print("✅ Đã kết nối thành công với tài khoản Telegram của bạn!")

    dialogs = await client.get_dialogs()
    print(f"\n📂 Đã tìm thấy {len(dialogs)} hội thoại/nhóm trên Telegram của bạn.")
    
    target_dialog = None
    for d in dialogs:
        name_lower = d.name.lower()
        if "mmovn" in name_lower or "chợ giời" in name_lower or "neverdie" in name_lower or "chơ giờ" in name_lower:
            target_dialog = d
            print(f"🎯 Đã tìm thấy nhóm phù hợp: {d.name} (ID: {d.id})")
            break

    keywords = ["Higgsfield", "ChatGPT", "ChatGPT Plus", "Higgs"]
    found_sellers = []

    if target_dialog:
        print(f"\n🔍 Đang quét bài đăng trong [{target_dialog.name}]...")
        for kw in keywords:
            async for msg in client.iter_messages(target_dialog, search=kw, limit=15):
                if msg.text:
                    found_sellers.append({
                        "keyword": kw,
                        "sender_id": msg.sender_id,
                        "date": msg.date.strftime("%Y-%m-%d %H:%M"),
                        "text": msg.text[:200].replace("\n", " ")
                    })
    else:
        print("\n💡 Tìm kiếm trên tất cả các hội thoại/nhóm có sẵn...")
        for kw in keywords:
            async for msg in client.iter_messages(None, search=kw, limit=10):
                sender_name = msg.chat.name if msg.chat else str(msg.sender_id)
                found_sellers.append({
                    "keyword": kw,
                    "sender_id": sender_name,
                    "date": msg.date.strftime("%Y-%m-%d %H:%M") if msg.date else "",
                    "text": msg.text[:200].replace("\n", " ") if msg.text else ""
                })

    print("\n" + "=" * 60)
    print("📊 KẾT QUẢ TÌM KIẾM NGƯỜI BÁN HIGGSFIELD / CHATGPT PLUS:")
    print("=" * 60)
    if found_sellers:
        for idx, item in enumerate(found_sellers, 1):
            print(f"[{idx}] Từ khóa: {item['keyword']} | Nguồn: {item['sender_id']} | Ngày: {item['date']}")
            print(f"    Nội dung: {item['text']}...")
            print("-" * 50)
    else:
        print("Không tìm thấy kết quả phù hợp trong lịch sử tin nhắn.")

    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
