import React, { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Header, Footer, QuoteModal } from './components';
import { SiteContext } from './context';
import { Home, Services, ServiceDetail, RoutesPage, About, Blog, BlogPost, Contact, Track, Legal, NotFound } from './pages';
import Admin from './admin';
import { api } from './content';

export default function App() {
 const [lang,setLang]=useState(()=>localStorage.getItem('freight-lang')||'fa');
 const [quote,setQuote]=useState(false);
 const [settings,setSettings]=useState({brandFa:'نام برند',brandEn:'[BRAND NAME]',phone:'',email:'',address:'',whatsapp:'',instagram:'',linkedin:'',telegram:''});
 const location=useLocation(), fa=lang==='fa';
 const closeQuote=useCallback(()=>setQuote(false),[]);
 useEffect(()=>{api('/settings').then(setSettings).catch(()=>{});},[]);
 useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=fa?'rtl':'ltr';localStorage.setItem('freight-lang',lang);},[lang,fa]);
 useEffect(()=>{window.scrollTo(0,0);setQuote(false);const titleMap={'/':fa?'حمل‌ونقل جاده‌ای بدون مرز':'Road freight beyond borders','/services':fa?'خدمات حمل‌ونقل جاده‌ای':'Road freight services','/routes':fa?'مسیرهای بین‌المللی':'International routes','/about':fa?'درباره ما':'About us','/blog':fa?'مجله حمل‌ونقل':'Road freight journal','/contact':fa?'تماس با ما':'Contact us','/track':fa?'رهگیری محموله':'Track your shipment','/admin':fa?'پنل مدیریت':'Admin dashboard','/privacy':fa?'حریم خصوصی':'Privacy policy','/terms':fa?'شرایط استفاده':'Terms of use'};document.title=(titleMap[location.pathname]||(fa?'حمل‌ونقل جاده‌ای':'Road freight'))+' | '+(fa?settings.brandFa:settings.brandEn);document.querySelector('meta[name="description"]').content=fa?'خدمات حمل‌ونقل جاده‌ای داخلی و بین‌المللی؛ بار کامل، خرده‌بار، حمل یخچالی و هماهنگی گمرکی در ایران، کشورهای همسایه و اروپا.':'Domestic and international road freight from Iran. FTL, LTL, refrigerated transport, and border documentation for neighboring countries and Europe.';},[location.pathname,fa,settings.brandFa,settings.brandEn]);
 return <SiteContext.Provider value={{fa,lang,settings,setSettings,toggleLanguage:()=>setLang(fa?'en':'fa'),openQuote:()=>setQuote(true),closeQuote}}><a className="skip-link" href="#main">{fa?'رفتن به محتوا':'Skip to content'}</a><Header/><main id="main"><Routes><Route path="/" element={<Home/>}/><Route path="/services" element={<Services/>}/><Route path="/services/:slug" element={<ServiceDetail/>}/><Route path="/routes" element={<RoutesPage/>}/><Route path="/about" element={<About/>}/><Route path="/blog" element={<Blog/>}/><Route path="/blog/:slug" element={<BlogPost/>}/><Route path="/contact" element={<Contact/>}/><Route path="/track" element={<Track/>}/><Route path="/admin" element={<Admin/>}/><Route path="/privacy" element={<Legal/>}/><Route path="/terms" element={<Legal terms/>}/><Route path="*" element={<NotFound/>}/></Routes></main><Footer/>{quote&&<QuoteModal/>}</SiteContext.Provider>;
}
