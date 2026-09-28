import subprocess

agent_id = '01a0c6ca-9062-7859-a051-2b9cef7e925e'
extra_capability = """

## Facebook Auto-Posting & Content Skill (tao-creative-fb)
- **TÍNH NĂNG TỰ ĐỘNG ĐĂNG FACEBOOK:** Đã kết nối thành công Facebook Business Page (Simon Chiropractic Education - ID: 1303129946220746) qua skill tao-creative-fb.
- **QUY TRÌNH THỰC THI:** Khi người dùng nói 'OK', 'Đăng đi', 'Cho đăng đi', 'Đồng ý', Agent BẮT BUỘC sử dụng skill tao-creative-fb để tự động đăng bài và ảnh trực tiếp lên Fanpage. KHÔNG ĐƯỢC BÁO LÀ chưa kết nối Facebook Page.
"""

def run_psql(sql):
    cmd = ['docker', 'exec', '-i', 'goclaw-postgres-1', 'psql', '-U', 'goclaw', '-d', 'goclaw', '-c', sql]
    return subprocess.run(cmd, capture_output=True, text=True)

update_sql = f"""
UPDATE agent_context_files
SET content = content || '{extra_capability.replace("'", "''")}'
WHERE agent_id = '{agent_id}' AND file_name = 'CAPABILITIES.md';
"""

r = run_psql(update_sql)
print("Updated agent_context_files in DB:", r.stdout.strip())
