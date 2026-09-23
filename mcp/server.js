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
const STATE_FILE = path.join(ROOT, 'mcp_state.json');           // remembers last check (no duplicate alerts)
const NOTIFY_CONFIG_FILE = path.join(ROOT, 'notify_config.json'); // editable from admin panel
const ROLES_CONFIG_FILE = path.join(ROOT, 'roles_config.json');   // owner/admin/staff mapping, editable from admin panel

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return fallback; }
}
function writeJson(file, obj) {
  try { fs.writeFileSync(file, JSON.stringify(obj, null, 2)); } catch (e) { /* ignore */ }
}

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

// Did any scheduled VN time (morning/evening "HH:MM") fall within (sinceMs, nowMs]?
function crossedScheduledTime(sinceMs, nowMs, morning, evening) {
  const VN = 7 * 3600000; // UTC+7
  const nowVN = new Date(nowMs + VN);
  for (let dayOffset = -1; dayOffset <= 0; dayOffset++) {
    const d = new Date(nowVN);
    d.setUTCDate(d.getUTCDate() + dayOffset);
    for (const t of [morning, evening]) {
      const [h, mn] = String(t).split(':').map(Number);
      if (!Number.isFinite(h) || !Number.isFinite(mn)) continue;
      const schedVNwall = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, mn, 0);
      const schedMs = schedVNwall - VN; // VN wall-clock -> real UTC ms
      if (schedMs > sinceMs && schedMs <= nowMs) return true;
    }
  }
  return false;
}

// Returns NEW leads/orders to report NOW (for the agent's proactive heartbeat).
// Driven by notify_config.json (editable in the admin panel):
//   enabled · signal (all|paid|pending) · frequency (immediate|30min|60min|schedule) · morning_time · evening_time
// Uses mcp_state.json (leads_last_notified) → never alerts the same lead twice, and
// respects the chosen reporting cadence (batch / scheduled).
async function doNewLeads() {
  const cfg = {
    enabled: true, signal: 'all', frequency: 'immediate',
    morning_time: '08:00', evening_time: '20:00',
    ...readJson(NOTIFY_CONFIG_FILE, {}),
  };
  if (cfg.enabled === false) return { enabled: false, count: 0, new_leads: [] };

  const SB = process.env.SUPABASE_URL;
  const K = process.env.SUPABASE_ANON_KEY;
  if (!SB || !K) throw new Error('Thiếu SUPABASE_URL / SUPABASE_ANON_KEY trong .env');

  const nowMs = Date.now();
  const state = readJson(STATE_FILE, null);
  // First run: set the marker to "now" so we don't flood with historical leads.
  if (!state || !state.leads_last_notified) {
    writeJson(STATE_FILE, { ...(state || {}), leads_last_notified: new Date(nowMs).toISOString() });
    return { enabled: true, initialized: true, count: 0, new_leads: [] };
  }

  const since = state.leads_last_notified;
  const url = `${SB}/rest/v1/leads?select=*&created_at=gt.${encodeURIComponent(since)}&order=created_at.asc`;
  const res = await fetch(url, { headers: { apikey: K, Authorization: `Bearer ${K}` } });
  if (!res.ok) throw new Error(`Supabase HTTP ${res.status}`);
  let rows = await res.json();

  const isPaid = (s) => !!s && s.toUpperCase().includes('ĐÃ THANH TOÁN');
  if (cfg.signal === 'paid') rows = rows.filter((r) => isPaid(r.status));
  else if (cfg.signal === 'pending') rows = rows.filter((r) => !isPaid(r.status));

  if (rows.length === 0) return { enabled: true, count: 0, new_leads: [], frequency: cfg.frequency };

  // Decide whether to REPORT now based on the reporting cadence.
  const sinceMs = new Date(since).getTime();
  let report = false;
  if (cfg.frequency === 'immediate') report = true;
  else if (cfg.frequency === '30min') report = nowMs - sinceMs >= 30 * 60000;
  else if (cfg.frequency === '60min') report = nowMs - sinceMs >= 60 * 60000;
  else if (cfg.frequency === 'schedule') report = crossedScheduledTime(sinceMs, nowMs, cfg.morning_time, cfg.evening_time);

  if (!report) {
    // Holding: leads accumulate, marker NOT advanced → they'll be reported next window.
    return { enabled: true, count: 0, holding: rows.length, new_leads: [], frequency: cfg.frequency };
  }

  writeJson(STATE_FILE, { ...state, leads_last_notified: rows[rows.length - 1].created_at });
  return {
    enabled: true,
    signal: cfg.signal,
    frequency: cfg.frequency,
    count: rows.length,
    new_leads: rows.map((r) => ({ name: r.name, phone: r.phone, price: r.price, course: r.course, status: r.status, created_at: r.created_at })),
  };
}

// Look up a person's role from roles_config.json (managed in the admin panel).
// Returns owner | admin | staff | stranger + the permissions the agent should honour.
const ROLE_PERMS = {
  owner:    { label: 'Chủ',       can: ['admin_ops', 'view_revenue', 'view_leads', 'edit_web', 'manage_users', 'receive_reports'] },
  admin:    { label: 'Quản trị',  can: ['view_revenue', 'view_leads', 'assist_ops'] },
  staff:    { label: 'Nhân viên', can: ['view_assigned_leads'] },
  stranger: { label: 'Khách lạ',  can: ['customer_service'] },
};
function doCheckUserRole(platform, senderId) {
  const cfg = readJson(ROLES_CONFIG_FILE, { members: [] });
  const members = Array.isArray(cfg.members) ? cfg.members : [];
  const p = String(platform || 'telegram').toLowerCase();
  const sid = String(senderId || '').trim();
  const hit = members.find((m) => String(m.sender_id) === sid && (m.platform || 'telegram') === p);
  const role = hit ? hit.role : 'stranger';
  return { role, name: hit ? hit.name : null, permissions: (ROLE_PERMS[role] || ROLE_PERMS.stranger).can, label: (ROLE_PERMS[role] || ROLE_PERMS.stranger).label };
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

  server.registerTool('get_new_leads_since_last_check', {
    title: 'Kiểm tra lead/đơn mới (cho heartbeat)',
    description: 'Trả về các lead/đơn MỚI từ lần kiểm tra trước (dùng cho heartbeat để chủ động nhắn chủ). Tự nhớ mốc thời gian nên không báo trùng. Loại tín hiệu (tất cả / chỉ đã thanh toán / chỉ chờ) do cấu hình trong admin panel quyết định.',
    inputSchema: {},
  }, async () => {
    log('get_new_leads_since_last_check');
    const r = await doNewLeads();
    if (r.enabled === false) {
      return { content: [{ type: 'text', text: '(Thông báo tự động đang TẮT trong cấu hình admin — không kiểm tra.)' }] };
    }
    if (r.initialized) {
      return { content: [{ type: 'text', text: '(Đã khởi tạo theo dõi. Từ giờ sẽ báo lead/đơn mới.)' }] };
    }
    if (r.count === 0) {
      return { content: [{ type: 'text', text: '(Không có lead/đơn mới.)' }] };
    }
    const lines = r.new_leads
      .map((l) => `• ${l.name || '?'} — ${l.phone || ''} — ${l.course || ''} — ${l.price || ''} — ${l.status || ''}`)
      .join('\n');
    return { content: [{ type: 'text', text: `🔔 Có ${r.count} lead/đơn mới:\n${lines}` }] };
  });

  server.registerTool('check_user_role', {
    title: 'Kiểm tra vai trò người dùng',
    description: 'Tra vai trò của người đang chat theo ID nền tảng (từ bảng phân quyền trong admin panel). Trả về owner (Chủ) / admin (Quản trị) / staff (Nhân viên) / stranger (Khách lạ) kèm quyền hạn. Gọi tool này TRƯỚC khi tiết lộ số liệu nội bộ hoặc thực hiện lệnh quản trị, để phục vụ đúng vai trò.',
    inputSchema: {
      sender_id: z.string().min(1).describe('ID của người đang chat trên nền tảng (VD: Telegram sender_id).'),
      platform: z.enum(['telegram', 'messenger', 'zalo']).optional().describe("Nền tảng (mặc định 'telegram')."),
    },
  }, async ({ sender_id, platform }) => {
    log('check_user_role:', platform || 'telegram', sender_id);
    const r = doCheckUserRole(platform, sender_id);
    const who = r.name ? `${r.name} (${r.label})` : r.label;
    return { content: [{ type: 'text', text: `👤 Vai trò: ${r.role} — ${who}\nQuyền: ${r.permissions.join(', ')}` }] };
  });

  return server;
}

// ── HTTP (streamable-http, stateless) ──
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mcp', tools: ['update_hero', 'crm_stats', 'add_note', 'get_new_leads_since_last_check', 'check_user_role'], time: new Date().toISOString() });
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
