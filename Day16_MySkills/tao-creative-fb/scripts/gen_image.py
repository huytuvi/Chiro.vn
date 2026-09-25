import os
import requests
from dotenv import load_dotenv
from openai import OpenAI
from PIL import Image, ImageDraw, ImageFont

load_dotenv()

def get_vietnamese_font(size: int):
    """Finds a system TTF font supporting full Vietnamese Unicode."""
    font_paths = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc"
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def create_fallback_image(prompt_text: str, output_path: str) -> str:
    """Generates a high-resolution, premium branded 1024x1024 poster with full Vietnamese font support."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # 1024x1024 Premium Dark Medical Canvas
    img = Image.new("RGB", (1024, 1024), color="#0A192F")
    draw = ImageDraw.Draw(img)
    
    # Fonts
    font_title = get_vietnamese_font(34)
    font_subtitle = get_vietnamese_font(22)
    font_heading = get_vietnamese_font(40)
    font_body = get_vietnamese_font(22)
    font_footer = get_vietnamese_font(24)
    
    # Glowing Outer Border
    draw.rectangle([30, 30, 994, 994], outline="#00F2FE", width=5)
    draw.rectangle([45, 45, 979, 979], outline="#1E293B", width=3)
    
    # Brand Header Banner
    draw.rectangle([60, 60, 964, 190], fill="#112240", outline="#233554", width=2)
    draw.text((90, 85), "SIMON CHIROPRACTIC CENTER", fill="#00F2FE", font=font_title)
    draw.text((90, 135), "Chuẩn Y Khoa Châu Âu — Dr. Henrik Simon", fill="#8892B0", font=font_subtitle)
    
    # Main Headline Card
    draw.rectangle([60, 220, 964, 460], fill="#1E293B", outline="#00F2FE", width=2)
    
    concept_title = "SPECIFIC CHIROPRACTIC"
    concept_sub = "BẢO VỆ CỘT SỐNG & AN TOÀN Y KHOA"
    
    if "pain" in prompt_text.lower() or "nỗi đau" in prompt_text.lower():
        concept_title = "CẢNH BÁO SAI LỆCH CỘT SỐNG"
        concept_sub = "Kiểm tra an toàn y khoa Red Flags"
    elif "solution" in prompt_text.lower() or "giải pháp" in prompt_text.lower():
        concept_title = "KỸ THUẬT NẮN CHỈNH AN TOÀN"
        concept_sub = "Phương pháp chuẩn y khoa Châu Âu"
    elif "45kg" in prompt_text.lower() or "proof" in prompt_text.lower():
        concept_title = "KỸ THUẬT BODY DROP CHUYÊN SÂU"
        concept_sub = "Lực thả rơi trọng lượng cơ thể nhẹ nhàng"

    draw.text((90, 260), concept_title, fill="#F8FAFC", font=font_heading)
    draw.text((90, 330), concept_sub, fill="#38BDF8", font=font_subtitle)
    draw.text((90, 390), f"Chủ đề: {prompt_text[:50]}...", fill="#94A3B8", font=font_body)
    
    # Graphic Visual Area (Center Showcase)
    draw.rectangle([60, 490, 964, 840], fill="#112240", outline="#0284C7", width=3)
    draw.rectangle([90, 520, 934, 810], fill="#0A192F", outline="#233554", width=2)
    
    draw.text((260, 630), "🩻 NẮN CHỈNH CỘT SỐNG CHUYÊN SÂU", fill="#00F2FE", font=font_title)
    draw.text((280, 690), "Hơn 20 năm kinh nghiệm lâm sàng tại Đức", fill="#CCD6F6", font=font_subtitle)
    
    # Footer Banner with Hotline & Contact
    draw.rectangle([60, 870, 964, 950], fill="#00F2FE")
    draw.text((90, 895), "📞 Hotline/Zalo: 038 9609938  |  ✉️ Email: simoncentervn@gmail.com", fill="#0A192F", font=font_footer)
    
    img.save(output_path)
    print(f"[gen_image] High quality Vietnamese Unicode image saved to: {output_path}")
    return output_path

def generate_image(prompt_text: str, output_path: str = "output/generated_image.png") -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    if api_key and not api_key.startswith("sk-proj-placeholder"):
        try:
            client = OpenAI(api_key=api_key)
            print("[gen_image] Calling OpenAI Image API...")
            response = client.images.generate(
                model="gpt-image-1",
                prompt=prompt_text,
                size="1024x1024",
                quality="auto",
                n=1,
            )
            image_url = response.data[0].url
            img_bytes = requests.get(image_url).content
            with open(output_path, "wb") as f:
                f.write(img_bytes)
            print(f"[gen_image] Image generated via OpenAI API: {output_path}")
            return output_path
        except Exception as e:
            print(f"[gen_image] OpenAI API notice: {e}")
            print("[gen_image] Switching to fallback high-resolution branded visual...")
    
    return create_fallback_image(prompt_text, output_path)

if __name__ == "__main__":
    test_path = generate_image("Professional chiropractic spine alignment")
    print("Output path:", test_path)
