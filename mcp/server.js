/**
 * MCP server for chiro.vn — gives the goClaw AI agent "hands" over the website.
 * Transport: streamable-http (stateless). Binds 127.0.0.1:3001 (localhost only).
 * Shares the SAME brain.db and index.html as the website.
 *
 * Tools: update_hero, crm_stats, add_note
 */

import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const PORT = Number(process.env.MCP_PORT || 3001);
const HOST = process.env.MCP_HOST || '127.0.0.1';
const DB_PATH = process.env.BRAIN_DB_PATH
  ? path.resolve(ROOT, process.env.BRAIN_DB_PATH)
  : path.join(ROOT, 'brain.db');
const INDEX_HTML = process.env.INDEX_HTML_PATH || path.join(ROOT, 'public', 'index.html');

function log(...args) {
  console.log(new Date().toISOString(), '[mcp]', ...args);
}
function openDb() {
  return new Database(DB_PATH); // read-write
}
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Tool implementations ──
function doUpdateHero(newTitle) {
  let html = fs.readFileSync(INDEX_HTML, 'utf8');
  const re = /(<span id="hero-headline"[^>]*>)([\s\S]*?)(<\/span>)/;
  const m = html.match(re);
  if (!m) throw new Error('Không tìm thấy phần tử #hero-headline trong index.html');
  const oldTitle = m[2].replace(/<[^>]+>/g, '').trim();
  html = html.replace(re, `$1${escHtml(newTitle)}$3`);
  fs.writeFileSync(INDEX_HTML, html);
  return { success: true, old_title: oldTitle, new_title: newTitle };
}

// crm_stats reads the LIVE data from Supabase `leads` (same source as the admin panel),
// so it always matches reality — brain.db is only a periodically-synced mirror.
async function doCrmStats(period) {
  const SB = process.env.SUPABASE_URL;
  const K = process.env.SUPABASE_ANON_KEY;
  if (!SB || !K) throw new Error('Thiếu SUPABASE_URL / SUPABASE_ANON_KEY trong .env');

  const res = await fetch(`${SB}/rest/v1/leads?select=name,phone,price,status,created_at`, {
    headers: { apikey: K, Authorization: `Bearer ${K}` },
  });
  if (!res.ok) throw new Error(`Supabase HTTP ${res.status}`);
  let rows = await res.json();

  if (period === 'today') {
    const todayVN = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
    rows = rows.filter((r) => {
      if (!r.created_at) return false;
      const dVN = new Date(new Date(r.created_at).getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
      return dVN === todayVN;
    });
  }

  const isPaid = (s) => !!s && s.toUpperCase().includes('ĐÃ THANH TOÁN'.toUpperCase());
  const toNum = (p) => Number(String(p || '').replace(/[^\d]/g, '')) || 0;
  const paid = rows.filter((r) => isPaid(r.status));
  const revenue = paid.reduce((sum, r) => sum + toNum(r.price), 0);
  const customers = new Set(rows.map((r) => r.phone).filter(Boolean)).size;

  return { period: period || 'all', customers, orders: rows.length, paid_orders: paid.length, revenue };
}

function doAddNote(title, content) {
  const db = openDb();
  try {
    const info = db.prepare('INSERT INTO knowledge (title, content) VALUES (?, ?)').run(title, content);
    return { success: true, id: Number(info.lastInsertRowid), title };
  } finally {
    db.close();
  }
}

// ── Build a fresh MCP server (stateless: one per request) ──
function buildServer() {
  const server = new McpServer({ name: 'my-business', version: '1.0.0' });

  server.registerTool('update_hero', {
    title: 'Đổi tiêu đề landing',
    description: 'Đổi tiêu đề nổi bật (hero) trên trang chủ website chiro.vn. Khách truy cập refresh sẽ thấy ngay.',
    inputSchema: { new_title: z.string().min(1).describe('Tiêu đề mới cho trang chủ') },
  }, async ({ new_title }) => {
    log('update_hero:', new_title);
    const r = doUpdateHero(new_title);
    return { content: [{ type: 'text', text: `✅ Đã đổi tiêu đề landing.\nCũ: "${r.old_title}"\nMới: "${r.new_title}"` }] };
  });

  server.registerTool('crm_stats', {
    title: 'Thống kê CRM',
    description: 'Báo cáo số khách hàng, đơn hàng, đơn đã thanh toán và doanh thu (từ brain.db).',
    inputSchema: { period: z.enum(['today', 'all']).optional().describe("'today' cho hôm nay, 'all' cho tất cả (mặc định 'all')") },
  }, async ({ period }) => {
    const p = period || 'all';
    log('crm_stats:', p);
    const r = await doCrmStats(p);
    const label = p === 'today' ? 'Hôm nay' : 'Tổng cộng';
    const text = `📊 ${label}:\n- Khách hàng: ${r.customers}\n- Đơn hàng: ${r.orders}\n- Đã thanh toán: ${r.paid_orders}\n- Doanh thu: ${Number(r.revenue).toLocaleString('vi-VN')} đ`;
    return { content: [{ type: 'text', text }] };
  });

  server.registerTool('add_note', {
    title: 'Lưu ghi chú / ý tưởng',
    description: 'Lưu một ý tưởng hoặc ghi chú vào brain.db (bảng knowledge) để xem lại sau.',
    inputSchema: {
      title: z.string().min(1).describe('Tiêu đề ngắn của ghi chú'),
      content: z.string().min(1).describe('Nội dung chi tiết'),
    },
  }, async ({ title, content }) => {
    log('add_note:', title);
    const r = doAddNote(title, content);
    return { content: [{ type: 'text', text: `📝 Đã lưu ghi chú #${r.id}: "${r.title}"` }] };
  });

  return server;
}

// ── HTTP (streamable-http, stateless) ──
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mcp', tools: ['update_hero', 'crm_stats', 'add_note'], time: new Date().toISOString() });
});

app.post('/mcp', async (req, res) => {
  try {
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on('close', () => { transport.close(); server.close(); });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    log('ERROR', err.message);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal error' }, id: null });
    }
  }
});

const methodNotAllowed = (req, res) =>
  res.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null });
app.get('/mcp', methodNotAllowed);
app.delete('/mcp', methodNotAllowed);

app.listen(PORT, HOST, () => {
  log(`MCP server listening on http://${HOST}:${PORT}/mcp`);
  log(`brain.db: ${DB_PATH}`);
  log(`index.html: ${INDEX_HTML}`);
});
