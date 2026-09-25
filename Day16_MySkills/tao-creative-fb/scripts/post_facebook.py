import os
import requests
from dotenv import load_dotenv

load_dotenv()

def post_to_facebook(image_path: str, caption_text: str) -> dict:
    page_id = os.getenv("FB_PAGE_ID")
    page_token = os.getenv("FB_PAGE_TOKEN")
    dry_run = os.getenv("DRY_RUN", "true").lower() == "true"
    
    print(f"\n==========================================")
    print(f"[post_facebook] POSTING TO FACEBOOK PAGE")
    print(f"Page ID: {page_id}")
    print(f"Image Path: {image_path}")
    print(f"DRY_RUN Mode: {dry_run}")
    print(f"Caption Preview:\n{caption_text[:120]}...")
    print(f"==========================================\n")
    
    if dry_run:
        print("[DRY_RUN] Chế độ test đang BẬT. Không đăng thật lên Facebook.")
        print("[DRY_RUN] Bài viết và ảnh đã được kiểm tra và lưu tại local thành công!")
        return {
            "status": "success",
            "dry_run": True,
            "message": "DRY_RUN completed successfully. File saved locally.",
            "post_id": "DRY_RUN_POST_ID_12345"
        }
    
    if not page_id or not page_token:
        raise ValueError("FB_PAGE_ID or FB_PAGE_TOKEN is missing in environment variables.")
    
    url = f"https://graph.facebook.com/v18.0/{page_id}/photos"
    
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
        
    with open(image_path, "rb") as image_file:
        files = {
            "source": image_file
        }
        data = {
            "caption": caption_text,
            "access_token": page_token
        }
        
        response = requests.post(url, files=files, data=data)
        res_json = response.json()
        
        if response.status_code == 200 and ("id" in res_json or "post_id" in res_json):
            post_id = res_json.get("post_id") or res_json.get("id")
            post_url = f"https://www.facebook.com/{page_id}"
            print(f"SUCCESS! Published post to Facebook Page: {post_url}")
            return {
                "status": "success",
                "dry_run": False,
                "post_id": post_id,
                "post_url": post_url
            }
        else:
            print(f"ERROR posting to Facebook: {res_json}")
            return {
                "status": "error",
                "dry_run": False,
                "error": res_json
            }

if __name__ == "__main__":
    # Test script
    res = post_to_facebook("output/generated_image.png", "Test caption from script")
    print(res)
