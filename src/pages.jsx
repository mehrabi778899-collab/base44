import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Icon, ProductCard, SectionHead, StarRating, CountdownTimer } from './components';
import { useSite } from './context';
import { api, categories, nav, shippingMethods, orderStatuses, toFa, formatPrice, formatDate, discountPercent } from './content';

function PageIntro({ eyebrow, title, description }) {
  return <section className="page-intro"><div className="container"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div></section>;
}

const whyUsItems = [['Truck','ارسال سریع','ارسال به سراسر ایران در کوتاه‌ترین زمان'],['ShieldCheck','ضمانت اصالت','تمام محصولات اصل و باکیفیت'],['Gift','بسته‌بندی هدیه','بسته‌بندی ویژه و کادوپیچی'],['LockKeyhole','پرداخت امن','درگاه پرداخت زرین‌پال و کارت به کارت']];

export function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => { api('/products').then(setProducts).catch(() => {}); }, []);
  const featured = products.filter(p => p.featured).slice(0, 8);
  const bestsellers = products.filter(p => p.bestseller).slice(0, 4);
  const newest = products.filter(p => p.isNew).slice(0, 4);
  const special = products.find(p => p.oldPrice) || products[0];
  return <>
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="eyebrow">شمع‌های دست‌ساز و وارمر</span>
          <h1>نورِ گرم،<br/><em>لحظه‌های دلبند</em></h1>
          <p>شمع‌های معطر دست‌ساز، وارمر و وازلین باکیفیت. گرمی و آرامش را به خانه‌تان بیاورید.</p>
          <div className="hero-buttons">
            <Link to="/shop" className="button">مشاهده محصولات <Icon name="ArrowLeft" size={18} /></Link>
            <Link to="/about" className="button outline">داستان ما</Link>
          </div>
        </div>
        <div className="hero-visual">
          <img src="https://images.unsplash.com/photo-1612293905607-b003de9e54fb?auto=format&fit=crop&w=1200&q=85" alt="شمع‌های دست‌ساز گرم‌نور" />
        </div>
      </div>
    </section>

    <section className="section"><div className="container">
      <SectionHead eyebrow="دسته‌بندی‌ها" title="محصولات ما" highlight="در یک نگاه" link="همه محصولات" to="/shop" />
      <div className="categories-grid">{categories.map(c => <Link key={c.slug} to={'/shop?category=' + c.slug} className="category-card">
        <span className="category-icon"><Icon name={c.icon} size={28} /></span>
        <h3>{c.name}</h3><p>{c.desc}</p>
      </Link>)}</div>
    </div></section>

    {bestsellers.length > 0 && <section className="section section-cream"><div className="container">
      <SectionHead eyebrow="پرفروش‌ترین‌ها" title="محبوب‌ترین" highlight="محصولات" link="مشاهده همه" to="/shop" />
      <div className="products-grid">{bestsellers.map(p => <ProductCard key={p.id} product={p} />)}</div>
    </div></section>}

    {special && <section className="section section-blue"><div className="container special-offer">
      <div className="special-info">
        <span className="eyebrow">پیشنهاد ویژه</span>
        <h2>{special.name}</h2>
        <p>{special.description}</p>
        <div className="special-prices">
          <span className="price">{formatPrice(special.price)}</span>
          {special.oldPrice && <span className="old-price">{formatPrice(special.oldPrice)}</span>}
        </div>
        <CountdownTimer hours={24} />
        <Link to={'/product/' + special.slug} className="button">خرید با تخفیف <Icon name="ArrowLeft" size={18} /></Link>
      </div>
      <div className="special-image"><img src={special.images?.[0]} alt={special.name} /></div>
    </div></section>}

    {featured.length > 0 && <section className="section"><div className="container">
      <SectionHead eyebrow="ویژه" title="انتخاب‌های" highlight="برگزیده" link="مشاهده همه" to="/shop" />
      <div className="products-grid">{featured.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}</div>
    </div></section>}

    <section className="section section-cream"><div className="container">
      <SectionHead eyebrow="چرا گرم‌نور؟" title="چرا ما را" highlight="انتخاب کنید" />
      <div className="why-grid">{whyUsItems.map(([icon, title, desc]) => <div key={icon} className="why-item">
        <span className="why-icon"><Icon name={icon} size={26} /></span>
        <h3>{title}</h3><p>{desc}</p>
      </div>)}</div>
    </div></section>

    {newest.length > 0 && <section className="section"><div className="container">
      <SectionHead eyebrow="تازه‌ها" title="جدیدترین" highlight="محصولات" link="مشاهده همه" to="/shop" />
      <div className="products-grid">{newest.map(p => <ProductCard key={p.id} product={p} />)}</div>
    </div></section>}

    <section className="section section-cream"><div className="container">
      <SectionHead eyebrow="نظرات" title="مشتریان ما" highlight="چه می‌گویند" />
      <div className="reviews-grid">{[
        ['مریم ر.','عالی بود، رایحه‌اش کل خانه رو پر کرد. کیفیتش خیلی خوبه.',5],
        ['علی ک.','بسته‌بندی عالی و ارسال سریع. حتماً دوباره خرید می‌کنم.',5],
        ['سارا م.','وارمرشون خیلی خوبه، بدون شعله و امن. راضی‌ام.',4],
      ].map(([name, text, rating]) => <div key={name} className="review-card">
        <StarRating rating={rating} />
        <p>«{text}»</p>
        <b>{name}</b>
      </div>)}</div>
    </div></section>

    <section className="section section-blue"><div className="container">
      <div className="instagram-section">
        <SectionHead eyebrow="اینستاگرام" title="ما را دنبال کنید" highlight="@garmnoor" />
        <div className="instagram-grid">{[1,2,3,4,5,6].map(i => <div key={i} className="instagram-post">
          <img src={`https://images.unsplash.com/photo-${['1631021967299-59d54f546248','1612293905607-b003de9e54fb','1603905179139-db12ab535ca9','1572726729207-a78d6feb18d7','1612179543058-ab74d388e0ce','1603905179139-db12ab535ca9'][i-1]}?auto=format&fit=crop&w=400&q=70`} alt="پست اینستاگرام" loading="lazy" />
        </div>)}</div>
      </div>
    </div></section>
  </>;
}

export function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();
  const [category, setCategory] = useState(params.get('category') || 'all');
  const [sort, setSort] = useState('newest');
  const [search] = useState(params.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams();
    if (category !== 'all') q.set('category', category);
    if (sort !== 'newest') q.set('sort', sort);
    if (search) q.set('search', search);
    setLoading(true);
    api('/products?' + q).then(p => { setProducts(p); setLoading(false); }).catch(() => setLoading(false));
  }, [category, sort, search]);
  return <>
    <PageIntro eyebrow="فروشگاه" title="همه محصولات" description="شمع، وارمر، وازلین و پک‌های هدیه" />
    <section className="section container shop-page">
      <div className="shop-sidebar">
        <div className="filter-group">
          <h4>دسته‌بندی</h4>
          <button className={'filter-btn' + (category === 'all' ? ' active' : '')} onClick={() => setCategory('all')}>همه</button>
          {categories.map(c => <button key={c.slug} className={'filter-btn' + (category === c.slug ? ' active' : '')} onClick={() => setCategory(c.slug)}>{c.name}</button>)}
        </div>
      </div>
      <div className="shop-main">
        <div className="shop-toolbar">
          <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}><Icon name="Filter" size={18} /> فیلترها</button>
          <span className="product-count">{toFa(products.length)} محصول</span>
          <select value={sort} onChange={e => setSort(e.target.value)} className="sort-select">
            <option value="newest">جدیدترین</option>
            <option value="bestseller">پرفروش‌ترین</option>
            <option value="price-low">ارزان‌ترین</option>
            <option value="price-high">گران‌ترین</option>
          </select>
        </div>
        {showFilters && <div className="mobile-filters">
          <button className={'filter-btn' + (category === 'all' ? ' active' : '')} onClick={() => setCategory('all')}>همه</button>
          {categories.map(c => <button key={c.slug} className={'filter-btn' + (category === c.slug ? ' active' : '')} onClick={() => setCategory(c.slug)}>{c.name}</button>)}
        </div>}
        {loading ? <p className="muted">در حال بارگذاری...</p> : products.length === 0 ? <p className="muted">محصولی پیدا نشد.</p> :
        <div className="products-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>}
      </div>
    </section>
  </>;
}

export function ProductDetail() {
  const { slug } = useParams();
  const { addToCart, toggleWishlist, inWishlist, user } = useSite();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState('description');
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [notifyPhone, setNotifyPhone] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, text: '' });
  const [reviewMsg, setReviewMsg] = useState('');
  const navigate = useNavigate();
  useEffect(() => { api('/products/' + slug).then(p => { setProduct(p); setActiveImg(0); setQty(1); }).catch(() => navigate('/404')); }, [slug, navigate]);
  useEffect(() => { if (product) api('/products/' + product.id + '/reviews').then(setReviews).catch(() => {}); }, [product]);
  if (!product) return <section className="section container"><p className="muted">در حال بارگذاری...</p></section>;
  const dp = discountPercent(product.price, product.oldPrice);
  async function submitReview(e) { e.preventDefault(); try { await api('/products/' + product.id + '/reviews', { method: 'POST', body: JSON.stringify(reviewForm) }); setReviewMsg('نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود.'); setReviewForm({ name: '', rating: 5, text: '' }); } catch (err) { setReviewMsg(err.message); } }
  async function submitNotify(e) { e.preventDefault(); try { await api('/notify', { method: 'POST', body: JSON.stringify({ productId: product.id, phone: notifyPhone }) }); setNotifyMsg('ثبت شد! به محض موجود شدن خبردار می‌کنیم.'); setNotifyPhone(''); } catch (err) { setNotifyMsg(err.message); } }
  return <>
    <section className="section container product-detail">
      <div className="product-gallery">
        <div className="main-image"><img src={product.images[activeImg]} alt={product.name} /></div>
        {product.images.length > 1 && <div className="thumbnails">{product.images.map((src, i) => <button key={i} className={'thumb' + (i === activeImg ? ' active' : '')} onClick={() => setActiveImg(i)}><img src={src} alt={product.name + ' ' + toFa(i + 1)} /></button>)}</div>}
      </div>
      <div className="product-info">
        <span className="eyebrow">{categories.find(c => c.slug === product.category)?.name}</span>
        <h1>{product.name}</h1>
        <div className="product-rating"><StarRating rating={reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0} /> <span>({toFa(reviews.length)} نظر)</span></div>
        <div className="product-prices">
          <span className="price">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
          {dp && <span className="discount-badge">٪{dp} تخفیف</span>}
        </div>
        <p className="product-desc">{product.description}</p>
        {product.scent && <div className="product-variant"><span>رایحه:</span> <strong>{product.scent}</strong></div>}
        <div className="product-variant"><span>موجودی:</span> <strong className={product.stock > 0 ? 'in-stock' : 'out-stock'}>{product.stock > 0 ? toFa(product.stock) + ' عدد موجود' : 'ناموجود'}</strong></div>
        <div className="product-actions">
          <div className="qty-control">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}><Icon name="Minus" size={16} /></button>
            <span>{toFa(qty)}</span>
            <button onClick={() => setQty(q => q + 1)}><Icon name="Plus" size={16} /></button>
          </div>
          {product.stock > 0 ? <button className="button" onClick={() => addToCart(product, qty)}>افزودن به سبد <Icon name="ShoppingBag" size={18} /></button> :
          <button className="button" disabled>ناموجود</button>}
          <button className={'wish-btn-lg' + (inWishlist(product.id) ? ' active' : '')} onClick={() => toggleWishlist(product.id)} aria-label="علاقه‌مندی"><Icon name="Heart" size={20} fill={inWishlist(product.id) ? 'currentColor' : 'none'} /></button>
          <button className="wish-btn-lg" onClick={() => navigator.share?.({ title: product.name, url: window.location.href }).catch(() => {})} aria-label="اشتراک‌گذاری"><Icon name="Share2" size={20} /></button>
        </div>
        {product.stock === 0 && <div className="notify-box">
          <h4>موجود شد خبرم کن</h4>
          {notifyMsg ? <p className="success-msg">{notifyMsg}</p> : <form onSubmit={submitNotify}>
            <input type="tel" placeholder="شماره موبایل" value={notifyPhone} onChange={e => setNotifyPhone(e.target.value)} dir="ltr" required />
            <button className="button small" type="submit">ثبت</button>
          </form>}
        </div>}
      </div>
    </section>
    <section className="section section-cream container">
      <div className="product-tabs">
        <button className={'tab' + (tab === 'description' ? ' active' : '')} onClick={() => setTab('description')}>توضیحات</button>
        <button className={'tab' + (tab === 'specs' ? ' active' : '')} onClick={() => setTab('specs')}>مشخصات</button>
        <button className={'tab' + (tab === 'reviews' ? ' active' : '')} onClick={() => setTab('reviews')}>نظرات</button>
      </div>
      <div className="tab-content">
        {tab === 'description' && <div className="article"><p>{product.description}</p></div>}
        {tab === 'specs' && <div className="specs-grid">{Object.entries(product.specs).map(([k, v]) => <div key={k} className="spec-item"><span>{specLabels[k] || k}</span><strong>{v}</strong></div>)}</div>}
        {tab === 'reviews' && <div className="reviews-section">
          {reviews.length > 0 ? <div className="reviews-list">{reviews.map((r, i) => <div key={i} className="review-item"><div className="review-head"><b>{r.name}</b><StarRating rating={r.rating} /></div><p>{r.text}</p><small>{formatDate(r.createdAt)}</small></div>)}</div> : <p className="muted">هنوز نظری ثبت نشده است.</p>}
          <form onSubmit={submitReview} className="review-form">
            <h4>نظر شما را بنویسید</h4>
            {reviewMsg && <p className={reviewMsg.includes('ثبت شد') ? 'success-msg' : 'error'}>{reviewMsg}</p>}
            <input placeholder="نام شما" value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} required />
            <div className="rating-input"><span>امتیاز:</span>{[1,2,3,4,5].map(i => <button type="button" key={i} onClick={() => setReviewForm({ ...reviewForm, rating: i })}><Icon name="Star" size={20} fill={i <= reviewForm.rating ? 'currentColor' : 'none'} className={i <= reviewForm.rating ? 'filled' : ''} /></button>)}</div>
            <textarea placeholder="متن نظر" value={reviewForm.text} onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })} required rows={4} />
            <button className="button" type="submit">ثبت نظر</button>
          </form>
        </div>}
      </div>
    </section>
    {product.related?.length > 0 && <section className="section container"><SectionHead eyebrow="مرتبط" title="محصولات" highlight="مرتبط" /><div className="products-grid">{product.related.map(p => <ProductCard key={p.id} product={p} />)}</div></section>}
  </>;
}

const specLabels = { waxType: 'نوع موم', scent: 'رایحه', weight: 'وزن', burnTime: 'مدت سوختن', container: 'جنس ظرف', safety: 'نکات ایمنی', voltage: 'ولتاژ', plug: 'نوع دوشاخه', power: 'توان', material: 'جنس', usage: 'طرز استفاده', volume: 'حجم', ingredients: 'ترکیبات', productionDate: 'تاریخ تولید', expiryDate: 'تاریخ انقضا', healthLicense: 'مجوز بهداشت', contents: 'محتویات' };

export function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal, settings } = useSite();
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const remaining = settings.freeShippingThreshold - cartTotal;
  const shippingCost = remaining <= 0 ? 0 : settings.shippingCost;
  const total = cartTotal + shippingCost - discount;
  async function applyDiscount(e) { e.preventDefault(); setDiscountError(''); try { const r = await api('/discounts/validate', { method: 'POST', body: JSON.stringify({ code: discountCode, subtotal: cartTotal }) }); setDiscount(r.discount); } catch (err) { setDiscountError(err.message); setDiscount(0); } }
  if (cart.length === 0) return <PageIntro eyebrow="سبد خرید" title="سبد شما خالی است" description="محصولات مورد علاقه را به سبد اضافه کنید" />;
  return <>
    <PageIntro eyebrow="سبد خرید" title="سبد خرید شما" />
    <section className="section container cart-page">
      <div className="cart-items">
        {cart.map(item => <div key={item.id} className="cart-item">
          <img src={item.image} alt={item.name} />
          <div className="cart-item-info"><h3>{item.name}</h3><span className="price">{formatPrice(item.price)}</span></div>
          <div className="qty-control"><button onClick={() => updateQty(item.id, item.qty - 1)}><Icon name="Minus" size={16} /></button><span>{toFa(item.qty)}</span><button onClick={() => updateQty(item.id, item.qty + 1)}><Icon name="Plus" size={16} /></button></div>
          <span className="cart-item-total">{formatPrice(item.price * item.qty)}</span>
          <button className="remove-btn" onClick={() => removeFromCart(item.id)} aria-label="حذف"><Icon name="Trash2" size={18} /></button>
        </div>)}
      </div>
      <div className="cart-summary">
        <h3>خلاصه سفارش</h3>
        {remaining > 0 && <div className="free-shipping-bar"><p>تا ارسال رایگان فقط <strong>{formatPrice(remaining)}</strong> مانده!</p><div className="progress-bar"><div className="progress-fill" style={{ width: Math.min(100, (cartTotal / settings.freeShippingThreshold) * 100) + '%' }} /></div></div>}
        <div className="summary-row"><span>جمع کالاها</span><span>{formatPrice(cartTotal)}</span></div>
        <div className="summary-row"><span>هزینه ارسال</span><span>{shippingCost === 0 ? 'رایگان' : formatPrice(shippingCost)}</span></div>
        {discount > 0 && <div className="summary-row discount"><span>تخفیف</span><span>- {formatPrice(discount)}</span></div>}
        <form className="discount-form" onSubmit={applyDiscount}><input placeholder="کد تخفیف" value={discountCode} onChange={e => setDiscountCode(e.target.value)} /><button className="button small" type="submit">اعمال</button></form>
        {discountError && <p className="error">{discountError}</p>}
        <div className="summary-row total"><span>مبلغ قابل پرداخت</span><span>{formatPrice(total)}</span></div>
        <Link to="/checkout" className="button">ادامه و پرداخت <Icon name="ArrowLeft" size={18} /></Link>
      </div>
    </section>
  </>;
}

export function Checkout() {
  const { cart, cartTotal, clearCart, settings } = useSite();
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]);
  const [form, setForm] = useState({ customerName: '', phone: '', province: '', city: '', address: '', postalCode: '', shippingMethod: 'post', giftWrap: false, giftMessage: '', paymentMethod: 'zarinpal', discountCode: '' });
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  useEffect(() => { api('/provinces').then(setProvinces).catch(() => {}); }, []);
  if (cart.length === 0 && !result) return <PageIntro eyebrow="تسویه حساب" title="سبد خرید خالی است" description="ابتدا محصولاتی به سبد اضافه کنید" />;
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function onFile(e) { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setReceipt(r.result); r.readAsDataURL(f); }
  async function submit(e) { e.preventDefault(); setError(''); setBusy(true); try { const r = await api('/orders', { method: 'POST', body: JSON.stringify({ ...form, items: cart, receiptImage: receipt }) }); setResult(r); clearCart(); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  if (result) return <section className="section container"><div className="success-state"><span className="success-icon"><Icon name="Check" size={32} /></span><h2>سفارش شما ثبت شد!</h2><p>{result.message}</p><p>شماره سفارش: <b>#{toFa(result.id)}</b></p><p>مبلغ پرداخت: <b>{formatPrice(result.total)}</b></p><Link to="/" className="button">بازگشت به خانه</Link></div></section>;
  const shippingCost = form.shippingMethod === 'bike' ? settings.bikeCost : (cartTotal >= settings.freeShippingThreshold ? 0 : settings.shippingCost);
  return <>
    <PageIntro eyebrow="تسویه حساب" title="تکمیل سفارش" />
    <section className="section container checkout-page">
      <form onSubmit={submit} className="checkout-form">
        <div className="panel">
          <h3>اطلاعات تحویل‌گیرنده</h3>
          <div className="form-grid">
            <label>نام تحویل‌گیرنده<input value={form.customerName} onChange={e => set('customerName', e.target.value)} required /></label>
            <label>شماره موبایل<input type="tel" dir="ltr" value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="09123456789" /></label>
            <label>استان<select value={form.province} onChange={e => set('province', e.target.value)} required><option value="">انتخاب کنید</option>{provinces.map(p => <option key={p} value={p}>{p}</option>)}</select></label>
            <label>شهر<input value={form.city} onChange={e => set('city', e.target.value)} required /></label>
            <label className="full-field">آدرس کامل<textarea value={form.address} onChange={e => set('address', e.target.value)} required rows={3} /></label>
            <label>کد پستی (۱۰ رقم)<input type="text" dir="ltr" value={form.postalCode} onChange={e => set('postalCode', e.target.value)} required maxLength={10} placeholder="1234567890" /></label>
          </div>
        </div>
        <div className="panel">
          <h3>روش ارسال</h3>
          <div className="shipping-options">{shippingMethods.map(s => <label key={s.id} className={'radio-card' + (form.shippingMethod === s.id ? ' active' : '')}>
            <input type="radio" name="shippingMethod" value={s.id} checked={form.shippingMethod === s.id} onChange={e => set('shippingMethod', e.target.value)} />
            <div><b>{s.name}</b><small>{s.desc}</small></div>
            <span>{s.id === 'bike' ? formatPrice(settings.bikeCost) : (cartTotal >= settings.freeShippingThreshold ? 'رایگان' : formatPrice(settings.shippingCost))}</span>
          </label>)}</div>
        </div>
        <div className="panel">
          <h3>کادوپیچی</h3>
          <label className="checkbox-row"><input type="checkbox" checked={form.giftWrap} onChange={e => set('giftWrap', e.target.checked)} /> درخواست کادوپیچی</label>
          {form.giftWrap && <textarea placeholder="متن کارت هدیه (اختیاری)" value={form.giftMessage} onChange={e => set('giftMessage', e.target.value)} rows={2} />}
        </div>
        <div className="panel">
          <h3>روش پرداخت</h3>
          <div className="shipping-options">
            <label className={'radio-card' + (form.paymentMethod === 'zarinpal' ? ' active' : '')}>
              <input type="radio" name="paymentMethod" value="zarinpal" checked={form.paymentMethod === 'zarinpal'} onChange={e => set('paymentMethod', e.target.value)} />
              <div><b>پرداخت آنلاین</b><small>درگاه زرین‌پال</small></div>
            </label>
            <label className={'radio-card' + (form.paymentMethod === 'card' ? ' active' : '')}>
              <input type="radio" name="paymentMethod" value="card" checked={form.paymentMethod === 'card'} onChange={e => set('paymentMethod', e.target.value)} />
              <div><b>کارت به کارت</b><small>آپلود رسید</small></div>
            </label>
          </div>
          {form.paymentMethod === 'card' && <div className="receipt-upload"><label>تصویر رسید<input type="file" accept="image/*" onChange={onFile} /></label>{receipt && <p className="success-msg"><Icon name="Check" size={16} /> رسید انتخاب شد</p>}</div>}
        </div>
        {error && <p className="error">{error}</p>}
        <button className="button" disabled={busy}>{busy ? 'در حال ثبت...' : 'ثبت سفارش'}</button>
      </form>
      <div className="cart-summary checkout-summary">
        <h3>خلاصه سفارش</h3>
        {cart.map(item => <div key={item.id} className="summary-row"><span>{item.name} × {toFa(item.qty)}</span><span>{formatPrice(item.price * item.qty)}</span></div>)}
        <div className="summary-row"><span>ارسال</span><span>{shippingCost === 0 ? 'رایگان' : formatPrice(shippingCost)}</span></div>
        <div className="summary-row total"><span>مبلغ نهایی</span><span>{formatPrice(cartTotal + shippingCost)}</span></div>
      </div>
    </section>
  </>;
}

export function Login() {
  const { setUserSession } = useSite();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [devCode, setDevCode] = useState('');
  async function sendOtp(e) { e.preventDefault(); setError(''); setBusy(true); try { const r = await api('/auth/otp/send', { method: 'POST', body: JSON.stringify({ phone }) }); setDevCode(r.devCode || ''); setStep('verify'); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  async function verify(e) { e.preventDefault(); setError(''); setBusy(true); try { const r = await api('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone, code }) }); setUserSession(r.user); window.location.href = '/account'; } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <section className="section container auth-page">
    <div className="auth-box">
      <span className="eyebrow">ورود / ثبت‌نام</span>
      <h1>ورود با شماره موبایل</h1>
      {step === 'phone' ? <form onSubmit={sendOtp}>
        <label>شماره موبایل<input type="tel" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="09123456789" /></label>
        {error && <p className="error">{error}</p>}
        <button className="button" disabled={busy}>{busy ? 'در حال ارسال...' : 'ارسال کد تأیید'}</button>
      </form> : <form onSubmit={verify}>
        <p>کد ۴ رقمی به شماره <b dir="ltr">{phone}</b> ارسال شد.</p>
        {devCode && <p className="dev-code">کد توسعه: <b>{devCode}</b></p>}
        <label>کد تأیید<input type="text" dir="ltr" value={code} onChange={e => setCode(e.target.value)} required maxLength={4} placeholder="1234" /></label>
        {error && <p className="error">{error}</p>}
        <button className="button" disabled={busy}>{busy ? 'در حال بررسی...' : 'تأیید و ورود'}</button>
        <button type="button" className="text-link" onClick={() => setStep('phone')}>تغییر شماره</button>
      </form>}
    </div>
  </section>;
}

export function Account() {
  const { user, setUserSession, wishlist, settings } = useSite();
  const [tab, setTab] = useState('orders');
  const [orderId, setOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const navigate = useNavigate();
  async function trackOrder(e) { e.preventDefault(); setTrackError(''); setTrackedOrder(null); try { setTrackedOrder(await api('/orders/track/' + orderId)); } catch (err) { setTrackError(err.message); } }
  async function updateProfile(e) { e.preventDefault(); try { await api('/auth/profile', { method: 'PUT', body: JSON.stringify({ name }) }); setProfileMsg('پروفایل به‌روزرسانی شد.'); setUserSession({ ...user, name }); } catch (err) { setProfileMsg(err.message); } }
  if (!user) return <Login />;
  return <>
    <PageIntro eyebrow="حساب من" title={`سلام، ${user.name || user.phone}`} />
    <section className="section container account-page">
      <div className="account-tabs">
        <button className={'tab' + (tab === 'orders' ? ' active' : '')} onClick={() => setTab('orders')}>سفارش‌های من</button>
        <button className={'tab' + (tab === 'wishlist' ? ' active' : '')} onClick={() => setTab('wishlist')}>علاقه‌مندی‌ها</button>
        <button className={'tab' + (tab === 'profile' ? ' active' : '')} onClick={() => setTab('profile')}>ویرایش اطلاعات</button>
      </div>
      {tab === 'orders' && <div className="panel">
        <h3>پیگیری سفارش</h3>
        <form onSubmit={trackOrder} className="track-form"><input placeholder="شماره سفارش" value={orderId} onChange={e => setOrderId(e.target.value)} /><button className="button small" type="submit">پیگیری</button></form>
        {trackError && <p className="error">{trackError}</p>}
        {trackedOrder && <div className="tracked-order">
          <div className="summary-row"><span>شماره سفارش</span><b>#{toFa(trackedOrder.id)}</b></div>
          <div className="summary-row"><span>وضعیت</span><span className="status-badge">{orderStatuses[trackedOrder.status]}</span></div>
          <div className="summary-row"><span>مبلغ</span><span>{formatPrice(trackedOrder.total)}</span></div>
          {trackedOrder.trackingCode && <div className="summary-row"><span>کد رهگیری</span><b dir="ltr">{trackedOrder.trackingCode}</b></div>}
          <div className="summary-row"><span>تاریخ</span><span>{formatDate(trackedOrder.createdAt)}</span></div>
        </div>}
      </div>}
      {tab === 'wishlist' && <div>{wishlist.length === 0 ? <p className="muted">لیست علاقه‌مندی‌های شما خالی است.</p> : <WishlistProducts ids={wishlist} />}</div>}
      {tab === 'profile' && <div className="panel">
        <h3>ویرایش اطلاعات</h3>
        {profileMsg && <p className={profileMsg.includes('به‌روزرسانی') ? 'success-msg' : 'error'}>{profileMsg}</p>}
        <form onSubmit={updateProfile} className="form-grid">
          <label>نام<input value={name} onChange={e => setName(e.target.value)} /></label>
          <label>شماره موبایل<input value={user.phone} dir="ltr" disabled /></label>
          <button className="button" type="submit">ذخیره</button>
        </form>
        <button className="text-link" onClick={async () => { await api('/auth/logout', { method: 'POST' }); setUserSession(null); navigate('/'); }}>خروج از حساب</button>
      </div>}
    </section>
  </>;
}

function WishlistProducts({ ids }) {
  const [products, setProducts] = useState([]);
  useEffect(() => { api('/products').then(all => setProducts(all.filter(p => ids.includes(p.id)))).catch(() => {}); }, [ids]);
  return <div className="products-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>;
}

export function About() {
  const { settings } = useSite();
  return <>
    <PageIntro eyebrow="درباره ما" title="داستان گرم‌نور" description="عشق به نور و گرما" />
    <section className="section container about-page">
      <div className="about-content">
        <div>
          <span className="eyebrow">شروع یک مسیر</span>
          <h2>{settings.brandName || 'گرم‌نور'}</h2>
          <p>گرم‌نور با عشق به ساخت شمع‌های دست‌ساز و معطر شروع شد. ما باور داریم که یک شمع فقط منبع نور نیست؛ بلکه ایجادکنندهٔ حس آرامش، گرمی و دلبستگی در خانه است.</p>
          <p>محصولات ما شامل شمع‌های معطر با موم سویا و پارافین، وارمرهای برقی و سرامیکی برای پخش رایحه، و وازلین‌های بهداشتی و معطر است. تمام محصولات با کیفیت و عشق تولید می‌شوند.</p>
        </div>
        <img src="https://images.unsplash.com/photo-1603905179139-db12ab535ca9?auto=format&fit=crop&w=800&q=85" alt="درباره گرم‌نور" />
      </div>
    </section>
    <section className="section section-cream"><div className="container">
      <SectionHead eyebrow="چرا ما؟" title="چرا گرم‌نور را" highlight="انتخاب کنید" />
      <div className="why-grid">{whyUsItems.map(([icon, title, desc]) => <div key={icon} className="why-item"><span className="why-icon"><Icon name={icon} size={26} /></span><h3>{title}</h3><p>{desc}</p></div>)}</div>
    </div></section>
  </>;
}

export function Contact() {
  const { settings } = useSite();
  const [busy, setBusy] = useState(false), [sent, setSent] = useState(false), [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  async function submit(e) { e.preventDefault(); setBusy(true); setError(''); try { await api('/contact', { method: 'POST', body: JSON.stringify(form) }); setSent(true); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <>
    <PageIntro eyebrow="تماس با ما" title="با ما در ارتباط باشید" />
    <section className="section container contact-page">
      <div className="contact-info">
        <h3>راه‌های ارتباطی</h3>
        <div className="contact-item"><Icon name="Phone" size={20} /><div><b>تلفن</b><p>{settings.phone ? <a href={'tel:' + settings.phone} dir="ltr">{settings.phone}</a> : 'ثبت نشده'}</p></div></div>
        <div className="contact-item"><Icon name="MessageCircle" size={20} /><div><b>واتساپ</b><p>{settings.whatsapp ? <a href={'https://wa.me/' + settings.whatsapp} target="_blank" rel="noreferrer">ارسال پیام</a> : 'ثبت نشده'}</p></div></div>
        <div className="contact-item"><Icon name="Send" size={20} /><div><b>تلگرام</b><p>{settings.telegram ? <a href={settings.telegram} target="_blank" rel="noreferrer">ارسال پیام</a> : 'ثبت نشده'}</p></div></div>
        <div className="contact-item"><Icon name="Instagram" size={20} /><div><b>اینستاگرام</b><p>{settings.instagram ? <a href={settings.instagram} target="_blank" rel="noreferrer">مشاهده صفحه</a> : 'ثبت نشده'}</p></div></div>
        <div className="contact-item"><Icon name="Clock" size={20} /><div><b>ساعات پاسخگویی</b><p>{settings.workingHours}</p></div></div>
      </div>
      <div className="panel">
        {sent ? <div className="success-state"><span className="success-icon"><Icon name="Check" size={28} /></span><h3>پیام شما دریافت شد</h3><p>به‌زودی با شما تماس می‌گیریم.</p></div> :
        <form onSubmit={submit}><h3>فرم تماس</h3>
          <label>نام<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
          <label>شماره موبایل<input type="tel" dir="ltr" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="09123456789" /></label>
          <label>پیام<textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} /></label>
          {error && <p className="error">{error}</p>}
          <button className="button" disabled={busy}>{busy ? 'در حال ارسال...' : 'ارسال پیام'}</button>
        </form>}
      </div>
    </section>
  </>;
}

const faqs = [
  ['چمدان زمان ارسال می‌گیرد؟', 'ارسال معمولاً ۱ تا ۳ روز کاری زمان می‌برد، بسته به روش ارسال و مقصد.'],
  ['آیا امکان بازگشت کالا وجود دارد؟', 'بله، تا ۷ روز پس از تحویل می‌توانید کالا را بازگردانید، به شرط دست‌نخورده بودن.'],
  ['روش‌های پرداخت چیست؟', 'پرداخت آنلاین از درگاه زرین‌پال و کارت به کارت با امکان آپلود رسید.'],
  ['آیا بسته‌بندی هدیه دارید؟', 'بله، هنگام سفارش می‌توانید کادوپیچی و متن کارت هدیه را درخواست کنید.'],
  ['وازلین‌ها برای چه پوستی مناسبند؟', 'وازلین‌های ما برای انواع پوست مناسب هستند. برای پوست حساس، وازلین بدون عطر را انتخاب کنید.'],
];

export function FAQ() {
  const [open, setOpen] = useState(0);
  return <><PageIntro eyebrow="سوالات متداول" title="پرسش‌های شما" description="پاسخ پرسش‌های پرتکرار" />
    <section className="section container faq-page">{faqs.map(([q, a], i) => <div key={i} className="faq-item">
      <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>{q}<Icon name={open === i ? 'ChevronUp' : 'ChevronDown'} size={20} /></button>
      {open === i && <div className="faq-a"><p>{a}</p></div>}
    </div>)}</section>
  </>;
}

export function LegalPage({ type }) {
  const content = {
    shipping: { title: 'رویه ارسال', eyebrow: 'اطلاعات ارسال', body: 'ارسال به سراسر ایران از طریق پست پیشتاز، تیپاکس و پیک موتوری (در شهرهای منتخب) انجام می‌شود. زمان ارسال بسته به روش و مقصد ۱ تا ۳ روز کاری است. هزینه ارسال در زمان تسویه حساب نمایش داده می‌شود. برای سفارش‌های بالای ۵۰۰٬۰۰۰ تومان، ارسال با پست رایگان است.' },
    returns: { title: 'شرایط بازگشت کالا', eyebrow: 'بازگشت کالا', body: 'شما می‌توانید تا ۷ روز پس از تحویل کالا، در صورت دست‌نخورده بودن و سلامت بسته‌بندی، آن را بازگردانید. هزینه ارسال بازگشت بر عهده خریدار است. مبلغ کالا پس از دریافت و بررسی، به حساب شما بازگردانده می‌شود.' },
    terms: { title: 'قوانین و مقررات', eyebrow: 'قوانین', body: 'استفاده از این سایت به معنی پذیرش قوانین و مقررات آن است. تمام اطلاعات محصولات و قیمت‌ها قابل تغییر هستند. ثبت سفارش به معنی پذیرش شرایط فروش است. اطلاعات شخصی شما محرمانه نگه‌داری می‌شود.' },
    privacy: { title: 'حریم خصوصی', eyebrow: 'حریم خصوصی', body: 'اطلاعاتی که در فرم‌های ثبت‌نام، سفارش و تماس وارد می‌کنید، برای پردازش سفارش و پاسخگویی نگه‌داری می‌شود. اطلاعات شخصی شما بدون اجازه شما با هیچ شخص ثالثی به اشتراک گذاشته نمی‌شود. دسترسی به اطلاعات فقط از طریق پنل مدیریت محافظت‌شده امکان‌پذیر است.' },
  };
  const c = content[type];
  return <><PageIntro eyebrow={c.eyebrow} title={c.title} /><section className="section container article"><p>{c.body}</p></section></>;
}

export function Blog() {
  const [posts, setPosts] = useState([]);
  useEffect(() => { api('/posts').then(setPosts).catch(() => {}); }, []);
  return <><PageIntro eyebrow="بلاگ" title="مجله گرم‌نور" description="راهنما و نکات کاربردی" />
    <section className="section container blog-grid">{posts.map(p => <Link key={p.id} to={'/blog/' + p.id} className="blog-card">
      <img src={p.image} alt={p.title} loading="lazy" />
      <div><span className="eyebrow">{formatDate(p.date)}</span><h3>{p.title}</h3><span className="text-link">مطالعه مقاله <Icon name="ArrowLeft" size={16} /></span></div>
    </Link>)}</section>
  </>;
}

export function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api('/posts/' + slug).then(setPost).catch(e => setError(e.message)); }, [slug]);
  if (error) return <PageIntro eyebrow="خطا" title="مقاله پیدا نشد" />;
  if (!post) return <section className="section container"><p className="muted">در حال بارگذاری...</p></section>;
  return <><PageIntro eyebrow="بلاگ" title={post.title} />
    <article className="section container article">
      <img src={post.image} alt={post.title} />
      <time>{formatDate(post.date)}</time>
      {post.body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
      <Link to="/blog" className="text-link">بازگشت به بلاگ <Icon name="ArrowLeft" size={16} /></Link>
    </article>
  </>;
}

export function NotFound() {
  return <section className="section container not-found"><span className="eyebrow">۴۰۴</span><h1>این صفحه پیدا نشد</h1><Link to="/" className="button">بازگشت به خانه</Link></section>;
}
