import React, { useEffect, useState } from 'react';
import { Icon } from './components';
import { api, categories, orderStatuses, toFa, formatPrice, formatDate } from './content';

export default function Admin() {
  const [authed, setAuthed] = useState(null);
  const [tab, setTab] = useState('dashboard');
  useEffect(() => { api('/admin/session').then(() => setAuthed(true)).catch(() => setAuthed(false)); }, []);
  if (authed === null) return <section className="section container"><p className="muted">در حال بررسی...</p></section>;
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  const tabs = [['dashboard','داشبورد','LayoutDashboard'],['products','محصولات','Package'],['orders','سفارش‌ها','ShoppingBag'],['reviews','نظرات','MessageSquare'],['discounts','تخفیف','Tag'],['settings','تنظیمات','Settings']];
  return <section className="section container admin-page">
    <div className="admin-heading"><h1>پنل مدیریت</h1><button className="text-link" onClick={async () => { await api('/admin/logout', { method: 'POST' }); setAuthed(false); }}>خروج <Icon name="LogOut" size={16} /></button></div>
    <div className="admin-tabs">{tabs.map(([id, label, icon]) => <button key={id} className={'tab' + (tab === id ? ' active' : '')} onClick={() => setTab(id)}><Icon name={icon} size={18} /> {label}</button>)}</div>
    {tab === 'dashboard' && <Dashboard />}
    {tab === 'products' && <ProductsAdmin />}
    {tab === 'orders' && <OrdersAdmin />}
    {tab === 'reviews' && <ReviewsAdmin />}
    {tab === 'discounts' && <DiscountsAdmin />}
    {tab === 'settings' && <SettingsAdmin />}
  </section>;
}

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState('');
  async function submit(e) { e.preventDefault(); setError(''); try { await api('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) }); onLogin(); } catch (err) { setError(err.message); } }
  return <section className="section container auth-page"><div className="auth-box">
    <span className="eyebrow">پنل مدیریت</span><h1>ورود مدیر</h1>
    <form onSubmit={submit}>
      <label>نام کاربری<input value={username} onChange={e => setUsername(e.target.value)} required /></label>
      <label>رمز عبور<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
      {error && <p className="error">{error}</p>}
      <button className="button" type="submit">ورود</button>
    </form>
  </div></section>;
}

function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { api('/admin/dashboard').then(setData).catch(() => {}); }, []);
  if (!data) return <p className="muted">در حال بارگذاری...</p>;
  return <div className="dashboard-grid">
    <div className="dash-card"><span className="dash-icon"><Icon name="ShoppingBag" size={24} /></span><div><b>{formatPrice(data.todaySales)}</b><small>فروش امروز</small></div></div>
    <div className="dash-card"><span className="dash-icon"><Icon name="TrendingUp" size={24} /></span><div><b>{formatPrice(data.monthSales)}</b><small>فروش این ماه</small></div></div>
    <div className="dash-card"><span className="dash-icon"><Icon name="Package" size={24} /></span><div><b>{toFa(data.orderCount)}</b><small>تعداد سفارش‌ها</small></div></div>
    <div className="dash-card"><span className="dash-icon"><Icon name="Tag" size={24} /></span><div><b>{toFa(data.productCount)}</b><small>تعداد محصولات</small></div></div>
    {data.lowStock.length > 0 && <div className="panel low-stock-panel"><h3>هشدار موجودی کم</h3>{data.lowStock.map(p => <div key={p.name} className="summary-row"><span>{p.name}</span><span className={p.stock <= 3 ? 'out-stock' : ''}>{toFa(p.stock)} عدد</span></div>)}</div>}
  </div>;
}

function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  function load() { api('/admin/products').then(setProducts).catch(() => {}); }
  useEffect(load, []);
  async function del(id) { if (!confirm('حذف این محصول؟')) return; await api('/admin/products/' + id, { method: 'DELETE' }); load(); }
  if (showForm) return <ProductForm product={editing} onDone={() => { setShowForm(false); setEditing(null); load(); }} onCancel={() => { setShowForm(false); setEditing(null); }} />;
  return <div className="panel">
    <div className="admin-bar"><h3>محصولات</h3><button className="button small" onClick={() => { setEditing(null); setShowForm(true); }}>افزودن محصول</button></div>
    <div className="table-scroll"><table>
      <thead><tr><th>تصویر</th><th>نام</th><th>دسته</th><th>قیمت</th><th>موجودی</th><th>عملیات</th></tr></thead>
      <tbody>{products.map(p => <tr key={p.id}>
        <td><img src={p.images?.[0]} alt={p.name} className="admin-thumb" /></td>
        <td>{p.name}</td><td>{categories.find(c => c.slug === p.category)?.name}</td>
        <td>{formatPrice(p.price)}</td><td className={p.stock <= 5 ? 'out-stock' : ''}>{toFa(p.stock)}</td>
        <td><button className="icon-btn" onClick={() => { setEditing(p); setShowForm(true); }}><Icon name="Settings" size={16} /></button><button className="icon-btn" onClick={() => del(p.id)}><Icon name="Trash2" size={16} /></button></td>
      </tr>)}</tbody>
    </table></div>
  </div>;
}

function ProductForm({ product, onDone, onCancel }) {
  const [form, setForm] = useState(product ? { ...product, imagesText: product.images.join('\n'), specsText: Object.entries(product.specs).map(([k,v]) => `${k}=${v}`).join('\n') } : { name:'', category:'candle', price:'', oldPrice:'', description:'', imagesText:'', scent:'', stock:'', featured:false, bestseller:false, isNew:true, specsText:'' });
  const [error, setError] = useState('');
  function set(k,v) { setForm(f => ({ ...f, [k]: v })); }
  async function submit(e) {
    e.preventDefault(); setError('');
    const images = form.imagesText.split('\n').map(s => s.trim()).filter(Boolean);
    const specs = {}; form.specsText.split('\n').forEach(line => { const [k, ...v] = line.split('='); if (k.trim()) specs[k.trim()] = v.join('=').trim(); });
    const body = { name: form.name, category: form.category, price: Number(form.price), oldPrice: form.oldPrice ? Number(form.oldPrice) : null, description: form.description, images, scent: form.scent, stock: Number(form.stock) || 0, featured: form.featured, bestseller: form.bestseller, isNew: form.isNew, specs };
    try { if (product) await api('/admin/products/' + product.id, { method: 'PUT', body: JSON.stringify(body) }); else await api('/admin/products', { method: 'POST', body: JSON.stringify(body) }); onDone(); }
    catch (err) { setError(err.message); }
  }
  return <div className="panel"><div className="admin-bar"><h3>{product ? 'ویرایش محصول' : 'محصول جدید'}</h3><button className="text-link" onClick={onCancel}>بازگشت</button></div>
    <form onSubmit={submit} className="form-grid">
      <label>نام<input value={form.name} onChange={e => set('name', e.target.value)} required /></label>
      <label>دسته<select value={form.category} onChange={e => set('category', e.target.value)}>{categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
      <label>قیمت (تومان)<input type="number" value={form.price} onChange={e => set('price', e.target.value)} required /></label>
      <label>قیمت قبل از تخفیف<input type="number" value={form.oldPrice} onChange={e => set('oldPrice', e.target.value)} /></label>
      <label className="full-field">توضیحات<textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} /></label>
      <label className="full-field">آدرس تصاویر (هر خط یک URL)<textarea value={form.imagesText} onChange={e => set('imagesText', e.target.value)} rows={4} dir="ltr" /></label>
      <label>رایحه<input value={form.scent} onChange={e => set('scent', e.target.value)} /></label>
      <label>موجودی<input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} /></label>
      <label className="full-field">مشخصات (هر خط: کلید=مقدار)<textarea value={form.specsText} onChange={e => set('specsText', e.target.value)} rows={5} dir="ltr" /></label>
      <label className="checkbox-row"><input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} /> ویژه</label>
      <label className="checkbox-row"><input type="checkbox" checked={form.bestseller} onChange={e => set('bestseller', e.target.checked)} /> پرفروش</label>
      <label className="checkbox-row"><input type="checkbox" checked={form.isNew} onChange={e => set('isNew', e.target.checked)} /> جدید</label>
      {error && <p className="error full-field">{error}</p>}
      <div className="full-field"><button className="button" type="submit">{product ? 'ذخیره تغییرات' : 'افزودن محصول'}</button></div>
    </form>
  </div>;
}

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { api('/admin/orders').then(setOrders).catch(() => {}); }, []);
  async function update(id, status, trackingCode) { await api('/admin/orders/' + id, { method: 'PATCH', body: JSON.stringify({ status, trackingCode }) }); setOrders(prev => prev.map(o => o.id === id ? { ...o, status, trackingCode } : o)); }
  return <div className="panel"><h3>سفارش‌ها</h3>
    {orders.length === 0 ? <p className="muted">سفارشی ثبت نشده است.</p> :
    <div className="orders-list">{orders.map(o => <div key={o.id} className="order-card">
      <div className="order-head"><div><b>#{toFa(o.id)}</b> — {o.customerName} <small dir="ltr">{o.phone}</small></div><span className="status-badge">{orderStatuses[o.status]}</span></div>
      <div className="order-items">{o.items.map((it, i) => <span key={i}>{it.name} × {toFa(it.qty)}</span>)}</div>
      <div className="summary-row"><span>مبلغ: {formatPrice(o.total)}</span><span>{formatDate(o.createdAt)}</span></div>
      <div className="order-actions">
        <select defaultValue={o.status} onChange={e => update(o.id, e.target.value, o.trackingCode)}>{Object.entries(orderStatuses).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select>
        <input placeholder="کد رهگیری" defaultValue={o.trackingCode || ''} onBlur={e => update(o.id, o.status, e.target.value)} dir="ltr" />
      </div>
    </div>)}</div>}
  </div>;
}

function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  useEffect(() => { api('/admin/reviews').then(setReviews).catch(() => {}); }, []);
  async function approve(id, approved) { await api('/admin/reviews/' + id, { method: 'PATCH', body: JSON.stringify({ approved }) }); setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: approved ? 1 : 0 } : r)); }
  async function del(id) { await api('/admin/reviews/' + id, { method: 'DELETE' }); setReviews(prev => prev.filter(r => r.id !== id)); }
  return <div className="panel"><h3>نظرات</h3>
    {reviews.length === 0 ? <p className="muted">نظری ثبت نشده است.</p> :
    <div className="reviews-admin-list">{reviews.map(r => <div key={r.id} className="review-admin-item">
      <div><b>{r.name}</b> — {r.productName} <span className={r.approved ? 'status-badge' : 'status-badge pending'}>{r.approved ? 'تأیید شده' : 'در انتظار'}</span></div>
      <p>{r.text}</p>
      <div className="review-admin-actions"><button className="button small" onClick={() => approve(r.id, !r.approved)}>{r.approved ? 'لغو تأیید' : 'تأیید'}</button><button className="icon-btn" onClick={() => del(r.id)}><Icon name="Trash2" size={16} /></button></div>
    </div>)}</div>}
  </div>;
}

function DiscountsAdmin() {
  const [discounts, setDiscounts] = useState([]);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', maxUses: '', expiresAt: '' });
  const [error, setError] = useState('');
  function load() { api('/admin/discounts').then(setDiscounts).catch(() => {}); }
  useEffect(load, []);
  async function submit(e) { e.preventDefault(); setError(''); try { await api('/admin/discounts', { method: 'POST', body: JSON.stringify(form) }); setForm({ code:'', type:'percent', value:'', maxUses:'', expiresAt:'' }); load(); } catch (err) { setError(err.message); } }
  async function del(id) { await api('/admin/discounts/' + id, { method: 'DELETE' }); load(); }
  return <div className="panel">
    <h3>کدهای تخفیف</h3>
    <form onSubmit={submit} className="form-grid discount-form-grid">
      <label>کد<input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required dir="ltr" /></label>
      <label>نوع<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="percent">درصد</option><option value="amount">مبلغ</option></select></label>
      <label>مقدار<input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required /></label>
      <label>سقف استفاده<input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} /></label>
      <label>تاریخ انقضا<input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} dir="ltr" /></label>
      {error && <p className="error full-field">{error}</p>}
      <button className="button" type="submit">افزودن</button>
    </form>
    <div className="table-scroll"><table><thead><tr><th>کد</th><th>نوع</th><th>مقدار</th><th>استفاده</th><th>انقضا</th><th>عملیات</th></tr></thead>
      <tbody>{discounts.map(d => <tr key={d.id}><td dir="ltr">{d.code}</td><td>{d.type === 'percent' ? 'درصد' : 'مبلغ'}</td><td>{toFa(d.value)}{d.type === 'percent' ? '٪' : ' تومان'}</td><td>{toFa(d.usedCount)}/{d.maxUses ? toFa(d.maxUses) : '∞'}</td><td>{d.expiresAt || '—'}</td><td><button className="icon-btn" onClick={() => del(d.id)}><Icon name="Trash2" size={16} /></button></td></tr>)}</tbody>
    </table></div>
  </div>;
}

function SettingsAdmin() {
  const [settings, setSettings] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { api('/settings').then(setSettings).catch(() => {}); }, []);
  if (!settings) return <p className="muted">در حال بارگذاری...</p>;
  function set(k, v) { setSettings(s => ({ ...s, [k]: v })); }
  async function submit(e) { e.preventDefault(); try { await api('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }); setMsg('تنظیمات ذخیره شد.'); } catch (err) { setMsg(err.message); } }
  const fields = [['brandName','نام برند','text'],['phone','تلفن','tel'],['whatsapp','واتساپ (شماره بین‌المللی)','text'],['instagram','اینستاگرام (URL)','url'],['telegram','تلگرام (URL)','url'],['email','ایمیل','email'],['address','آدرس','text'],['workingHours','ساعات کاری','text'],['shippingCost','هزینه ارسال (تومان)','number'],['freeShippingThreshold','حد ارسال رایگان (تومان)','number'],['bikeCost','هزینه پیک موتوری (تومان)','number'],['bikeCity','شهر پیک موتوری','text'],['zarinpalMerchantId','کد پذیرنده زرین‌پال','text']];
  return <div className="panel"><h3>تنظیمات فروشگاه</h3>
    {msg && <p className={msg.includes('ذخیره') ? 'success-msg' : 'error'}>{msg}</p>}
    <form onSubmit={submit} className="form-grid">
      {fields.map(([k, label, type]) => <label key={k}>{label}<input type={type} value={settings[k] || ''} onChange={e => set(k, e.target.value)} dir={type === 'tel' || type === 'url' || type === 'email' || k === 'whatsapp' || k === 'zarinpalMerchantId' ? 'ltr' : undefined} /></label>)}
      <div className="full-field"><button className="button" type="submit">ذخیره تنظیمات</button></div>
    </form>
  </div>;
}
