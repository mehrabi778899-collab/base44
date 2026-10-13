import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Header, Footer, MobileBottomBar, WhatsAppFloat } from './components';
import { SiteProvider, useSite } from './context';
import { Home, Shop, ProductDetail, Cart, Checkout, Login, Account, About, Contact, FAQ, LegalPage, Blog, BlogPost, NotFound } from './pages';
import Admin from './admin';

function AppInner() {
  const location = useLocation();
  const { settings } = useSite();
  useEffect(() => { document.documentElement.lang = 'fa'; document.documentElement.dir = 'rtl'; }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    const titleMap = { '/': 'گرم‌نور | شمع‌های دست‌ساز و وارمر', '/shop': 'فروشگاه | گرم‌نور', '/about': 'درباره ما | گرم‌نور', '/blog': 'بلاگ | گرم‌نور', '/contact': 'تماس با ما | گرم‌نور', '/cart': 'سبد خرید | گرم‌نور', '/checkout': 'تسویه حساب | گرم‌نور', '/login': 'ورود | گرم‌نور', '/account': 'حساب من | گرم‌نور', '/faq': 'سوالات متداول | گرم‌نور', '/shipping': 'رویه ارسال | گرم‌نور', '/returns': 'بازگشت کالا | گرم‌نور', '/terms': 'قوانین | گرم‌نور', '/privacy': 'حریم خصوصی | گرم‌نور', '/admin': 'پنل مدیریت | گرم‌نور' };
    document.title = titleMap[location.pathname] || 'گرم‌نور';
  }, [location.pathname]);
  const isAdmin = location.pathname.startsWith('/admin');
  return <>
    {!isAdmin && <Header />}
    <main id="main">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/shipping" element={<LegalPage type="shipping" />} />
        <Route path="/returns" element={<LegalPage type="returns" />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    {!isAdmin && <Footer />}
    {!isAdmin && <MobileBottomBar />}
    {!isAdmin && <WhatsAppFloat />}
  </>;
}

export default function App() {
  return <SiteProvider><AppInner /></SiteProvider>;
}
