#!/usr/bin/env python3
"""
gen-prompt.py — Gọi LLM (OpenAI/Gemini/Claude) tự động tạo Prompt Stream 4.5 & Kling 2.6/3.0
cho danh sách sản phẩm hoặc kịch bản video AI.
"""

import os
import sys

def generate_video_prompts(product_name, style="KOC Fashion"):
    print(f"🎬 Đang sinh prompt cho sản phẩm: [{product_name}] - Phong cách: [{style}]")
    
    stream_prompt = (
        f"A photorealistic 9:16 vertical image of a model wearing {product_name}, "
        f"standing in a luxury minimal apartment with warm natural sunlight. "
        f"High detail, cinematic lighting, 8k resolution."
    )
    
    negative_prompt = (
        "wrong face, wrong logo, change outfit color, wrong size, missing buttons, "
        "fake plastic look, low quality, distorted anatomy"
    )
    
    motion_prompt = (
        "A slow gentle orbit shot, camera moves smoothly around the subject, "
        "keeping the model still and elegant, soft warm light, cinematic vibe"
    )
    
    return {
        "stream_prompt": stream_prompt,
        "negative_prompt": negative_prompt,
        "motion_prompt": motion_prompt
    }

if __name__ == "__main__":
    prod = sys.argv[1] if len(sys.argv) > 1 else "Áo Polo Nam Be Premium"
    res = generate_video_prompts(prod)
    print("\n--- STREAM 4.5 PROMPT ---")
    print(res["stream_prompt"])
    print("\n--- NEGATIVE PROMPT ---")
    print(res["negative_prompt"])
    print("\n--- KLING MOTION PROMPT ---")
    print(res["motion_prompt"])
