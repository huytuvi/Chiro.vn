import os
import sqlite3
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

def get_brand_voice_context() -> str:
    db_path = os.getenv("BRAIN_DB_PATH", "./brain.db")
    if not os.path.exists(db_path):
        db_path = "/Users/huybui/Desktop/Chiro_course/brain.db"
    
    context_items = []
    if os.path.exists(db_path):
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT title, content FROM brand_voice ORDER BY id DESC LIMIT 3")
            rows = cursor.fetchall()
            conn.close()
            for r in rows:
                context_items.append(f"--- {r[0]} ---\n{r[1][:1000]}")
        except Exception as e:
            print(f"[gen_caption] Could not read brain.db: {e}")
    
    return "\n\n".join(context_items) if context_items else "Bác sĩ Henrik Simon - Chiropractic chuẩn Y Khoa Châu Âu."

def generate_fallback_caption(topic: str, mode: str = "organic", angle: str = "patient") -> str:
    """Generates strictly targeted captions separating Patient treatment vs Student course."""
    
    # 1. Post targeting Patients (Khám & Đặt lịch điều trị)
    if "patient" in angle.lower() or "khám" in topic.lower() or "bệnh" in topic.lower():
        return f"""🚨 BẠN ĐANG BỊ ĐAU CỔ VAI GÁY, THẮT LƯNG HOẶC TÊ BÌ TAY CHÂN?

Đừng tự ý vặn xoắn bừa bãi! Nắn chỉnh cột sống tại Simon Chiropractic Center áp dụng phương pháp Specific Chiropractic chuẩn y khoa Đức từ Bác sĩ Henrik Simon.

📌 Vì sao bệnh nhân tin tưởng Simon Center?
1. Sàng lọc an toàn tuyệt đối (Red Flags) trước khi tác động lực.
2. Khóa góc khớp an toàn (Pre-tension) giải tỏa áp lực đĩa đệm nhẹ nhàng.
3. Hơn 20 năm kinh nghiệm điều trị lâm sàng thực tế tại Châu Âu.

chủ đề chia sẻ: {topic}

👉 Đặt lịch khám và tư vấn trực tiếp cùng Bác sĩ:
📞 Hotline/Zalo: 038 9609938
✉️ Email: simoncentervn@gmail.com | Website: chiro.vn

#SimonChiropractic #ĐauCổVaiGáy #NắnChỉnhCộtSống #ChiroVN #BácSĩHenrikSimon"""

    # 2. Post targeting Students / Doctors (Khóa học Nắn chỉnh)
    elif "course" in angle.lower() or "học" in topic.lower() or "đào tạo" in topic.lower():
        return f"""🎓 KHOÁ HỌC NẮN CHỈNH CỘT SỐNG CHUẨN Y KHOA CHÂU ÂU — BÁC SĨ HENRIK SIMON

Bạn là Y Bác sĩ, KTV Vật lý trị liệu hay Y sĩ YHCT muốn làm chủ kỹ thuật nắn chỉnh an toàn chuẩn Đức?

📌 Quyền lợi khóa học tại Simon Chiropractic Center:
1. Học kỹ thuật thả rơi Body Drop: Nữ 45kg vẫn nắn chỉnh nhẹ nhàng cho khách nam 90kg.
2. Bộ video đa góc quay cận cảnh & bài tập rèn lực Micro-drills tại nhà.
3. Đặc quyền KHẤU TRỪ 100% học phí online khi nâng cấp học thực hành 1-1.
4. Cấp Chứng nhận Hoàn thành chính thức do Bác sĩ Henrik Simon trực tiếp ký.

chủ đề bài học: {topic}

📥 Đăng ký nhận ngay bài giảng học thử miễn phí & ưu đãi hôm nay:
📞 Hotline/Zalo tư vấn khóa học: 038 9609938
✉️ Email: simoncentervn@gmail.com | Website: chiro.vn

#ĐàoTạoNắnChỉnh #SpecificChiropractic #ChiroVN #HenrikSimon #HọcNắnChỉnh"""

    else:
        return f"""✨ {topic.upper()} — CHUẨN Y KHOA CHÂU ÂU TỪ BÁC SĨ HENRIK SIMON

Nắn chỉnh cột sống Specific Chiropractic chú trọng sự chính xác tuyệt đối ở điểm sai lệch (Subluxation) và quy trình kiểm tra Red Flags để đảm bảo an toàn 100%.

📌 Điểm nổi bật tại Simon Chiropractic Center:
1. Kế thừa hơn 20 năm kinh nghiệm điều trị thực tế tại Đức.
2. Kỹ thuật an toàn, không tốn sức bắp tay.
3. Tư vấn phác đồ cá nhân hóa cho từng ca bệnh.

📞 Hotline/Zalo: 038 9609938
✉️ Email: simoncentervn@gmail.com | Website: chiro.vn

#SpecificChiropractic #HenrikSimon #ChiroVN #SứcKhỏeCộtSống"""

def generate_caption(topic: str, mode: str = "organic", angle: str = "") -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    brand_context = get_brand_voice_context()
    
    if api_key and not api_key.startswith("sk-proj-placeholder"):
        try:
            client = OpenAI(api_key=api_key)
            system_prompt = f"""Bạn là Chuyên gia Content Marketing cho Simon Chiropractic Center.
ĐỌC KỸ QUY TẮC PHÂN BIỆT ĐỐI TƯỢNG TỪ BRAIN.DB:
{brand_context}

QUY TẮC BẮT BUỘC:
- Nếu chủ đề hướng tới BỆNH NHÂN đi khám: Chỉ nói về khám điều trị, KHÔNG nhắc học phí khóa học.
- Nếu chủ đề hướng tới HỌC VIÊN / BÁC SĨ học nghề: Nói về khóa học, chứng nhận, đặc quyền khấu trừ 100%.

Cấu trúc: Hook thu hút + Body y khoa sâu sắc (~80-150 từ) + CTA Hotline 038 9609938 + 3-5 Hashtag.
"""
            user_prompt = f"Viết bài đăng với chủ đề: {topic}. Chế độ: {mode}. Target Angle: {angle}"
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"[gen_caption] OpenAI API notice: {e}")
            print("[gen_caption] Switching to targeted fallback generator...")
    
    return generate_fallback_caption(topic, mode, angle)

if __name__ == "__main__":
    print("--- TEST PATIENT POST ---")
    print(generate_caption("Đau cổ vai gáy lâu năm và giải pháp nắn chỉnh an toàn", angle="patient"))
    print("\n--- TEST COURSE POST ---")
    print(generate_caption("Bí quyết khóa góc khớp Pre-tension trong nắn chỉnh", angle="course"))
