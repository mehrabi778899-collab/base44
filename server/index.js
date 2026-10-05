import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, createHash, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

if (!process.env.ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD is required');
const path = process.env.DB_PATH || '/data/freight.sqlite';
mkdirSync(dirname(path), { recursive: true });
const db = new DatabaseSync(path);
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS QuoteRequest (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'New', createdAt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS Shipment (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, origin TEXT NOT NULL, destination TEXT NOT NULL, status TEXT NOT NULL, events TEXT NOT NULL, updatedAt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ContactMessage (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, message TEXT NOT NULL, createdAt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS AdminSession (token TEXT PRIMARY KEY, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS Settings (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL);`);
const defaultSettings = { brandFa: 'نام برند', brandEn: '[BRAND NAME]', phone: '', email: '', address: '', whatsapp: '', instagram: '', linkedin: '', telegram: '' };
db.prepare('INSERT OR IGNORE INTO Settings VALUES (1, ?)').run(JSON.stringify(defaultSettings));
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Content-Type-Options', 'nosniff');
  if (!['GET', 'HEAD'].includes(req.method) && req.get('X-App-Request') !== 'freight') return res.status(403).json({ error: 'Invalid request origin' });
  next();
});
const buckets = new Map();
function limit(key, max, period) {
  return (req, res, next) => {
    const k = `${key}:${req.ip}`;
    const now = Date.now();
    let item = buckets.get(k);
    if (!item || item.until < now) { item = { count: 0, until: now + period }; buckets.set(k, item); }
    if (++item.count > max) return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    next();
  };
}
const cleanup = setInterval(() => { const now = Date.now(); for (const [key, item] of buckets) if (item.until < now) buckets.delete(key); db.prepare('DELETE FROM AdminSession WHERE expires < ?').run(now); }, 60000);
cleanup.unref();
const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const cookieToken = (req) => (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('freight_session='))?.slice(16) || '';
function admin(req, res, next) {
  const token = cookieToken(req);
  const session = token && db.prepare('SELECT expires FROM AdminSession WHERE token = ?').get(hashToken(token));
  if (!session || session.expires < Date.now()) return res.status(401).json({ error: 'Admin sign-in required' });
  next();
}
const salt = randomBytes(16);
const passwordHash = scryptSync(process.env.ADMIN_PASSWORD, salt, 64);
app.post('/api/admin/login', limit('login', 8, 15 * 60000), (req, res) => {
  const { username, password } = req.body;
  if (typeof password !== 'string' || password.length > 256 || username !== 'admin' || !timingSafeEqual(scryptSync(password, salt, 64), passwordHash)) return res.status(401).json({ error: 'Incorrect username or password' });
  const token = randomBytes(32).toString('hex');
  db.prepare('INSERT INTO AdminSession VALUES (?, ?)').run(hashToken(token), Date.now() + 8 * 3600000);
  res.cookie('freight_session', token, { httpOnly: true, sameSite: 'lax', secure: req.secure, maxAge: 8 * 3600000, path: '/api' });
  res.json({ authenticated: true });
});
app.get('/api/admin/session', admin, (req, res) => res.json({ authenticated: true }));
app.post('/api/admin/logout', (req, res) => { db.prepare('DELETE FROM AdminSession WHERE token = ?').run(hashToken(cookieToken(req))); res.clearCookie('freight_session', { path: '/api' }); res.json({ ok: true }); });
app.get('/api/settings', (req, res) => res.json({ ...defaultSettings, ...JSON.parse(db.prepare('SELECT data FROM Settings WHERE id=1').get().data) }));
const clean = (v, max = 200) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const emailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
app.post('/api/quotes', limit('quote', 15, 3600000), (req, res) => {
  const data = {};
  for (const key of ['name', 'company', 'phone', 'email', 'service', 'origin', 'destination', 'cargo', 'weight', 'truck', 'pickup', 'notes']) data[key] = clean(req.body[key], key === 'notes' ? 3000 : 200);
  if (!data.name || !data.phone || !emailValid(data.email) || !data.origin || !data.destination || !data.cargo || !data.pickup || !/^\d{4}-\d{2}-\d{2}$/.test(data.pickup) || Number.isNaN(Date.parse(data.pickup)) || !Number.isFinite(Number(data.weight)) || Number(data.weight) <= 0 || !['domestic', 'international'].includes(data.service) || !['FTL', 'LTL', 'refrigerated'].includes(data.truck)) return res.status(400).json({ error: 'Please complete all required fields with valid information.' });
  const result = db.prepare('INSERT INTO QuoteRequest (data, status, createdAt) VALUES (?, ?, ?)').run(JSON.stringify(data), 'New', new Date().toISOString());
  res.status(201).json({ id: Number(result.lastInsertRowid), status: 'New' });
});
app.post('/api/contact', limit('contact', 10, 3600000), (req, res) => {
  const name = clean(req.body.name), email = clean(req.body.email), message = clean(req.body.message, 3000);
  if (!name || !emailValid(email) || !message) return res.status(400).json({ error: 'Please enter your name, a valid email, and a message.' });
  db.prepare('INSERT INTO ContactMessage (name,email,message,createdAt) VALUES (?,?,?,?)').run(name, email, message, new Date().toISOString());
  res.status(201).json({ ok: true });
});
app.get('/api/shipments/:code', limit('tracking', 60, 60000), (req, res) => {
  const row = db.prepare('SELECT code,origin,destination,status,events,updatedAt FROM Shipment WHERE code = ?').get(clean(req.params.code).toUpperCase());
  if (!row) return res.status(404).json({ error: 'Shipment not found. Please check your tracking code.' });
  res.json({ ...row, events: JSON.parse(row.events) });
});
app.get('/api/posts', (req, res) => res.json([
  { id: 'tir-guide', category: 'international', titleFa: 'هر آنچه درباره حمل‌ونقل بین‌المللی TIR باید بدانید', titleEn: 'A practical guide to international TIR transport', date: '2026-09-18', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=85', bodyFa: 'TIR یک رویه ترانزیت گمرکی بین‌المللی است که عبور محموله‌های جاده‌ای از چند کشور را تسهیل می‌کند. استفاده از این رویه به مسیر، نوع کالا و عضویت کشورهای عبوری بستگی دارد.\n\nپیش از حمل، اسناد تجاری، فهرست بسته‌بندی و مدارک مورد نیاز گمرک را آماده کنید. اطلاعات فرستنده و گیرنده باید با اسناد حمل مطابقت داشته باشد.\n\nزمان عبور از مرز تحت تأثیر کنترل‌های گمرکی، تعطیلات و وضعیت مسیر است. برای برنامه‌ریزی دقیق، شرایط محموله و مقصد را با تیم حمل بررسی کنید.', bodyEn: 'TIR is an international customs transit procedure that facilitates road transport across several countries. Its availability depends on the route, goods, and participating countries.\n\nPrepare commercial documents, a packing list, and the relevant customs paperwork before dispatch. Sender and consignee details should match the transport documents.\n\nBorder transit times depend on inspections, public holidays, and road conditions. Confirm cargo and destination requirements with your transport team before scheduling.' },
  { id: 'ftl-or-ltl', category: 'planning', titleFa: 'بار کامل یا خرده‌بار؛ کدام برای شما مناسب است؟', titleEn: 'FTL or LTL: choosing the right road freight service', date: '2026-09-10', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=85', bodyFa: 'در حمل بار کامل (FTL)، ظرفیت کامیون به محموله شما اختصاص دارد. این انتخاب برای بارهای حجیم، زمان‌بندی حساس یا کالاهایی که نباید با بار دیگر ترکیب شوند مناسب است.\n\nدر حمل خرده‌بار (LTL)، فضای کامیون بین چند محموله تقسیم می‌شود. این روش برای حجم‌های کوچک‌تر اقتصادی‌تر است، اما ممکن است برای تجمیع و توزیع به زمان بیشتری نیاز داشته باشد.\n\nحجم، وزن، نوع بسته‌بندی و تاریخ تحویل را اعلام کنید تا گزینه مناسب پیشنهاد شود.', bodyEn: 'Full truckload (FTL) dedicates a truck to your cargo. It is suitable for larger loads, time-sensitive shipments, and goods that should not share space with other freight.\n\nLess than truckload (LTL) shares capacity between shipments. It can be economical for smaller loads but may require additional consolidation and distribution time.\n\nShare the dimensions, weight, packaging, and required delivery date to identify the right option.' },
  { id: 'cold-chain', category: 'refrigerated', titleFa: 'زنجیره سرد؛ حفظ کیفیت از مبدأ تا مقصد', titleEn: 'Cold chain: protecting quality from origin to destination', date: '2026-09-02', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=85', bodyFa: 'حمل یخچالی به برنامه‌ریزی دقیق دمای مورد نیاز کالا و استفاده از تجهیزات مناسب وابسته است. مواد غذایی و محصولات دارویی ممکن است الزامات متفاوتی داشته باشند.\n\nپیش از بارگیری، بازه دمایی، شیوه بسته‌بندی و الزامات ثبت دما باید مشخص شود. کاهش زمان توقف هنگام بارگیری و تخلیه به حفظ کیفیت کمک می‌کند.\n\nبرای هر محموله، مشخصات محصول را با تیم حمل در میان بگذارید تا تجهیزات و مسیر مناسب بررسی شود.', bodyEn: 'Refrigerated transport requires careful temperature planning and suitable equipment. Food and pharmaceutical products can have different requirements.\n\nDefine the required temperature range, packaging, and temperature-recording requirements before loading. Minimizing dwell time during loading and unloading helps maintain quality.\n\nShare product specifications with the transport team so equipment and routing can be assessed for each shipment.' }
]));
app.use('/api/admin', admin);
app.get('/api/admin/quotes', (req, res) => res.json(db.prepare('SELECT * FROM QuoteRequest ORDER BY id DESC').all().map(r => ({ ...r, data: JSON.parse(r.data) }))));
app.patch('/api/admin/quotes/:id', (req, res) => {
  if (!['New', 'Contacted', 'Closed'].includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
  const result = db.prepare('UPDATE QuoteRequest SET status = ? WHERE id = ?').run(req.body.status, Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Quote not found' });
  res.json({ ok: true });
});
app.get('/api/admin/contacts', (req, res) => res.json(db.prepare('SELECT * FROM ContactMessage ORDER BY id DESC').all()));
app.get('/api/admin/shipments', (req, res) => res.json(db.prepare('SELECT * FROM Shipment ORDER BY id DESC').all().map(r => ({ ...r, events: JSON.parse(r.events) }))));
const statuses = ['Loaded', 'In Transit', 'At Border', 'Customs', 'Delivered'];
app.post('/api/admin/shipments', (req, res) => {
  const code = clean(req.body.code, 64).toUpperCase(), origin = clean(req.body.origin), destination = clean(req.body.destination), status = clean(req.body.status);
  if (!/^[A-Z0-9-]{6,64}$/.test(code) || !origin || !destination || !statuses.includes(status)) return res.status(400).json({ error: 'Use a unique tracking code (6–64 letters, digits or hyphens), route, and valid status.' });
  const now = new Date().toISOString();
  try {
    const result = db.prepare('INSERT INTO Shipment (code,origin,destination,status,events,updatedAt) VALUES (?,?,?,?,?,?)').run(code, origin, destination, status, JSON.stringify([{ status, date: now }]), now);
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  } catch (e) { if (String(e).includes('UNIQUE')) return res.status(409).json({ error: 'This tracking code already exists.' }); throw e; }
});
app.patch('/api/admin/shipments/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM Shipment WHERE id = ?').get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Shipment not found' });
  const status = clean(req.body.status), origin = clean(req.body.origin), destination = clean(req.body.destination);
  if (!statuses.includes(status) || !origin || !destination) return res.status(400).json({ error: 'Invalid shipment details' });
  const now = new Date().toISOString(), events = JSON.parse(row.events);
  if (status !== row.status) events.push({ status, date: now });
  db.prepare('UPDATE Shipment SET origin=?, destination=?, status=?, events=?, updatedAt=? WHERE id=?').run(origin, destination, status, JSON.stringify(events), now, row.id);
  res.json({ ok: true });
});
app.put('/api/admin/settings', (req, res) => {
  const data = {}; for (const key of Object.keys(defaultSettings)) data[key] = clean(req.body[key], 300);
  if (!data.brandFa || !data.brandEn || (data.email && !emailValid(data.email)) || (data.phone && !/^\+?[\d\s()-]{7,30}$/.test(data.phone)) || (data.whatsapp && !/^\d{8,15}$/.test(data.whatsapp))) return res.status(400).json({ error: 'Enter both brand names and valid contact details. WhatsApp requires country code and digits only.' });
  for (const key of ['instagram', 'linkedin', 'telegram']) {
    if (!data[key]) continue;
    try { if (new URL(data[key]).protocol !== 'https:') throw new Error('Invalid URL'); }
    catch { return res.status(400).json({ error: 'Social profile links must be valid https URLs.' }); }
  }
  db.prepare('UPDATE Settings SET data=? WHERE id=1').run(JSON.stringify(data)); res.json(data);
});
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((error, req, res, next) => { console.error(error.message); res.status(error.status === 400 ? 400 : 500).json({ error: error.status === 400 ? 'Invalid request' : 'Something went wrong. Please try again.' }); });
app.listen(3001, '0.0.0.0', () => console.log('Freight API listening on 3001'));
