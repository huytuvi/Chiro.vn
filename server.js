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
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || '';
const PUBLIC_DIR = path.join(__dirname, 'public');
const DB_PATH = process.env.BRAIN_DB_PATH
  ? path.resolve(__dirname, process.env.BRAIN_DB_PATH)
  : path.join(__dirname, 'brain.db');

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

// ── Admin auth: header "x-admin-key" or ?key= must match ADMIN_SECRET_KEY ──
function requireAdmin(req, res, next) {
  const key = req.get('x-admin-key') || req.query.key || '';
  if (!ADMIN_SECRET_KEY || key !== ADMIN_SECRET_KEY) {
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
