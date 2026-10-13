import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, createHash, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

if (!process.env.ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD is required');
const dbPath = process.env.DB_PATH || '/data/freight.sqlite';
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);

db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS Product (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL, price INTEGER NOT NULL, oldPrice INTEGER, description TEXT, images TEXT NOT NULL, scent TEXT, specs TEXT, stock INTEGER DEFAULT 0, featured INTEGER DEFAULT 0, bestseller INTEGER DEFAULT 0, isNew INTEGER DEFAULT 1, createdAt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS Review (id INTEGER PRIMARY KEY AUTOINCREMENT, productId INTEGER NOT NULL, name TEXT NOT NULL, rating INTEGER NOT NULL, text TEXT NOT NULL, approved INTEGER DEFAULT 0, createdAt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS DiscountCode (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, type TEXT NOT NULL, value INTEGER NOT NULL, maxUses INTEGER, usedCount INTEGER DEFAULT 0, expiresAt TEXT, active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS Orders (id INTEGER PRIMARY KEY AUTOINCREMENT, items TEXT NOT NULL, subtotal INTEGER NOT NULL, shippingCost INTEGER NOT NULL, discount INTEGER DEFAULT 0, total INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', customerName TEXT NOT NULL, phone TEXT NOT NULL, province TEXT, city TEXT, address TEXT NOT NULL, postalCode TEXT, shippingMethod TEXT, giftWrap INTEGER DEFAULT 0, giftMessage TEXT, paymentMethod TEXT, trackingCode TEXT, receiptImage TEXT, createdAt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS User (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT UNIQUE NOT NULL, name TEXT, otpCode TEXT, otpExpires INTEGER, sessionToken TEXT, sessionExpires INTEGER);
CREATE TABLE IF NOT EXISTS AdminSession (token TEXT PRIMARY KEY, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS Settings (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS NotifyRequest (id INTEGER PRIMARY KEY AUTOINCREMENT, productId INTEGER NOT NULL, phone TEXT NOT NULL, createdAt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ContactMessage (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, message TEXT NOT NULL, createdAt TEXT NOT NULL);`);

const defaultSettings = { brandName: 'گرم‌نور', phone: '', whatsapp: '', instagram: '', telegram: '', email: '', address: '', workingHours: 'شنبه تا پنجشنبه، ۹ تا ۱۸', shippingCost: 50000, freeShippingThreshold: 500000, bikeCost: 30000, bikeCity: '', zarinpalMerchantId: '' };
db.prepare('INSERT OR IGNORE INTO Settings VALUES (1, ?)').run(JSON.stringify(defaultSettings));

const img = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
const seedProducts = [
  { slug:'sham-sedar', name:'شمع سدر', category:'candle', price:450000, description:'شمع دست‌ساز با موم سویا و رایحه گرم سدر، برای آرامش و حس نزدیکی به طبیعت. هر شمع با دست و با عشق آماده می‌شود.', images:JSON.stringify([img('1631021967299-59d54f546248'),img('1612293905607-b003de9e54fb')]), scent:'سدر', specs:JSON.stringify({waxType:'سویا',scent:'سدر',weight:'۲۰۰ گرم',burnTime:'۴۰ ساعت',container:'شیشه‌ای',safety:'از شمع دور از باد و کودکان نگه‌داری کنید.'}), stock:15, featured:1, bestseller:1, isNew:0 },
  { slug:'sham-vanil', name:'شمع وانیل', category:'candle', price:380000, description:'رایحه شیرین وانیل، گرم و دل‌نشین. مناسب برای فضای خانه و آرامش شب‌های سرد.', images:JSON.stringify([img('1612293905607-b003de9e54fb'),img('1612179543058-ab74d388e0ce')]), scent:'وانیل', specs:JSON.stringify({waxType:'سویا',scent:'وانیل',weight:'۱۸۰ گرم',burnTime:'۳۵ ساعت',container:'شیشه‌ای',safety:'فتیله را کوتاه نگه‌دارید.'}), stock:20, featured:0, bestseller:0, isNew:1 },
  { slug:'sham-lavender', name:'شمع لاوندر', category:'candle', price:420000, description:'رایحه آرامش‌بخش لاوندر برای شب‌های راحت و خواب عمیق. موم پارافین باکیفیت.', images:JSON.stringify([img('1603905179139-db12ab535ca9'),img('1572726729207-a78d6feb18d7')]), scent:'لاوندر', specs:JSON.stringify({waxType:'پارافین',scent:'لاوندر',weight:'۲۰۰ گرم',burnTime:'۳۸ ساعت',container:'سرامیکی',safety:'روی سطح صاف قرار دهید.'}), stock:12, featured:1, bestseller:0, isNew:0 },
  { slug:'sham-rose', name:'شمع گل رز', category:'candle', price:480000, oldPrice:550000, description:'رایحه کلاسیک و رمانتیک گل رز، با موم سویا و ظرف شیشه‌ای زیبا. هدیه‌ای عالی برای کسانی که دوستشان دارید.', images:JSON.stringify([img('1572726729207-a78d6feb18d7'),img('1631021967299-59d54f546248')]), scent:'رز', specs:JSON.stringify({waxType:'سویا',scent:'رز',weight:'۲۲۰ گرم',burnTime:'۴۵ ساعت',container:'شیشه‌ای',safety:'بیش از ۴ ساعت یک‌بار روشن نگذارید.'}), stock:8, featured:0, bestseller:1, isNew:0 },
  { slug:'sham-sandalwood', name:'شمع چوب صندل', category:'candle', price:520000, description:'رایحه چوبی و گرم صندل، برای مدیتیشن و آرامش عمیق. ظرف سرامیکی قابل استفاده مجدد.', images:JSON.stringify([img('1612179543058-ab74d388e0ce'),img('1603905179139-db12ab535ca9')]), scent:'چوب صندل', specs:JSON.stringify({waxType:'سویا',scent:'چوب صندل',weight:'۲۵۰ گرم',burnTime:'۵۰ ساعت',container:'سرامیکی',safety:'روی سطح غیرقابل‌اشتعال قرار دهید.'}), stock:5, featured:0, bestseller:0, isNew:1 },
  { slug:'warmer-electric-white', name:'وارمر برقی سفید', category:'warmer', price:650000, description:'وارمر برقی با طراحی مینیمال سفید، برای ذوب وکس ملت و شمع. بدون شعله و کاملاً امن.', images:JSON.stringify([img('1603905179139-db12ab535ca9'),img('1612179543058-ab74d388e0ce')]), scent:'', specs:JSON.stringify({voltage:'۲۲۰ ولت',plug:'استاندارد ایران',power:'۲۵ وات',material:'سرامیک',usage:'شمع یا وکس ملت را در ظرف بالایی قرار دهید و دستگاه را روشن کنید.'}), stock:10, featured:1, bestseller:0, isNew:0 },
  { slug:'warmer-ceramic', name:'وارمر شمعی سرامیکی', category:'warmer', price:580000, description:'وارمر سرامیکی دست‌ساز برای گرم کردن شمع و پخش رایحه. طراحی زیبا و کاربردی.', images:JSON.stringify([img('1572726729207-a78d6feb18d7'),img('1631021967299-59d54f546248')]), scent:'', specs:JSON.stringify({voltage:'۲۲۰ ولت',plug:'استاندارد ایران',power:'۲۰ وات',material:'سرامیک',usage:'شمع را روی سطح بالایی بگذارید و روشن کنید.'}), stock:7, featured:0, bestseller:1, isNew:0 },
  { slug:'warmer-gold', name:'وارمر وکس ملت طلایی', category:'warmer', price:720000, oldPrice:850000, description:'وارمر لوکس با بدنه فلزی طلایی، برای ذوب وکس ملت. تزئین دکوری برای خانه.', images:JSON.stringify([img('1612179543058-ab74d388e0ce'),img('1603905179139-db12ab535ca9')]), scent:'', specs:JSON.stringify({voltage:'۲۲۰ ولت',plug:'استاندارد ایران',power:'۳۰ وات',material:'فلز',usage:'وکس ملت را در ظرف بالایی بگذارید.'}), stock:3, featured:0, bestseller:0, isNew:1 },
  { slug:'vaseline-rose', name:'وازلین معطر رز', category:'vaseline', price:180000, description:'وازلین خالص معطر با عصاره رز، برای نرم و مرطوب کردن پوست. مناسب انواع پوست.', images:JSON.stringify([img('1572726729207-a78d6feb18d7'),img('1612179543058-ab74d388e0ce')]), scent:'رز', specs:JSON.stringify({volume:'۵۰ میلی‌لیتر',ingredients:'وازلین خالص، عصاره رز',productionDate:'۱۴۰۳',expiryDate:'۱۴۰۶',usage:'روی پوست تمیز بمالید.',healthLicense:'شماره مجوز بهداشت: ۴۵/۱۲۳۴۵'}), stock:30, featured:1, bestseller:0, isNew:0 },
  { slug:'vaseline-lip-cocoa', name:'وازلین لب کاکائویی', category:'vaseline', price:120000, description:'وازلین لب با کره کاکائو، برای لب‌های نرم و آبرسانی شده. طعم و بوی خوش کاکائو.', images:JSON.stringify([img('1631021967299-59d54f546248'),img('1612293905607-b003de9e54fb')]), scent:'کاکائو', specs:JSON.stringify({volume:'۱۵ میلی‌لیتر',ingredients:'وازلین خالص، کره کاکائو',productionDate:'۱۴۰۳',expiryDate:'۱۴۰۶',usage:'روی لب بمالید.',healthLicense:'شماره مجوز بهداشت: ۴۵/۶۷۸۹۰'}), stock:25, featured:0, bestseller:1, isNew:0 },
  { slug:'vaseline-aloe', name:'وازلین بهداشتی آلوئه‌ورا', category:'vaseline', price:150000, description:'وازلین بهداشتی با عصاره آلوئه‌ورا، برای آبرسانی عمیق پوست. بدون عطر و مناسب پوست حساس.', images:JSON.stringify([img('1603905179139-db12ab535ca9'),img('1572726729207-a78d6feb18d7')]), scent:'بدون عطر', specs:JSON.stringify({volume:'۱۰۰ میلی‌لیتر',ingredients:'وازلین خالص، عصاره آلوئه‌ورا',productionDate:'۱۴۰۳',expiryDate:'۱۴۰۶',usage:'روی پوست تمیز بمالید.',healthLicense:'شماره مجوز بهداشت: ۴۵/۱۱۱۱۱'}), stock:0, featured:0, bestseller:0, isNew:1 },
  { slug:'gift-set', name:'پک هدیه شمع و وارمر', category:'gift', price:1200000, oldPrice:1500000, description:'ست کامل هدیه: شمع سدر، وارمر برقی و وازلین معطر رز. بسته‌بندی ویژه هدیه با امکان کادوپیچی.', images:JSON.stringify([img('1612293905607-b003de9e54fb'),img('1631021967299-59d54f546248'),img('1603905179139-db12ab535ca9')]), scent:'ترکیبی', specs:JSON.stringify({contents:'شمع سدر، وارمر برقی سفید، وازلین معطر رز'}), stock:5, featured:1, bestseller:1, isNew:0 },
];
if (!db.prepare('SELECT COUNT(*) as c FROM Product').get().c) {
  const now = new Date().toISOString();
  for (const p of seedProducts) db.prepare('INSERT INTO Product (slug,name,category,price,oldPrice,description,images,scent,specs,stock,featured,bestseller,isNew,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(p.slug,p.name,p.category,p.price,p.oldPrice||null,p.description,p.images,p.scent,p.specs,p.stock,p.featured,p.bestseller,p.isNew,now);
  db.prepare("INSERT INTO Review (productId,name,rating,text,approved,createdAt) VALUES (1,'مریم ر.',5,'عالی بود، رایحه‌اش کل خانه رو پر کرد. کیفیتش خیلی خوبه.',1,?)").run(now);
  db.prepare("INSERT INTO Review (productId,name,rating,text,approved,createdAt) VALUES (1,'علی ک.',4,'شمع خوبیه ولی قیمتش کمی بالاست.',1,?)").run(now);
  db.prepare("INSERT INTO Review (productId,name,rating,text,approved,createdAt) VALUES (4,'سارا م.',5,'عاشق رایحه رزش شدم! حتماً دوباره می‌خرم.',1,?)").run(now);
  db.prepare("INSERT INTO DiscountCode (code,type,value,maxUses,usedCount,expiresAt,active) VALUES ('WELCOME10','percent',10,100,0,'2027-12-31',1)").run();
}

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Content-Type-Options', 'nosniff');
  if (!['GET','HEAD'].includes(req.method) && req.get('X-App-Request') !== 'garmnoor') return res.status(403).json({ error: 'Invalid request origin' });
  next();
});

const buckets = new Map();
function limit(key, max, period) {
  return (req, res, next) => {
    const k = `${key}:${req.ip}`, now = Date.now();
    let item = buckets.get(k);
    if (!item || item.until < now) { item = { count: 0, until: now + period }; buckets.set(k, item); }
    if (++item.count > max) return res.status(429).json({ error: 'درخواست‌های زیادی ارسال کردید. کمی بعد دوباره تلاش کنید.' });
    next();
  };
}
setInterval(() => { const now = Date.now(); for (const [k,v] of buckets) if (v.until < now) buckets.delete(k); db.prepare('DELETE FROM AdminSession WHERE expires < ?').run(now); db.prepare('DELETE FROM User WHERE otpExpires < ? AND otpCode IS NOT NULL').run(now); }, 60000).unref();

const hashToken = t => createHash('sha256').update(t).digest('hex');
const cookieVal = (req, name) => (req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1) || '';

function admin(req, res, next) {
  const token = cookieVal(req, 'garmnoor_admin');
  const session = token && db.prepare('SELECT expires FROM AdminSession WHERE token=?').get(hashToken(token));
  if (!session || session.expires < Date.now()) return res.status(401).json({ error: 'برای دسترسی به پنل مدیریت وارد شوید.' });
  next();
}
function userAuth(req, res, next) {
  const token = cookieVal(req, 'garmnoor_user');
  const u = token && db.prepare('SELECT id,phone,name FROM User WHERE sessionToken=? AND sessionExpires>?').get(hashToken(token), Date.now());
  if (!u) return res.status(401).json({ error: 'برای این عملیات وارد شوید.' });
  req.user = u; next();
}

const salt = randomBytes(16);
const passwordHash = scryptSync(process.env.ADMIN_PASSWORD, salt, 64);
const clean = (v, max=2000) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const faNum = s => String(s||'').replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

// --- Admin Auth ---
app.post('/api/admin/login', limit('login',8,900000), (req,res) => {
  const { username, password } = req.body;
  if (username !== 'admin' || typeof password !== 'string' || password.length > 256 || !timingSafeEqual(scryptSync(password, salt, 64), passwordHash)) return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
  const token = randomBytes(32).toString('hex');
  db.prepare('INSERT INTO AdminSession VALUES (?,?)').run(hashToken(token), Date.now()+28800000);
  res.cookie('garmnoor_admin', token, { httpOnly:true, sameSite:'lax', secure:req.secure, maxAge:28800000, path:'/api' });
  res.json({ authenticated: true });
});
app.get('/api/admin/session', admin, (req,res) => res.json({ authenticated: true }));
app.post('/api/admin/logout', (req,res) => { db.prepare('DELETE FROM AdminSession WHERE token=?').run(hashToken(cookieVal(req,'garmnoor_admin'))); res.clearCookie('garmnoor_admin',{path:'/api'}); res.json({ ok:true }); });

// --- User Auth (OTP) ---
app.post('/api/auth/otp/send', limit('otp',5,300000), (req,res) => {
  const phone = clean(req.body.phone, 20);
  if (!/^09\d{9}$/.test(phone)) return res.status(400).json({ error: 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.' });
  const code = String(Math.floor(1000 + Math.random()*9000));
  db.prepare('INSERT INTO User (phone,otpCode,otpExpires) VALUES (?,?,?) ON CONFLICT(phone) DO UPDATE SET otpCode=excluded.otpCode, otpExpires=excluded.otpExpires').run(phone, code, Date.now()+120000);
  res.json({ ok: true, devCode: code });
});
app.post('/api/auth/otp/verify', limit('otp',10,300000), (req,res) => {
  const phone = clean(req.body.phone,20), code = clean(req.body.code,10);
  const u = db.prepare('SELECT id,name FROM User WHERE phone=? AND otpCode=? AND otpExpires>?').get(phone, code, Date.now());
  if (!u) return res.status(400).json({ error: 'کد تأیید اشتباه یا منقضی است.' });
  const token = randomBytes(32).toString('hex');
  db.prepare('UPDATE User SET sessionToken=?, sessionExpires=?, otpCode=NULL, otpExpires=NULL WHERE id=?').run(hashToken(token), Date.now()+2592000000, u.id);
  res.cookie('garmnoor_user', token, { httpOnly:true, sameSite:'lax', secure:req.secure, maxAge:2592000000, path:'/api' });
  res.json({ ok:true, user:{ id:u.id, phone, name:u.name } });
});
app.get('/api/auth/session', (req,res) => {
  const token = cookieVal(req,'garmnoor_user');
  const u = token && db.prepare('SELECT id,phone,name FROM User WHERE sessionToken=? AND sessionExpires>?').get(hashToken(token), Date.now());
  if (!u) return res.json({ user: null });
  res.json({ user: u });
});
app.post('/api/auth/logout', (req,res) => { db.prepare('UPDATE User SET sessionToken=NULL, sessionExpires=NULL WHERE sessionToken=?').run(hashToken(cookieVal(req,'garmnoor_user'))); res.clearCookie('garmnoor_user',{path:'/api'}); res.json({ ok:true }); });
app.put('/api/auth/profile', userAuth, (req,res) => { const name = clean(req.body.name,100); if (!name) return res.status(400).json({error:'نام را وارد کنید.'}); db.prepare('UPDATE User SET name=? WHERE id=?').run(name, req.user.id); res.json({ ok:true, name }); });

// --- Products ---
function mapProduct(p) { return { ...p, images: JSON.parse(p.images), specs: JSON.parse(p.specs), oldPrice: p.oldPrice || null }; }
app.get('/api/products', (req,res) => {
  let q = 'SELECT * FROM Product', cond = [], params = [];
  const { category, sort, search } = req.query;
  if (category && category !== 'all') { cond.push('category=?'); params.push(category); }
  if (search) { cond.push('(name LIKE ? OR scent LIKE ?)'); params.push('%'+search+'%','%'+search+'%'); }
  if (cond.length) q += ' WHERE ' + cond.join(' AND ');
  if (sort === 'price-low') q += ' ORDER BY price ASC';
  else if (sort === 'price-high') q += ' ORDER BY price DESC';
  else if (sort === 'bestseller') q += ' ORDER BY bestseller DESC, id ASC';
  else q += ' ORDER BY id DESC';
  res.json(db.prepare(q).all(...params).map(mapProduct));
});
app.get('/api/products/:slug', (req,res) => {
  const p = db.prepare('SELECT * FROM Product WHERE slug=?').get(clean(req.params.slug,100));
  if (!p) return res.status(404).json({ error: 'محصول پیدا نشد.' });
  const related = db.prepare('SELECT * FROM Product WHERE category=? AND id!=? LIMIT 4').all(p.category, p.id).map(mapProduct);
  res.json({ ...mapProduct(p), related });
});
app.get('/api/products/:id/reviews', (req,res) => {
  res.json(db.prepare('SELECT name,rating,text,createdAt FROM Review WHERE productId=? AND approved=1 ORDER BY id DESC').all(Number(req.params.id)));
});

// --- Reviews ---
app.post('/api/products/:id/reviews', userAuth, limit('review',5,60000), (req,res) => {
  const pid = Number(req.params.id);
  const name = clean(req.body.name,100), rating = Number(req.body.rating), text = clean(req.body.text,1000);
  if (!name || !text || rating < 1 || rating > 5) return res.status(400).json({ error: 'نام، متن و امتیاز را درست وارد کنید.' });
  if (!db.prepare('SELECT 1 FROM Product WHERE id=?').get(pid)) return res.status(404).json({ error:'محصول پیدا نشد.' });
  db.prepare('INSERT INTO Review (productId,name,rating,text,approved,createdAt) VALUES (?,?,?,?,0,?)').run(pid, name, rating, text, new Date().toISOString());
  res.status(201).json({ ok:true, message:'نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود.' });
});

// --- Settings ---
app.get('/api/settings', (req,res) => res.json({ ...defaultSettings, ...JSON.parse(db.prepare('SELECT data FROM Settings WHERE id=1').get().data) }));

// --- Contact ---
app.post('/api/contact', limit('contact',10,3600000), (req,res) => {
  const name = clean(req.body.name,200), phone = clean(req.body.phone,20), message = clean(req.body.message,3000);
  if (!name || !/^09\d{9}$/.test(phone) || !message) return res.status(400).json({ error:'نام، شماره موبایل و پیام را درست وارد کنید.' });
  db.prepare('INSERT INTO ContactMessage (name,phone,message,createdAt) VALUES (?,?,?,?)').run(name, phone, message, new Date().toISOString());
  res.status(201).json({ ok:true });
});

// --- Notify ---
app.post('/api/notify', limit('notify',5,3600000), (req,res) => {
  const productId = Number(req.body.productId), phone = clean(req.body.phone,20);
  if (!productId || !/^09\d{9}$/.test(phone)) return res.status(400).json({ error:'شماره موبایل را درست وارد کنید.' });
  db.prepare('INSERT INTO NotifyRequest (productId,phone,createdAt) VALUES (?,?,?)').run(productId, phone, new Date().toISOString());
  res.status(201).json({ ok:true, message:'به محض موجود شدن، شما را خبردار می‌کنیم.' });
});

// --- Orders ---
app.post('/api/orders', limit('order',10,3600000), (req,res) => {
  const items = req.body.items, customerName = clean(req.body.customerName,100), phone = clean(req.body.phone,20);
  const province = clean(req.body.province,50), city = clean(req.body.city,50), address = clean(req.body.address,500), postalCode = clean(req.body.postalCode,20);
  const shippingMethod = clean(req.body.shippingMethod,20), giftWrap = req.body.giftWrap ? 1 : 0, giftMessage = clean(req.body.giftMessage,500);
  const paymentMethod = clean(req.body.paymentMethod,20), discountCode = clean(req.body.discountCode,50), receiptImage = req.body.receiptImage ? String(req.body.receiptImage).slice(0,8000000) : null;
  if (!Array.isArray(items) || !items.length || !customerName || !/^09\d{9}$/.test(phone) || !province || !city || !address || !/^\d{10}$/.test(postalCode) || !shippingMethod || !paymentMethod)
    return res.status(400).json({ error:'لطفاً همهٔ فیلدها را درست پر کنید. کد پستی باید ۱۰ رقم باشد.' });
  const settings = { ...defaultSettings, ...JSON.parse(db.prepare('SELECT data FROM Settings WHERE id=1').get().data) };
  let subtotal = 0;
  for (const it of items) { const p = db.prepare('SELECT price,stock,name FROM Product WHERE id=?').get(Number(it.id)); if (!p) return res.status(400).json({ error:'یکی از محصولات وجود ندارد.' }); subtotal += p.price * Number(it.qty||1); }
  let shippingCost = shippingMethod === 'bike' ? settings.bikeCost : settings.shippingCost;
  if (subtotal >= settings.freeShippingThreshold && shippingMethod !== 'bike') shippingCost = 0;
  let discount = 0;
  if (discountCode) { const dc = db.prepare('SELECT * FROM DiscountCode WHERE code=? AND active=1').get(discountCode.toUpperCase()); if (!dc || (dc.expiresAt && new Date(dc.expiresAt) < new Date()) || (dc.maxUses && dc.usedCount >= dc.maxUses)) return res.status(400).json({ error:'کد تخفیف نامعتبر یا منقضی است.' }); discount = dc.type === 'percent' ? Math.round(subtotal * dc.value / 100) : dc.value; db.prepare('UPDATE DiscountCode SET usedCount=usedCount+1 WHERE id=?').run(dc.id); }
  const total = Math.max(0, subtotal + shippingCost - discount);
  const result = db.prepare('INSERT INTO Orders (items,subtotal,shippingCost,discount,total,status,customerName,phone,province,city,address,postalCode,shippingMethod,giftWrap,giftMessage,paymentMethod,trackingCode,receiptImage,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(JSON.stringify(items),subtotal,shippingCost,discount,total,'pending',customerName,phone,province,city,address,postalCode,shippingMethod,giftWrap,giftMessage,paymentMethod,null,receiptImage,new Date().toISOString());
  res.status(201).json({ id: Number(result.lastInsertRowid), total, message: paymentMethod === 'zarinpal' ? 'سفارش ثبت شد. در حال انتقال به درگاه پرداخت...' : 'سفارش ثبت شد. پس از تأیید پرداخت، وضعیت سفارش به‌روزرسانی می‌شود.' });
});
app.get('/api/orders/track/:id', limit('track',20,60000), (req,res) => {
  const o = db.prepare('SELECT id,status,total,trackingCode,createdAt,customerName,phone,shippingMethod FROM Orders WHERE id=?').get(Number(req.params.id));
  if (!o) return res.status(404).json({ error:'سفارش پیدا نشد.' });
  res.json(o);
});

// --- Discount Validate ---
app.post('/api/discounts/validate', (req,res) => {
  const code = clean(req.body.code,50).toUpperCase(), subtotal = Number(req.body.subtotal);
  const dc = db.prepare('SELECT * FROM DiscountCode WHERE code=? AND active=1').get(code);
  if (!dc || (dc.expiresAt && new Date(dc.expiresAt) < new Date()) || (dc.maxUses && dc.usedCount >= dc.maxUses)) return res.status(400).json({ error:'کد تخفیف نامعتبر است.' });
  const discount = dc.type === 'percent' ? Math.round(subtotal * dc.value / 100) : dc.value;
  res.json({ discount, type: dc.type, value: dc.value });
});

// --- Blog Posts ---
const posts = [
  { id:'scent-guide', title:'راهنمای انتخاب رایحهٔ شمع', date:'2026-09-20', image:img('1612293905607-b003de9e54fb'), body:'انتخاب رایحهٔ مناسب به فضای استفاده و حال‌وهوای دلخواه شما بستگی دارد.\n\nرایحه‌های گرم مثل وانیل و سدر برای فضای پذیرایی و عصرهای سرد عالی هستند. لاوندر برای اتاق خواب و آرامش شبانه مناسب است. رز و چوب صندل برای فضای رمانتیک و مدیتیشن.\n\nبهتر است قبل از خرید، رایحه را تست کنید یا از نمونه‌های کوچک شروع کنید.' },
  { id:'warmer-guide', title:'طرز استفادهٔ وارمر', date:'2026-09-12', image:img('1603905179139-db12ab535ca9'), body:'وارمر دستگاهی است که با حرارت ملایم، وکس ملت یا شمع را ذوب می‌کند و رایحه را در فضا پخش می‌کند.\n\nبرای استفاده، وکس ملت یا شمع را در ظرف بالایی وارمر قرار دهید و دستگاه را به برق وصل کنید. بعد از چند دقیقه رایحه شروع به پخش شدن می‌کند.\n\nوارمر ایمن‌تر از شمع روشن است چون شعله ندارد. با این حال، دستگاه را دور از کودکان و روی سطح صاف قرار دهید.' },
  { id:'candle-safety', title:'نکات ایمنی روشن کردن شمع', date:'2026-09-05', image:img('1572726729207-a78d6feb18d7'), body:'شمع زیبا است اما باید با احتیاط استفاده شود.\n\n۱. شمع را همیشه روی سطح صاف و غیرقابل‌اشتعال قرار دهید.\n\n۲. فتیله را قبل از هر بار استفاده به ۵ میلی‌متر کوتاه کنید.\n\n۳. شمع را بیش از ۴ ساعت مداوم روشن نگذارید.\n\n۴. شمع روشن را بدون نظارت رها نکنید.\n\n۵. شمع را دور از باد، پرده و اشیاء قابل‌اشتعال نگه‌دارید.' },
];
app.get('/api/posts', (req,res) => res.json(posts));
app.get('/api/posts/:id', (req,res) => { const p = posts.find(x => x.id === req.params.id); if (!p) return res.status(404).json({ error:'مقاله پیدا نشد.' }); res.json(p); });

// --- Provinces ---
const provinces = ['آذربایجان شرقی','آذربایجان غربی','اردبیل','اصفهان','البرز','ایلام','بوشهر','تهران','چهارمحال و بختیاری','خراسان جنوبی','خراسان رضوی','خراسان شمالی','خوزستان','زنجان','سمنان','سیستان و بلوچستان','فارس','قزوین','قم','کردستان','کرمان','کرمانشاه','کهگیلویه و بویراحمد','گلستان','گیلان','لرستان','مازندران','مرکزی','هرمزگان','همدان','یزد'];
app.get('/api/provinces', (req,res) => res.json(provinces));

// --- Admin API ---
app.use('/api/admin', admin);
app.get('/api/admin/dashboard', (req,res) => {
  const today = new Date().toISOString().slice(0,10), month = new Date().toISOString().slice(0,7);
  const orders = db.prepare('SELECT * FROM Orders').all();
  const todaySales = orders.filter(o => o.createdAt.slice(0,10) === today).reduce((s,o)=>s+o.total,0);
  const monthSales = orders.filter(o => o.createdAt.slice(0,7) === month).reduce((s,o)=>s+o.total,0);
  const productCount = db.prepare('SELECT COUNT(*) as c FROM Product').get().c;
  const lowStock = db.prepare('SELECT name,stock FROM Product WHERE stock <= 5 ORDER BY stock ASC').all();
  res.json({ todaySales, monthSales, orderCount: orders.length, productCount, lowStock });
});
app.get('/api/admin/products', (req,res) => res.json(db.prepare('SELECT * FROM Product ORDER BY id DESC').all().map(mapProduct)));
app.post('/api/admin/products', (req,res) => {
  const name = clean(req.body.name,200), category = clean(req.body.category,50), price = Number(req.body.price), description = clean(req.body.description,3000), images = req.body.images, scent = clean(req.body.scent,100), specs = req.body.specs, stock = Number(req.body.stock)||0, oldPrice = Number(req.body.oldPrice)||null;
  const featured = req.body.featured?1:0, bestseller = req.body.bestseller?1:0, isNew = req.body.isNew?1:0;
  if (!name || !category || !price || !Array.isArray(images) || !images.length) return res.status(400).json({ error:'نام، دسته، قیمت و حداقل یک تصویر الزامی است.' });
  const slug = name.replace(/\s+/g,'-').slice(0,50) + '-' + Date.now().toString(36);
  const result = db.prepare('INSERT INTO Product (slug,name,category,price,oldPrice,description,images,scent,specs,stock,featured,bestseller,isNew,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(slug,name,category,price,oldPrice,description,JSON.stringify(images),scent,JSON.stringify(specs||{}),stock,featured,bestseller,isNew,new Date().toISOString());
  res.status(201).json({ id: Number(result.lastInsertRowid) });
});
app.put('/api/admin/products/:id', (req,res) => {
  const id = Number(req.params.id), p = db.prepare('SELECT 1 FROM Product WHERE id=?').get(id);
  if (!p) return res.status(404).json({ error:'محصول پیدا نشد.' });
  const fields = ['name','category','price','oldPrice','description','scent','stock','featured','bestseller','isNew'];
  const sets = [], params = [];
  for (const f of fields) { if (f in req.body) { sets.push(f+'=?'); params.push(f==='price'||f==='stock'||f==='oldPrice' ? (Number(req.body[f])||null) : (f==='featured'||f==='bestseller'||f==='isNew' ? (req.body[f]?1:0) : clean(req.body[f],3000))); } }
  if (Array.isArray(req.body.images)) { sets.push('images=?'); params.push(JSON.stringify(req.body.images)); }
  if (req.body.specs) { sets.push('specs=?'); params.push(JSON.stringify(req.body.specs)); }
  if (!sets.length) return res.json({ ok:true });
  params.push(id);
  db.prepare('UPDATE Product SET ' + sets.join(',') + ' WHERE id=?').run(...params);
  res.json({ ok:true });
});
app.delete('/api/admin/products/:id', (req,res) => { db.prepare('DELETE FROM Product WHERE id=?').run(Number(req.params.id)); res.json({ ok:true }); });
app.get('/api/admin/orders', (req,res) => res.json(db.prepare('SELECT * FROM Orders ORDER BY id DESC').all().map(o => ({ ...o, items: JSON.parse(o.items) }))));
app.patch('/api/admin/orders/:id', (req,res) => {
  const id = Number(req.params.id), status = clean(req.body.status,20), trackingCode = clean(req.body.trackingCode,50);
  if (!['pending','processing','shipped','delivered','cancelled'].includes(status)) return res.status(400).json({ error:'وضعیت نامعتبر.' });
  db.prepare('UPDATE Orders SET status=?, trackingCode=? WHERE id=?').run(status, trackingCode||null, id);
  res.json({ ok:true });
});
app.get('/api/admin/reviews', (req,res) => res.json(db.prepare('SELECT r.*,p.name as productName FROM Review r JOIN Product p ON r.productId=p.id ORDER BY r.approved ASC, r.id DESC').all()));
app.patch('/api/admin/reviews/:id', (req,res) => { db.prepare('UPDATE Review SET approved=? WHERE id=?').run(req.body.approved?1:0, Number(req.params.id)); res.json({ ok:true }); });
app.delete('/api/admin/reviews/:id', (req,res) => { db.prepare('DELETE FROM Review WHERE id=?').run(Number(req.params.id)); res.json({ ok:true }); });
app.get('/api/admin/discounts', (req,res) => res.json(db.prepare('SELECT * FROM DiscountCode ORDER BY id DESC').all()));
app.post('/api/admin/discounts', (req,res) => {
  const code = clean(req.body.code,50).toUpperCase(), type = clean(req.body.type,10), value = Number(req.body.value), maxUses = Number(req.body.maxUses)||null, expiresAt = clean(req.body.expiresAt,20)||null;
  if (!code || !['percent','amount'].includes(type) || !value) return res.status(400).json({ error:'کد، نوع و مقدار را درست وارد کنید.' });
  try { db.prepare('INSERT INTO DiscountCode (code,type,value,maxUses,usedCount,expiresAt,active) VALUES (?,?,?,?,0,?,1)').run(code,type,value,maxUses,expiresAt); res.status(201).json({ ok:true }); }
  catch(e) { if (String(e).includes('UNIQUE')) return res.status(409).json({ error:'این کد قبلاً ثبت شده.' }); throw e; }
});
app.delete('/api/admin/discounts/:id', (req,res) => { db.prepare('DELETE FROM DiscountCode WHERE id=?').run(Number(req.params.id)); res.json({ ok:true }); });
app.put('/api/admin/settings', (req,res) => {
  const data = {}; for (const k of Object.keys(defaultSettings)) data[k] = k in req.body ? (typeof defaultSettings[k] === 'number' ? Number(req.body[k]) : clean(req.body[k],500)) : defaultSettings[k];
  db.prepare('UPDATE Settings SET data=? WHERE id=1').run(JSON.stringify(data)); res.json(data);
});
app.get('/api/admin/contacts', (req,res) => res.json(db.prepare('SELECT * FROM ContactMessage ORDER BY id DESC').all()));
app.get('/api/admin/notify', (req,res) => res.json(db.prepare('SELECT n.*,p.name as productName FROM NotifyRequest n JOIN Product p ON n.productId=p.id ORDER BY n.id DESC').all()));

app.use('/api', (req,res) => res.status(404).json({ error:'پیدا نشد.' }));
app.use((err,req,res,next) => { console.error(err.message); res.status(500).json({ error:'خطایی رخ داد. دوباره تلاش کنید.' }); });
app.listen(3001, '0.0.0.0', () => console.log('GarmNoor API on 3001'));
