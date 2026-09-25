/**
 * MCP server for chiro.vn — gives the goClaw AI agent "hands" over the website.
 * Transport: streamable-http (stateless). Binds 127.0.0.1:3001 (localhost only).
 * Shares the SAME brain.db and index.html as the website.
 *
 * Tools: update_hero, crm_stats, add_note, get_new_leads_since_last_check, check_user_role, get_token_usage_report
 */

import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import https from 'https';
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
const TOKEN_LEDGER_FILE = path.join(ROOT, 'token_ledger.json');

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
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

const BOTS = [
  process.env.TELEGRAM_BOT_TOKEN || '8837255291:AAHs647bVFftOG-bCvDWv2LB5bIx193cvXc', // SimonChiro_bot
  '8754048164:AAEPlNluBarn4ysxgK44tekPkCzyONLyCYI',                               // Simoncoder_bot
];

const RECIPIENT_CHAT_IDS = ['7383945015', '5239167089'];

async function sendTelegramDirect(text) {
  let anySuccess = false;
  for (const botToken of BOTS) {
    for (const chatId of RECIPIENT_CHAT_IDS) {
      const ok = await new Promise((resolve) => {
        const data = JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' });
        const req = https.request(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          },
          family: 4, // Force IPv4 to prevent VPS IPv6 unreachable socket timeout
          timeout: 10000,
        }, (res) => {
          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            if (res.statusCode === 200) {
              resolve(true);
            } else {
              console.error(`[TelegramDirect] Send failed HTTP ${res.statusCode} (chat ${chatId}): ${body}`);
              resolve(false);
            }
          });
        });

        req.on('error', (err) => {
          console.error(`[TelegramDirect] Exception (chat ${chatId}):`, err.message);
          resolve(false);
        });

        req.on('timeout', () => {
          req.destroy();
          console.error(`[TelegramDirect] Timeout (chat ${chatId})`);
          resolve(false);
        });

        req.write(data);
        req.end();
      });

      if (ok) anySuccess = true;
    }
  }
  return anySuccess;
}

// Returns NEW leads or STATUS UPDATES (e.g. Paid) to report NOW (for the agent's proactive heartbeat).
// Driven by notify_config.json (editable in the admin panel):
//   enabled · signal (all|paid|pending) · frequency (immediate|30min|60min|schedule) · morning_time · evening_time
// Uses mcp_state.json (notified_map & leads_last_notified) → never misses new leads OR status changes.
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
  const state = readJson(STATE_FILE, {}) || {};
  const notifiedMap = state.notified_map || {};

  // Query top 50 recent leads ordered by id desc
  const url = `${SB}/rest/v1/leads?select=*&order=id.desc&limit=50`;
  const res = await fetch(url, { headers: { apikey: K, Authorization: `Bearer ${K}` } });
  if (!res.ok) throw new Error(`Supabase HTTP ${res.status}`);
  let rows = await res.json();

  const isPaid = (s) => !!s && s.toUpperCase().includes('ĐÃ THANH TOÁN');

  const isFirstRun = Object.keys(notifiedMap).length === 0 && !state.leads_last_notified;
  if (isFirstRun) {
    const initialMap = {};
    for (const r of rows) {
      initialMap[r.id] = r.status || '';
    }
    writeJson(STATE_FILE, { ...state, notified_map: initialMap, leads_last_notified: new Date(nowMs).toISOString() });
    return { enabled: true, initialized: true, count: 0, new_leads: [] };
  }

  let changedRows = [];
  for (const r of rows) {
    const prevStatus = notifiedMap[r.id];
    const currStatus = r.status || '';
    if (prevStatus === undefined) {
      changedRows.push({ ...r, _change: 'new' });
    } else if (prevStatus !== currStatus) {
      changedRows.push({ ...r, _change: 'updated', _prev_status: prevStatus });
    }
  }

  if (cfg.signal === 'paid') changedRows = changedRows.filter((r) => isPaid(r.status));
  else if (cfg.signal === 'pending') changedRows = changedRows.filter((r) => !isPaid(r.status));

  if (changedRows.length === 0) return { enabled: true, count: 0, new_leads: [], frequency: cfg.frequency };

  const sinceMs = state.leads_last_notified ? new Date(state.leads_last_notified).getTime() : nowMs - 60000;
  let report = false;
  if (cfg.frequency === 'immediate') report = true;
  else if (cfg.frequency === '30min') report = nowMs - sinceMs >= 30 * 60000;
  else if (cfg.frequency === '60min') report = nowMs - sinceMs >= 60 * 60000;
  else if (cfg.frequency === 'schedule') report = crossedScheduledTime(sinceMs, nowMs, cfg.morning_time, cfg.evening_time);

  if (!report) {
    return { enabled: true, count: 0, holding: changedRows.length, new_leads: [], frequency: cfg.frequency };
  }

  const updatedMap = { ...notifiedMap };

  // Send direct Telegram notification for each changed lead (0 LLM tokens, 100% reliable HTML format)
  for (const r of changedRows) {
    let title = r._change === 'updated' ? '💳 <b>CẬP NHẬT THANH TOÁN / TRẠNG THÁI</b>' : '📝 <b>ĐƠN ĐĂNG KÝ / LEAD MỚI</b>';
    if (isPaid(r.status)) title = '🎉 <b>KHÁCH THANH TOÁN THÀNH CÔNG!</b>';

    const text = `${title}\n\n` +
      `👤 <b>Họ tên:</b> ${escHtml(r.name || 'Khách hàng')}\n` +
      `📞 <b>SĐT:</b> <code>${escHtml(r.phone || 'Chưa có')}</code>\n` +
      `📚 <b>Khóa/Sản phẩm:</b> ${escHtml(r.course || 'Mặc định')}\n` +
      `💰 <b>Giá:</b> ${escHtml(r.price || '0 đ')}\n` +
      `📌 <b>Trạng thái:</b> <b>${escHtml(r.status || 'Chờ tư vấn')}</b>\n` +
      (r._change === 'updated' ? `🔄 <b>Trạng thái cũ:</b> ${escHtml(r._prev_status)}\n` : '') +
      `🕒 <b>Thời gian:</b> ${escHtml(r.time_str || new Date().toLocaleString('vi-VN'))}`;

    const ok = await sendTelegramDirect(text);
    if (ok) {
      // ONLY mark as notified if Telegram API returned SUCCESS (200 OK)
      updatedMap[r.id] = r.status || '';
    } else {
      console.error(`[TelegramDirect] Delivery failed for lead ID ${r.id} (${r.name}) - will retry next cycle.`);
    }
  }

  writeJson(STATE_FILE, {
    ...state,
    notified_map: updatedMap,
    leads_last_notified: new Date(nowMs).toISOString(),
  });

  return {
    enabled: true,
    signal: cfg.signal,
    frequency: cfg.frequency,
    count: changedRows.length,
    new_leads: changedRows.map((r) => ({
      name: r.name,
      phone: r.phone,
      price: r.price,
      course: r.course,
      status: r.status,
      created_at: r.created_at,
      type: r._change === 'updated' ? `Cập nhật (cũ: ${r._prev_status})` : 'Mới',
    })),
  };
}

function doCheckUserRole(platform = 'telegram', senderId) {
  const rolesCfg = readJson(ROLES_CONFIG_FILE, {
    members: [
      { platform: 'telegram', name: 'Anh Huy', sender_id: '7383945015', role: 'owner' },
      { platform: 'telegram', name: 'Anh Huy (2)', sender_id: '5239167089', role: 'owner' }
    ]
  });
  const idStr = String(senderId);
  const plat = platform || 'telegram';
  const members = Array.isArray(rolesCfg.members) ? rolesCfg.members : [];
  const found = members.find(m => m.platform === plat && String(m.sender_id) === idStr);

  if (found) {
    return {
      role: found.role,
      name: found.name,
      label: found.role === 'owner' ? 'Chủ sở hữu' : (found.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'),
      permissions: ['read', 'write', 'admin']
    };
  }
  return { role: 'stranger', label: 'Khách lạ / Người dùng công khai', permissions: ['public'] };
}

function readTokenLedger() {
  const defaultLedger = {
    deposits: [
      {
        id: 1,
        date: "2026-09-22T00:00:00.000Z",
        source: "Nạp tiền DeepSeek",
        amount_vnd: 200000,
        amount_usd: 8.0,
        notes: "Khoản nạp ngân sách ban đầu"
      }
    ],
    alert_threshold_percent: 20
  };
  return readJson(TOKEN_LEDGER_FILE, defaultLedger);
}

function writeTokenLedger(ledger) {
  writeJson(TOKEN_LEDGER_FILE, ledger);
}

async function doGetTokenReport() {
  const ledger = readTokenLedger();
  const deposits = Array.isArray(ledger.deposits) ? ledger.deposits : [];
  const totalDepositedVnd = deposits.reduce((sum, d) => sum + (Number(d.amount_vnd) || 0), 0);
  const totalDepositedUsd = deposits.reduce((sum, d) => sum + (Number(d.amount_usd) || 0), 0);

  let dailyUsage = [];
  let totalSpentVnd = 0;
  let totalSpentUsd = 0;

  try {
    const { execSync } = await import('child_process');
    
    // Daily usage query — filter ONLY DeepSeek models for paid cost
    const dailySql = `SELECT DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::text as date_vn, COUNT(*)::int as sessions_count, COALESCE(SUM(CASE WHEN LOWER(model) LIKE '%deepseek%' THEN input_tokens ELSE 0 END), 0)::bigint as ds_input, COALESCE(SUM(CASE WHEN LOWER(model) LIKE '%deepseek%' THEN output_tokens ELSE 0 END), 0)::bigint as ds_output, COALESCE(SUM(CASE WHEN LOWER(model) NOT LIKE '%deepseek%' THEN input_tokens + output_tokens ELSE 0 END), 0)::bigint as free_tokens FROM sessions GROUP BY DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') ORDER BY date_vn DESC LIMIT 7;`;
    const dailyRaw = execSync(`docker exec -i goclaw-postgres-1 psql -U goclaw -d goclaw -t -A -c "${dailySql}" 2>/dev/null`).toString().trim();

    if (dailyRaw) {
      dailyUsage = dailyRaw.split('\n').filter(Boolean).map(line => {
        const [date_vn, sessions_count, ds_input, ds_output, free_tokens] = line.split('|');
        const inp = Number(ds_input) || 0;
        const out = Number(ds_output) || 0;
        const freeT = Number(free_tokens) || 0;
        // DeepSeek Pricing: Input $0.14/1M, Output $0.28/1M
        const costUsd = (inp * 0.00000014) + (out * 0.00000028);
        const costVnd = Math.round(costUsd * 25000);
        return {
          date_vn,
          sessions_count: Number(sessions_count) || 0,
          input_tokens: inp,
          output_tokens: out,
          free_tokens: freeT,
          cost_usd: costUsd,
          cost_vnd: costVnd
        };
      });
    }

    // Total usage query for DeepSeek paid models
    const totalSql = `SELECT COALESCE(SUM(CASE WHEN LOWER(model) LIKE '%deepseek%' THEN input_tokens ELSE 0 END), 0)::bigint as total_ds_input, COALESCE(SUM(CASE WHEN LOWER(model) LIKE '%deepseek%' THEN output_tokens ELSE 0 END), 0)::bigint as total_ds_output FROM sessions;`;
    const totalRaw = execSync(`docker exec -i goclaw-postgres-1 psql -U goclaw -d goclaw -t -A -c "${totalSql}" 2>/dev/null`).toString().trim();

    if (totalRaw) {
      const [tIn, tOut] = totalRaw.split('|').map(Number);
      totalSpentUsd = ((tIn || 0) * 0.00000014) + ((tOut || 0) * 0.00000028);
      totalSpentVnd = Math.round(totalSpentUsd * 25000);
    }
  } catch (err) {
    log('TokenReport DB query error:', err.message);
  }

  const remainingVnd = Math.max(0, totalDepositedVnd - totalSpentVnd);
  const remainingUsd = Math.max(0, totalDepositedUsd - totalSpentUsd);
  const percentRemaining = totalDepositedVnd > 0 ? Number(((remainingVnd / totalDepositedVnd) * 100).toFixed(1)) : 0;

  let statusEmoji = '🟢';
  if (percentRemaining < 20) statusEmoji = '⚠️';
  if (percentRemaining < 5) statusEmoji = '🚨';

  let dailyLines = dailyUsage.map(d => {
    let line = `• <b>${d.date_vn}:</b> `;
    if (d.input_tokens > 0 || d.output_tokens > 0) {
      line += `DeepSeek: ${d.input_tokens.toLocaleString('vi-VN')} in | ${d.output_tokens.toLocaleString('vi-VN')} out ➔ <b>~${d.cost_vnd.toLocaleString('vi-VN')}đ ($${d.cost_usd.toFixed(2)})</b>`;
    }
    if (d.free_tokens > 0) {
      if (d.input_tokens > 0) line += ` | `;
      line += `Gemini/Gemma: ${d.free_tokens.toLocaleString('vi-VN')} tokens (<b>0đ Miễn phí</b>)`;
    }
    if (d.input_tokens === 0 && d.output_tokens === 0 && d.free_tokens === 0) {
      line += `Chưa sử dụng token nào`;
    }
    return line;
  }).join('\n');
  if (!dailyLines) dailyLines = '• Chưa có lịch sử tiêu thụ.';

  let depositLines = deposits.map(dep => 
    `• <b>${new Date(dep.date || Date.now()).toLocaleDateString('vi-VN')}:</b> Nạp <b>${Number(dep.amount_vnd || 0).toLocaleString('vi-VN')}đ</b> từ <i>${escHtml(dep.source || 'Đại lý')}</i> (${escHtml(dep.notes || 'Nạp ngân sách')})`
  ).join('\n');

  const report_text = 
    `📊 <b>BÁO CÁO THU CHI & NGÂN SÁCH TOKEN AI (CHÍNH XÁC)</b>\n\n` +
    `💰 <b>1. CÁN CÂN NGÂN SÁCH DEEPSEEK (SỐ DƯ)</b>\n` +
    `• <b>Tổng tiền đã nạp:</b> ${totalDepositedVnd.toLocaleString('vi-VN')} VNĐ ($${totalDepositedUsd.toFixed(2)})\n` +
    `• <b>Đã tiêu thụ DeepSeek:</b> ~${totalSpentVnd.toLocaleString('vi-VN')} VNĐ ($${totalSpentUsd.toFixed(2)})\n` +
    `• <b>Số dư tài khoản DeepSeek còn lại:</b> <b>${remainingVnd.toLocaleString('vi-VN')} VNĐ</b> ($${remainingUsd.toFixed(2)})\n` +
    `• <b>Tỷ lệ còn lại:</b> <b>${percentRemaining}%</b> ${statusEmoji}\n\n` +
    `📈 <b>2. NHẬT KÝ TIÊU THỤ THEO NGÀY</b>\n` +
    `${dailyLines}\n\n` +
    `📥 <b>3. LỊCH SỬ NẠP TIỀN</b>\n` +
    `${depositLines}\n\n` +
    `💡 <b>4. DỰ BÁO & LỜI KHUYÊN</b>\n` +
    `• <b>Google Gemini & Gemma:</b> 0đ (100% Free Tier - Không tốn ngân sách).\n` +
    `• <b>DeepSeek (deepseek-chat / v4-pro):</b> Tính phí thực tế ~$0.14/1M input (~3.5đ/1k), ~$0.28/1M output (~7đ/1k).\n` +
    `• Số dư DeepSeek của anh Huy hiện còn tới **$${remainingUsd.toFixed(2)} (~${remainingVnd.toLocaleString('vi-VN')}đ)**, đủ dùng an toàn lâu dài!`;

  return {
    total_deposited_vnd: totalDepositedVnd,
    total_deposited_usd: totalDepositedUsd,
    total_spent_vnd: totalSpentVnd,
    total_spent_usd: totalSpentUsd,
    remaining_vnd: remainingVnd,
    remaining_usd: remainingUsd,
    percent_remaining: percentRemaining,
    daily_usage: dailyUsage,
    deposits: deposits,
    report_text
  };
}

function doAddDeposit(source, amount_vnd, amount_usd, notes) {
  const ledger = readTokenLedger();
  if (!Array.isArray(ledger.deposits)) ledger.deposits = [];
  const vnd = Number(amount_vnd) || 0;
  const usd = Number(amount_usd) || (vnd / 25000);
  const newDep = {
    id: ledger.deposits.length + 1,
    date: new Date().toISOString(),
    source: source || 'Nạp tiền AI API',
    amount_vnd: vnd,
    amount_usd: Math.round(usd * 100) / 100,
    notes: notes || 'Nạp ngân sách mới'
  };
  ledger.deposits.push(newDep);
  writeTokenLedger(ledger);
  return newDep;
}

async function checkLowTokenAlert() {
  try {
    const report = await doGetTokenReport();
    if (report.percent_remaining < 20) {
      const state = readJson(STATE_FILE, {}) || {};
      const today = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
      if (state.last_token_low_alert !== today) {
        const text = `⚠️ <b>CẢNH BÁO NGÂN SÁCH TOKEN SẮP HẾT!</b>\n\n` +
          `• <b>Số dư còn lại:</b> <b>${report.remaining_vnd.toLocaleString('vi-VN')} VNĐ</b> ($${report.remaining_usd.toFixed(2)})\n` +
          `• <b>Tỷ lệ còn lại:</b> <b>${report.percent_remaining}%</b>\n\n` +
          `👉 Vui lòng nạp thêm Token để đảm bảo Chatbot AI goClaw hoạt động liên tục!`;
        const ok = await sendTelegramDirect(text);
        if (ok) {
          writeJson(STATE_FILE, { ...state, last_token_low_alert: today });
        }
      }
    }
  } catch (err) {
    log('LowTokenAlert ERROR:', err.message);
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

  server.registerTool('get_token_usage_report', {
    title: 'Báo cáo thu chi token AI',
    description: 'Trả về báo cáo tổng quan số lượng token tiêu thụ, chi phí quy đổi VNĐ/USD, số dư còn lại, và lịch sử nạp tiền. Dùng khi người dùng gõ "Token" hoặc yêu cầu xem báo cáo chi phí AI.',
    inputSchema: {},
  }, async () => {
    log('get_token_usage_report');
    const r = await doGetTokenReport();
    return { content: [{ type: 'text', text: r.report_text }] };
  });

  return server;
}

// ── HTTP (streamable-http, stateless) ──
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mcp',
    tools: ['update_hero', 'crm_stats', 'add_note', 'get_new_leads_since_last_check', 'check_user_role', 'get_token_usage_report'],
    time: new Date().toISOString()
  });
});

app.get('/api/admin/token-ledger', async (req, res) => {
  try {
    const report = await doGetTokenReport();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/token-ledger/deposit', (req, res) => {
  try {
    const { source, amount_vnd, amount_usd, notes } = req.body;
    const newDep = doAddDeposit(source, amount_vnd, amount_usd, notes);
    res.json({ success: true, deposit: newDep });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

  // Automatic 30s ticker: 0-cost, direct Telegram notification for instant delivery
  setInterval(() => {
    doNewLeads().catch((err) => log('AutoLeadCheck ERROR:', err.message));
    checkLowTokenAlert().catch((err) => log('CheckLowTokenAlert ERROR:', err.message));
  }, 30000);
});
