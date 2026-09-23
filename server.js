/**
 * CHIRO.VN — Production Express server
 * -----------------------------------------------------------
 *  • Serves the static site from ./public  (never the repo root,
 *    so .env / brain.db / *.py / google-sheets-script.js stay private)
 *  • /admin              → admin dashboard
 *  • /api/health         → uptime + db status
 *  • /api/products       → public product catalogue (from brain.db)
 *  • /api/business       → public business info  (from brain.db)
 *  • /api/admin/*        → CRM data, protected by ADMIN_SECRET_KEY
 *
 *  Config comes entirely from environment variables (see .env.example).
 */

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// The FIXED key shared with Google Apps Script (from .env). Changing the admin
// LOGIN password below does NOT change this, so the Sheet integration keeps working.
const APPSCRIPT_KEY = process.env.ADMIN_SECRET_KEY || '';

// The admin LOGIN password is stored (hashed) in this file so it can be changed
// at runtime from the admin panel. Falls back to APPSCRIPT_KEY on first run.
const AUTH_FILE = path.join(__dirname, 'admin-auth.json');

// Agent notification settings — editable from the admin panel (no coder needed).
const NOTIFY_CONFIG_FILE = path.join(__dirname, 'notify_config.json');
const NOTIFY_DEFAULT = { enabled: true, signal: 'all', window_minutes: 1440 };
function readNotifyConfig() {
  try { return { ...NOTIFY_DEFAULT, ...JSON.parse(fs.readFileSync(NOTIFY_CONFIG_FILE, 'utf8')) }; }
  catch (e) { return { ...NOTIFY_DEFAULT }; }
}

const PUBLIC_DIR = path.join(__dirname, 'public');
const DB_PATH = process.env.BRAIN_DB_PATH
  ? path.resolve(__dirname, process.env.BRAIN_DB_PATH)
  : path.join(__dirname, 'brain.db');

// ── Admin login password (hashed, changeable) ──
function hashPw(pw, salt) {
  return crypto.scryptSync(String(pw), salt, 32).toString('hex');
}
function saveLoginPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const rec = { salt, hash: hashPw(pw, salt), updatedAt: new Date().toISOString() };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(rec, null, 2), { mode: 0o600 });
  return rec;
}
function getAuthRecord() {
  try {
    return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  } catch (e) {
    // First run: initialize login password = the .env key
    return saveLoginPassword(APPSCRIPT_KEY);
  }
}
function verifyLoginPassword(pw) {
  if (!pw) return false;
  const rec = getAuthRecord();
  try {
    const a = Buffer.from(hashPw(pw, rec.salt), 'hex');
    const b = Buffer.from(rec.hash, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}

// ── Open the "second brain" (read-only). Site still runs if it's missing. ──
let db = null;
try {
  const Database = require('better-sqlite3');
  db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  console.log(`[brain.db] connected: ${DB_PATH}`);
} catch (err) {
  console.warn(`[brain.db] NOT connected (${err.message}). API data endpoints will return 503.`);
}

function requireDb(res) {
  if (!db) {
    res.status(503).json({ error: 'brain.db unavailable on this server' });
    return false;
  }
  return true;
}

// ── Admin auth: header "x-admin-key" (or ?key=) must match the login password ──
function requireAdmin(req, res, next) {
  const key = req.get('x-admin-key') || req.query.key || '';
  if (!verifyLoginPassword(key)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

app.disable('x-powered-by');
app.use(express.json());

// ─────────────────────────  API  ─────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: !!db,
    env: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

// Admin login → verify password, hand back the Apps Script integration key
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (!verifyLoginPassword(password)) {
    return res.status(401).json({ error: 'Sai mật khẩu quản trị' });
  }
  res.json({ ok: true, appscriptKey: APPSCRIPT_KEY });
});

// Change the admin login password (must be authenticated with the current one)
app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const np = String((req.body && req.body.newPassword) || '');
  if (np.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có tối thiểu 6 ký tự' });
  }
  saveLoginPassword(np);
  res.json({ ok: true });
});

// Agent notification config — read/update from the admin panel (no coder needed)
app.get('/api/admin/notify-config', requireAdmin, (req, res) => {
  res.json(readNotifyConfig());
});
app.post('/api/admin/notify-config', requireAdmin, (req, res) => {
  const cur = readNotifyConfig();
  const b = req.body || {};
  const cfg = {
    enabled: typeof b.enabled === 'boolean' ? b.enabled : cur.enabled,
    signal: ['all', 'paid', 'pending'].includes(b.signal) ? b.signal : cur.signal,
    window_minutes: Number.isFinite(b.window_minutes) ? b.window_minutes : cur.window_minutes,
    updated_at: new Date().toISOString(),
  };
  try {
    fs.writeFileSync(NOTIFY_CONFIG_FILE, JSON.stringify(cfg, null, 2));
    res.json({ ok: true, config: cfg });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Public: product catalogue
app.get('/api/products', (req, res) => {
  if (!requireDb(res)) return;
  try {
    const rows = db.prepare(
      'SELECT id, name, type, price, description, registered_count FROM products ORDER BY price ASC'
    ).all();
    res.json({ count: rows.length, products: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: business info blocks
app.get('/api/business', (req, res) => {
  if (!requireDb(res)) return;
  try {
    const rows = db.prepare('SELECT id, title, content FROM business ORDER BY id ASC').all();
    res.json({ count: rows.length, business: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: customers (protected)
app.get('/api/admin/customers', requireAdmin, (req, res) => {
  if (!requireDb(res)) return;
  try {
    const rows = db.prepare(
      'SELECT id, name, phone, zalo, email, registered_at FROM customers ORDER BY registered_at DESC'
    ).all();
    res.json({ count: rows.length, customers: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: orders (protected)
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  if (!requireDb(res)) return;
  try {
    const rows = db.prepare(`
      SELECT o.id, o.amount, o.status, o.order_date,
             c.name AS customer_name, c.phone AS customer_phone,
             p.name AS product_name
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN products  p ON p.id = o.product_id
      ORDER BY o.order_date DESC
    `).all();
    res.json({ count: rows.length, orders: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: quick stats (protected)
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  if (!requireDb(res)) return;
  try {
    const customers = db.prepare('SELECT COUNT(*) AS n FROM customers').get().n;
    const orders = db.prepare('SELECT COUNT(*) AS n FROM orders').get().n;
    const revenue = db.prepare("SELECT COALESCE(SUM(amount),0) AS s FROM orders WHERE status IN ('paid','completed')").get().s;
    res.json({ customers, orders, revenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────  PAGES  ────────────────────────
// Friendly /admin route
app.get('/admin', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin.html')));

// Static site (only ./public is exposed). ".html" lets /foo serve foo.html
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

// Root → landing page
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

// 404 fallback
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'not found' });
  res.status(404).sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 chiro.vn server listening on http://0.0.0.0:${PORT}`);
});
