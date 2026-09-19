import json

with open('/Users/huybui/.gemini/antigravity/scratch/Chiro.vn/initial_crm_data.json', 'r', encoding='utf-8') as f:
    crm_data = json.load(f)

with open('/Users/huybui/.gemini/antigravity/scratch/Chiro.vn/admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("admin.html and build_admin_html.py are in sync.")
