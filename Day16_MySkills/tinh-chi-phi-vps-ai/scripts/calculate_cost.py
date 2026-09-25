#!/usr/bin/env python3
import sys

def calculate_monthly_cost(requests_per_day, tokens_per_request=1500, vps_cost_vnd=130000):
    total_requests_month = requests_per_day * 30
    total_tokens_month = total_requests_month * tokens_per_request
    
    # DeepSeek cost: $0.28 per 1,000,000 tokens ~ 7,000 VND
    token_cost_vnd = (total_tokens_month / 1000000) * 7000
    total_cost_vnd = vps_cost_vnd + token_cost_vnd
    
    print("=== BÁO CÁO ƯỚC TÍNH CHI PHÍ VẬN HÀNH (THÁNG) ===")
    print(f"- Số request/ngày: {requests_per_day:,} tin nhắn")
    print(f"- Tổng request/tháng: {total_requests_month:,} tin nhắn")
    print(f"- Tổng token ước tính: {total_tokens_month:,} tokens")
    print(f"- Chi phí VPS (123host): {vps_cost_vnd:,} VND")
    print(f"- Chi phí API DeepSeek: {int(token_cost_vnd):,} VND")
    print("--------------------------------------------------")
    print(f"👉 TỔNG CHI PHÍ VẬN HÀNH: {int(total_cost_vnd):,} VND / tháng")

if __name__ == "__main__":
    req = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    calculate_monthly_cost(req)
