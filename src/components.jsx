import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Heart, User, Menu, X, Search, Star, Plus, Minus, Trash2, Phone, Mail, MapPin, Clock, Instagram, Send, MessageCircle, Truck, ShieldCheck, Gift, Zap, Check, Flame, Lightbulb, Droplet, Bell, ArrowLeft, ChevronDown, ChevronUp, Filter, Share2, Package, BadgeCheck, LockKeyhole, LogOut, Settings, LayoutDashboard, Tag, MessageSquare, TrendingUp } from 'lucide-react';
import { useSite } from './context';
import { nav, categories, toFa, formatPrice, discountPercent } from './content';

const Icons = { Home, ShoppingBag, Heart, User, Menu, X, Search, Star, Plus, Minus, Trash2, Phone, Mail, MapPin, Clock, Instagram, Send, MessageCircle, Truck, ShieldCheck, Gift, Zap, Check, Flame, Lightbulb, Droplet, Bell, ArrowLeft, ChevronDown, ChevronUp, Filter, Share2, Package, BadgeCheck, LockKeyhole, LogOut, Settings, LayoutDashboard, Tag, MessageSquare, TrendingUp };
export function Icon({ name, size = 22, ...props }) { const C = Icons[name] || Icons.Package; return <C size={size} strokeWidth={1.65} {...props} />; }

export function Logo({ light = false }) {
  const { settings } = useSite();
  return <Link to="/" className={'logo' + (light ? ' logo-light' : '')} aria-label="خانه">
    <span className="logo-mark"><Icon name="Flame" size={26} /></span>
    <span><strong>{settings.brandName || 'گرم‌نور'}</strong><small>نورِ گرم، لحظه‌های دلبند</small></span>
  </Link>;
}

export function StarRating({ rating, size = 14 }) {
  return <div className="stars">{[1,2,3,4,5].map(i => <Star key={i} size={size} fill={i <= Math.round(rating) ? 'currentColor' : 'none'} strokeWidth={1.5} className={i <= Math.round(rating) ? 'filled' : ''} />)}</div>;
}

export function SectionHead({ eyebrow, title, highlight, link, to }) {
  return <div className="section-head">
    <div><span className="eyebrow">{eyebrow}</span><h2>{title} {highlight && <em>{highlight}</em>}</h2></div>
    {link && <Link className="text-link" to={to}>{link}<Icon name="ArrowLeft" size={16} /></Link>}
  </div>;
}

export function ProductCard({ product }) {
  const { addToCart, toggleWishlist, inWishlist } = useSite();
  const dp = discountPercent(product.price, product.oldPrice);
  return <Link to={'/product/' + product.slug} className="product-card">
    <div className="product-image">
      <img src={product.images?.[0]} alt={product.name} loading="lazy" />
      {dp && <span className="discount-badge">٪{dp} تخفیف</span>}
      {product.stock === 0 && <span className="out-of-stock-badge">ناموجود</span>}
      {product.isNew && product.stock > 0 && <span className="new-badge">جدید</span>}
    </div>
    <div className="product-body">
      <h3>{product.name}</h3>
      <div className="price-row">
        <span className="price">{formatPrice(product.price)}</span>
        {product.oldPrice && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
      </div>
      <div className="product-actions">
        <button className="add-btn" disabled={product.stock === 0} onClick={e => { e.preventDefault(); addToCart(product, 1); }} aria-label="افزودن به سبد">
          <Icon name="Plus" size={18} />
        </button>
        <button className={'wish-btn' + (inWishlist(product.id) ? ' active' : '')} onClick={e => { e.preventDefault(); toggleWishlist(product.id); }} aria-label="علاقه‌مندی">
          <Heart size={18} fill={inWishlist(product.id) ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  </Link>;
}

export function Header() {
  const { cartCount, user, settings } = useSite();
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  function doSearch(e) { e.preventDefault(); if (search.trim()) { navigate('/shop?search=' + encodeURIComponent(search.trim())); setSearch(''); setMobile(false); } }
  return <>
    <header className="header">
      <div className="container header-inner">
        <Logo />
        <nav className="desktop-nav">{nav.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}</nav>
        <div className="header-actions">
          <form className="search-box" onSubmit={doSearch}>
            <input type="text" placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit" aria-label="جستجو"><Icon name="Search" size={18} /></button>
          </form>
          <Link to="/account" className="header-icon" aria-label="حساب من"><Icon name="User" size={22} /></Link>
          <Link to="/cart" className="header-icon cart-icon" aria-label="سبد خرید"><Icon name="ShoppingBag" size={22} />{cartCount > 0 && <span className="cart-badge">{toFa(cartCount)}</span>}</Link>
          <button className="menu-button" aria-label="منو" onClick={() => setMobile(!mobile)}><Icon name={mobile ? 'X' : 'Menu'} size={24} /></button>
        </div>
      </div>
      {mobile && <nav className="mobile-nav">
        <form className="search-box mobile-search" onSubmit={doSearch}>
          <input type="text" placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit" aria-label="جستجو"><Icon name="Search" size={18} /></button>
        </form>
        {nav.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobile(false)}>{label}</NavLink>)}
        <div className="mobile-cats">{categories.map(c => <Link key={c.slug} to={'/shop?category=' + c.slug} onClick={() => setMobile(false)}>{c.name}</Link>)}</div>
      </nav>}
    </header>
  </>;
}

export function Footer() {
  const { settings } = useSite();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  return <footer className="footer">
    <div className="container footer-main">
      <div className="footer-brand">
        <Logo light />
        <p>شمع‌های دست‌ساز، وارمر و وازلین معطر با کیفیت و عشق تولید می‌شود.</p>
        <div className="socials">
          {settings.instagram ? <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="اینستاگرام"><Icon name="Instagram" size={18} /></a> : <span className="social-placeholder" aria-label="اینستاگرام"><Icon name="Instagram" size={18} /></span>}
          {settings.telegram ? <a href={settings.telegram} target="_blank" rel="noreferrer" aria-label="تلگرام"><Icon name="Send" size={18} /></a> : <span className="social-placeholder" aria-label="تلگرام"><Icon name="Send" size={18} /></span>}
          {settings.whatsapp ? <a href={'https://wa.me/' + settings.whatsapp} target="_blank" rel="noreferrer" aria-label="واتساپ"><Icon name="MessageCircle" size={18} /></a> : <span className="social-placeholder" aria-label="واتساپ"><Icon name="MessageCircle" size={18} /></span>}
        </div>
        <div className="trust-badges">
          <span className="namad-placeholder">نماد اعتماد الکترونیک<br />(اینماد)</span>
          <span className="namad-placeholder">ساماندهی<br />رسانه‌های دیجیتال</span>
        </div>
      </div>
      <div><h4>دسترسی سریع</h4>{nav.map(([to,label]) => <Link key={to} to={to}>{label}</Link>)}
        <Link to="/faq">سوالات متداول</Link><Link to="/shipping">رویه ارسال</Link><Link to="/returns">بازگشت کالا</Link>
      </div>
      <div><h4>دسته‌بندی‌ها</h4>{categories.map(c => <Link key={c.slug} to={'/shop?category=' + c.slug}>{c.name}</Link>)}</div>
      <div className="footer-contact">
        <h4>تماس با ما</h4>
        <p><Icon name="MapPin" size={17} />{settings.address || 'آدرس ثبت نشده است'}</p>
        <p><Icon name="Phone" size={17} />{settings.phone ? <a href={'tel:' + settings.phone} dir="ltr">{settings.phone}</a> : 'تماس ثبت نشده'}</p>
        <p><Icon name="Mail" size={17} />{settings.email || 'ایمیل ثبت نشده'}</p>
        <p><Icon name="Clock" size={17} />{settings.workingHours}</p>
      </div>
      <div className="footer-newsletter">
        <h4>عضویت در خبرنامه</h4>
        <p>از تخفیف‌ها و محصولات جدید باخبر شوید.</p>
        {subscribed ? <p className="success-msg"><Icon name="Check" size={16} />عضویت شما ثبت شد!</p> :
        <form onSubmit={e => { e.preventDefault(); if (email) { setSubscribed(true); setEmail(''); } }}>
          <input type="email" placeholder="ایمیل شما" value={email} onChange={e => setEmail(e.target.value)} dir="ltr" />
          <button type="submit" aria-label="عضویت"><Icon name="ArrowLeft" size={18} /></button>
        </form>}
      </div>
    </div>
    <div className="container footer-bottom">
      <span>© {toFa(1405)} {settings.brandName || 'گرم‌نور'}؛ تمامی حقوق محفوظ است.</span>
      <div><Link to="/privacy">حریم خصوصی</Link><Link to="/terms">قوانین و مقررات</Link><Link to="/admin">مدیریت</Link></div>
    </div>
  </footer>;
}

export function MobileBottomBar() {
  const { cartCount } = useSite();
  return <nav className="mobile-bottom-bar">
    <Link to="/"><Icon name="Home" size={22} /><span>خانه</span></Link>
    <Link to="/shop"><Icon name="Filter" size={22} /><span>دسته‌بندی</span></Link>
    <Link to="/cart" className="bar-cart"><Icon name="ShoppingBag" size={22} />{cartCount > 0 && <span className="cart-badge">{toFa(cartCount)}</span>}<span>سبد</span></Link>
    <Link to="/account"><Icon name="User" size={22} /><span>حساب من</span></Link>
  </nav>;
}

export function WhatsAppFloat() {
  const { settings } = useSite();
  if (!settings.whatsapp) return null;
  return <a href={'https://wa.me/' + settings.whatsapp} target="_blank" rel="noreferrer" className="whatsapp-float" aria-label="پشتیبانی واتساپ"><Icon name="MessageCircle" size={26} /></a>;
}

export function CountdownTimer({ hours = 24 }) {
  const [remaining, setRemaining] = useState(hours * 3600);
  useEffect(() => { const t = setInterval(() => setRemaining(r => r > 0 ? r - 1 : 0), 1000); return () => clearInterval(t); }, []);
  const h = Math.floor(remaining / 3600), m = Math.floor((remaining % 3600) / 60), s = remaining % 60;
  return <div className="countdown">
    <span><b>{toFa(String(h).padStart(2,'0'))}</b><small>ساعت</small></span>
    <span><b>{toFa(String(m).padStart(2,'0'))}</b><small>دقیقه</small></span>
    <span><b>{toFa(String(s).padStart(2,'0'))}</b><small>ثانیه</small></span>
  </div>;
}
