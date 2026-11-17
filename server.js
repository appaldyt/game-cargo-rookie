// Cargo Rookie IAS — server game + rekap skor per event (Node.js >= 22, tanpa dependensi runtime).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const PUBLIC = path.join(ROOT, 'public');
const VENDOR = { '/vendor/three.module.min.js': path.join(ROOT, 'node_modules/three/build/three.module.min.js') };

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'cargo-rookie.db'));
db.exec(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY, event TEXT NOT NULL, nama TEXT NOT NULL, nip TEXT, unit TEXT, jabatan TEXT,
  penempatan TEXT, tentang TEXT, score INTEGER, benar INTEGER, total INTEGER, akurasi INTEGER,
  z_briefing INTEGER, z_sortir INTEGER, z_direksi INTEGER, z_dispatch INTEGER, kartu INTEGER,
  durasi INTEGER, predikat TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_scores_event ON scores(event, score DESC);
`);

const COLS = ['id', 'event', 'nama', 'nip', 'unit', 'jabatan', 'penempatan', 'tentang', 'score', 'benar', 'total',
  'akurasi', 'z_briefing', 'z_sortir', 'z_direksi', 'z_dispatch', 'kartu', 'durasi', 'predikat'];
const NUM = new Set(['score', 'benar', 'total', 'akurasi', 'z_briefing', 'z_sortir', 'z_direksi', 'z_dispatch', 'kartu', 'durasi']);
const insert = db.prepare(`INSERT OR IGNORE INTO scores (${COLS.join(',')}) VALUES (${COLS.map(() => '?').join(',')})`);
const qBoard = db.prepare('SELECT id, nama, unit, score FROM scores WHERE event = ? ORDER BY score DESC, durasi ASC LIMIT 10');
const qEvents = db.prepare(`SELECT event, COUNT(*) AS peserta, ROUND(AVG(score)) AS rata_skor, ROUND(AVG(akurasi)) AS rata_akurasi,
  MAX(created_at) AS terakhir FROM scores GROUP BY event ORDER BY terakhir DESC`);
const qRows = db.prepare('SELECT * FROM scores WHERE event = ? ORDER BY score DESC, durasi ASC');
const qDel = db.prepare('DELETE FROM scores WHERE id = ?');

const cleanEv = s => String(s || '').toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 24);
const str = (v, n = 120) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const int = (v, lo = 0, hi = 100000) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));

// Pembatas laju sederhana per IP untuk kiriman skor
const hits = new Map();
function limited(ip) {
  const now = Date.now(), h = (hits.get(ip) || []).filter(t => now - t < 60000);
  h.push(now); hits.set(ip, h);
  if (hits.size > 5000) hits.clear();
  return h.length > 20;
}

function send(res, code, body, type = 'application/json; charset=utf-8', extra = {}) {
  res.writeHead(code, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', ...extra });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readJson(req, max = 8192) {
  return new Promise((ok, bad) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > max) { bad(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { ok(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (e) { bad(e); } });
    req.on('error', bad);
  });
}
function isAdmin(req) {
  if (!ADMIN_PASSWORD) return false;
  const m = /^Basic (.+)$/.exec(req.headers.authorization || '');
  if (!m) return false;
  const want = Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`), got = Buffer.from(Buffer.from(m[1], 'base64').toString('utf8'));
  return want.length === got.length && crypto.timingSafeEqual(want, got);
}
const askAuth = res => send(res, 401, ADMIN_PASSWORD ? 'Login diperlukan' : 'Admin nonaktif: set ADMIN_PASSWORD', 'text/plain; charset=utf-8',
  ADMIN_PASSWORD ? { 'WWW-Authenticate': 'Basic realm="Rekap Cargo Rookie", charset="UTF-8"' } : {});

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
function serveFile(res, file, cache) {
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, 'Not found', 'text/plain');
    send(res, 200, buf, MIME[path.extname(file)] || 'application/octet-stream', { 'Cache-Control': cache || 'no-cache' });
  });
}
function csv(rows) {
  const head = ['Waktu (UTC)', 'Kode Event', 'Nama', 'NIP', 'Unit Kerja', 'Jabatan', 'Penempatan', 'Tentang Saya', 'Skor', 'Benar', 'Total Soal',
    'Akurasi (%)', 'Skor Briefing', 'Skor Sortir', 'Skor Direksi', 'Skor Dispatch', 'Kartu Info', 'Durasi (detik)', 'Predikat'];
  const keys = ['created_at', 'event', 'nama', 'nip', 'unit', 'jabatan', 'penempatan', 'tentang', 'score', 'benar', 'total', 'akurasi',
    'z_briefing', 'z_sortir', 'z_direksi', 'z_dispatch', 'kartu', 'durasi', 'predikat'];
  const cell = v => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  return '﻿' + [head.map(cell).join(','), ...rows.map(r => keys.map(k => cell(r[k])).join(','))].join('\r\n');
}

process.on('uncaughtException', err => { console.error('Uncaught Exception:', err); process.exit(1); });
process.on('unhandledRejection', err => { console.error('Unhandled Rejection:', err); });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  try {
    if (p === '/healthz') return send(res, 200, { ok: true });

    if (p === '/api/scores' && req.method === 'POST') {
      if (limited(ip)) return send(res, 429, { ok: false, error: 'Terlalu banyak kiriman, coba lagi sebentar.' });
      const d = await readJson(req);
      const rec = {};
      for (const k of COLS) rec[k] = NUM.has(k) ? int(d[k]) : str(d[k], k === 'tentang' ? 200 : 80);
      rec.event = cleanEv(d.event); rec.id = str(d.id, 40).replace(/[^a-z0-9]/gi, '');
      rec.akurasi = int(d.akurasi, 0, 100);
      if (!rec.event || !rec.nama || rec.id.length < 6) return send(res, 400, { ok: false, error: 'Data tidak lengkap' });
      insert.run(...COLS.map(k => rec[k]));
      return send(res, 200, { ok: true });
    }
    if (p === '/api/leaderboard' && req.method === 'GET') {
      const me = url.searchParams.get('me') || '';
      const rows = qBoard.all(cleanEv(url.searchParams.get('event'))).map(r => ({ nama: r.nama, unit: r.unit, score: r.score, me: r.id === me }));
      return send(res, 200, { ok: true, rows });
    }

    if (p === '/admin' || p.startsWith('/api/admin/')) {
      if (!isAdmin(req)) return askAuth(res);
      if (p === '/admin') return serveFile(res, path.join(PUBLIC, 'admin.html'));
      if (p === '/api/admin/events') return send(res, 200, { ok: true, events: qEvents.all() });
      if (p === '/api/admin/scores') return send(res, 200, { ok: true, rows: qRows.all(cleanEv(url.searchParams.get('event'))) });
      if (p === '/api/admin/export.csv') {
        const ev = cleanEv(url.searchParams.get('event'));
        return send(res, 200, csv(qRows.all(ev)), 'text/csv; charset=utf-8', { 'Content-Disposition': `attachment; filename="rekap-${ev || 'event'}.csv"` });
      }
      const m = /^\/api\/admin\/scores\/([a-z0-9]+)$/i.exec(p);
      if (m && req.method === 'DELETE') { qDel.run(m[1]); return send(res, 200, { ok: true }); }
      return send(res, 404, { ok: false });
    }

    if (VENDOR[p]) return serveFile(res, VENDOR[p], 'public, max-age=31536000, immutable');
    const file = path.normalize(path.join(PUBLIC, p === '/' ? 'index.html' : p));
    if (!file.startsWith(PUBLIC + path.sep) || file.endsWith('admin.html')) return send(res, 404, 'Not found', 'text/plain');
    return serveFile(res, file);
  } catch (e) {
    return send(res, 400, { ok: false, error: 'Permintaan tidak valid' });
  }
});
server.listen(PORT, '0.0.0.0', () => console.log(`Cargo Rookie berjalan di port ${PORT} · data: ${DATA_DIR} · admin: ${ADMIN_PASSWORD ? 'aktif' : 'NONAKTIF (set ADMIN_PASSWORD)'}`));
