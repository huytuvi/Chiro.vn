#!/usr/bin/env python3
import os
import sys
import shutil

SKILL_NAME = "tao-creative-fb"
SKILL_SRC = f"/var/www/chiro/my-skills/{SKILL_NAME}"
host_dest = f"/opt/goclaw/data/skills-store/{SKILL_NAME}/1"

os.makedirs(host_dest, exist_ok=True)

for item in os.listdir(SKILL_SRC):
    s = os.path.join(SKILL_SRC, item)
    d = os.path.join(host_dest, item)
    if os.path.isdir(s):
        if os.path.exists(d):
            shutil.rmtree(d)
        shutil.copytree(s, d)
    else:
        shutil.copy2(s, d)

# Also copy .env into host_dest
env_content = '''OPENAI_API_KEY=your_openai_key
FB_PAGE_ID=your_page_id
FB_PAGE_TOKEN=your_page_token
DRY_RUN=false
BRAIN_DB_PATH=/var/www/chiro/brain.db
'''
with open(os.path.join(host_dest, '.env'), 'w') as f:
    f.write(env_content)

print(f"Skill {SKILL_NAME} registered locally.")
