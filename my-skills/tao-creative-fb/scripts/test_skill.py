import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.gen_image import generate_image
from scripts.gen_caption import generate_caption
from scripts.post_facebook import post_to_facebook

def run_mode_2_creative_ads():
    print("\n=======================================================")
    print("RUNNING MODE 2: CREATIVE ADS (3 BỘ ẢNH + COPY GHÉP CẶP)")
    print("=======================================================\n")
    
    angles = [
        ("Pain Point", "Nắn chỉnh sai cách gây nguy cơ tổn thương đĩa đệm và cổ vai gáy", "A realistic photo of office worker suffering from severe neck discomfort, red spine highlight, professional ad visual"),
        ("Solution", "Kỹ thuật nắn chỉnh chuẩn y khoa Châu Âu của Thầy Henrik Simon", "A modern European chiropractic clinic with doctor performing gentle precise spinal adjustment, high key bright light"),
        ("Social Proof", "Học viên nữ 45kg nắn chỉnh cho khách nam 90kg thả rơi trọng lực", "A female student performing ergonomic body drop chiropractic leverage technique on modern medical table, inspiring photorealistic")
    ]
    
    results = []
    for idx, (angle_name, topic, prompt) in enumerate(angles, 1):
        print(f"--- Bộ Creative {idx} [{angle_name}] ---")
        img_path = f"output/creative_ad_{idx}_{angle_name.lower().replace(' ', '_')}.png"
        
        # 1. Gen Image
        print(f"1. Generating Image for Angle {idx}: {angle_name}...")
        gen_img = generate_image(prompt, output_path=img_path)
        
        # 2. Gen Caption
        print(f"2. Generating Ad Copy for Angle {idx}: {angle_name}...")
        copy_text = generate_caption(topic=topic, mode="ads", angle=angle_name)
        
        results.append({
            "set": idx,
            "angle": angle_name,
            "image": gen_img,
            "copy": copy_text
        })
        
        print(f"\n[BỘ {idx} OUTPUT]")
        print(f"📷 Image Path: {gen_img}")
        print(f"✍️ Ad Copy:\n{copy_text}\n")
    
    print("Mode 2 Creative Ads complete! 3 sets created in output/")
    return results

def run_mode_1_content_free(topic: str = "Tầm quan trọng của việc kiểm tra cột sống định kỳ"):
    print("\n=======================================================")
    print("RUNNING MODE 1: CONTENT FREE (ORGANIC AUTO-POST PAGE)")
    print("=======================================================\n")
    
    img_path = "output/organic_post_today.png"
    
    # 1. Gen Image
    print("1. Generating Organic Visual Image...")
    img = generate_image(
        prompt_text=f"A high quality realistic medical photograph illustrating: {topic}, modern chiropractic center background, 8k",
        output_path=img_path
    )
    
    # 2. Gen Caption
    print("2. Generating Full Organic Caption...")
    caption = generate_caption(topic=topic, mode="organic")
    
    print("\n--- PREVIEW CONTENT FREE ---")
    print(f"📷 Image: {img}")
    print(f"✍️ Caption:\n{caption}\n")
    
    # 3. Post to Facebook
    print("3. Executing Facebook Post...")
    res = post_to_facebook(img, caption)
    return res

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "2"
    if mode == "2":
        run_mode_2_creative_ads()
    elif mode == "1":
        run_mode_1_content_free()
    else:
        print("Usage: python test_skill.py [1|2]")
