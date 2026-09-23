// Export brain.db tables -> vault-ready/*.md (Markdown for goClaw Knowledge Vault).
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, 'brain.db'), { readonly: true });
const OUT = path.join(__dirname, 'vault-ready');
fs.mkdirSync(OUT, { recursive: true });
const S = (v) => (v == null ? '' : String(v));
const files = [];
const write = (name, md) => { fs.writeFileSync(path.join(OUT, name), md); files.push(name); };

// brand-voice.md
{
  const rows = db.prepare('SELECT title, content FROM brand_voice ORDER BY id').all();
  let md = `# Brand Voice — Giọng nói thương hiệu\n\n> Nguồn: brain.db › brand_voice. Liên quan: [[my-business]], [[knowledge-base]].\n\n`;
  for (const r of rows) md += `## ${S(r.title)}\n\n${S(r.content)}\n\n---\n\n`;
  write('brand-voice.md', md);
}
// my-business.md
{
  const biz = db.prepare('SELECT title, content FROM business ORDER BY id').all();
  const prods = db.prepare('SELECT name, type, price, description FROM products ORDER BY price').all();
  let md = `# My Business — Simon Chiropractic Center (chiro.vn)\n\n> Nguồn: brain.db › business + products. Liên quan: [[brand-voice]], [[products]].\n\n`;
  for (const r of biz) md += `## ${S(r.title)}\n\n${S(r.content)}\n\n`;
  md += `\n## Sản phẩm / Khóa học\n\n`;
  for (const p of prods) md += `- **${S(p.name)}** (${S(p.type)}) — ${Number(p.price).toLocaleString('vi-VN')}đ — ${S(p.description)}\n`;
  write('my-business.md', md);
}
// products.md
{
  const prods = db.prepare('SELECT name, type, price, description, registered_count FROM products ORDER BY price').all();
  let md = `# Products — Sản phẩm & Khóa học\n\n> Nguồn: brain.db › products. Liên quan: [[my-business]].\n\n`;
  for (const p of prods) md += `## ${S(p.name)}\n- Loại: ${S(p.type)}\n- Giá: ${Number(p.price).toLocaleString('vi-VN')}đ\n- Mô tả: ${S(p.description)}\n\n`;
  write('products.md', md);
}
// knowledge-base.md
{
  const rows = db.prepare('SELECT title, content FROM knowledge ORDER BY id').all();
  let md = `# Knowledge Base — Kiến thức chung\n\n> Nguồn: brain.db › knowledge (${rows.length} mục). Liên quan: [[medical-knowledge]], [[brand-voice]].\n\n`;
  for (const r of rows) md += `## ${S(r.title)}\n\n${S(r.content)}\n\n`;
  write('knowledge-base.md', md);
}
// medical-knowledge.md
{
  const rows = db.prepare('SELECT chapter_title, section_title, anatomical_region, topic, red_flags, indications, techniques, content FROM medical_knowledge ORDER BY chapter_num, section_code').all();
  let md = `# Medical Knowledge — Kiến thức Chiropractic chuẩn y khoa (DISC)\n\n> Nguồn: brain.db › medical_knowledge (${rows.length} mục). Liên quan: [[knowledge-base]], [[german-knowledge]].\n\n`;
  for (const r of rows) {
    md += `## ${S(r.section_title) || S(r.topic) || S(r.chapter_title)}\n`;
    if (r.anatomical_region) md += `- Vùng giải phẫu: ${S(r.anatomical_region)}\n`;
    if (r.red_flags) md += `- ⚠️ Red flags: ${S(r.red_flags)}\n`;
    if (r.indications) md += `- Chỉ định: ${S(r.indications)}\n`;
    if (r.techniques) md += `- Kỹ thuật: ${S(r.techniques)}\n`;
    if (r.content) md += `\n${S(r.content)}\n`;
    md += `\n`;
  }
  write('medical-knowledge.md', md);
}
// german-knowledge.md
{
  const rows = db.prepare('SELECT section_code, german_heading, german_text FROM german_knowledge ORDER BY id').all();
  let md = `# German Knowledge — Nguyên bản tiếng Đức (DISC)\n\n> Nguồn: brain.db › german_knowledge (${rows.length} mục). Liên quan: [[medical-knowledge]].\n\n`;
  for (const r of rows) md += `## ${S(r.german_heading) || S(r.section_code)}\n\n${S(r.german_text)}\n\n`;
  write('german-knowledge.md', md);
}
// index.md
{
  const labels = {
    'brand-voice.md': 'Giọng nói thương hiệu', 'my-business.md': 'Thông tin doanh nghiệp',
    'products.md': 'Sản phẩm & khóa học', 'knowledge-base.md': 'Kiến thức chung',
    'medical-knowledge.md': 'Kiến thức y khoa Chiropractic', 'german-knowledge.md': 'Nguyên bản tiếng Đức',
  };
  let md = `# Index — Knowledge Vault (Simon Chiropractic)\n\n> Mục lục tài liệu, xuất từ brain.db.\n\n`;
  for (const f of files) md += `- [[${f.replace(/\.md$/, '')}]] — ${labels[f] || ''}\n`;
  write('index.md', md);
}

console.log('Files:', files.join(', '));
for (const f of files) console.log('  -', f, (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1) + ' KB');
db.close();
