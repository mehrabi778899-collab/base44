export const toFa = n => String(n ?? '').replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
export const formatPrice = n => toFa(Number(n).toLocaleString('en-US')) + ' تومان';
export const formatDate = d => new Date(d).toLocaleDateString('fa-IR');
export const discountPercent = (price, oldPrice) => oldPrice ? toFa(Math.round((1 - price / oldPrice) * 100)) : null;

export const categories = [
  { slug: 'candle', name: 'شمع', icon: 'Flame', desc: 'شمع‌های دست‌ساز معطر' },
  { slug: 'warmer', name: 'وارمر', icon: 'Lightbulb', desc: 'گرم‌کن شمع و وکس ملت' },
  { slug: 'vaseline', name: 'وازلین', icon: 'Droplet', desc: 'وازلین بهداشتی و معطر' },
  { slug: 'gift', name: 'پک هدیه', icon: 'Gift', desc: 'ست‌های هدیه ویژه' },
];

export const nav = [
  ['/', 'خانه'],
  ['/shop', 'فروشگاه'],
  ['/about', 'درباره ما'],
  ['/blog', 'بلاگ'],
  ['/contact', 'تماس با ما'],
];

export const shippingMethods = [
  { id: 'post', name: 'پست پیشتاز', desc: '۲ تا ۳ روز کاری' },
  { id: 'tipax', name: 'تیپاکس', desc: '۱ تا ۲ روز کاری' },
  { id: 'bike', name: 'پیک موتوری', desc: 'همان روز (فقط در شهر)' },
];

export const orderStatuses = {
  pending: 'در انتظار پرداخت',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
};

export async function api(path, options = {}) {
  const response = await fetch('/api' + path, { ...options, headers: { 'Content-Type': 'application/json', 'X-App-Request': 'garmnoor', ...options.headers } });
  const data = await response.json();
  if (!response.ok) { const error = new Error(data.error || 'خطا در درخواست'); error.status = response.status; throw error; }
  return data;
}
