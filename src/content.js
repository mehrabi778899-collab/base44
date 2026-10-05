export const images = {
  hero: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1500&q=90',
  driver: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=900',
  warehouse: 'https://images.unsplash.com/photo-1586528116493-a029325540fa?auto=format&fit=crop&w=700&q=85',
  truck: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=700&q=85',
  cargo: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=700&q=85',
  night: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1600&q=85'
};
export const services = [
  { slug: 'domestic', icon: 'Truck', fa: 'حمل‌ونقل داخلی', en: 'Domestic Road Freight', shortFa: 'از هر نقطه ایران، به هر مقصد', shortEn: 'Every corner of Iran, connected.', image: images.truck, detailFa: 'حمل‌ونقل جاده‌ای در سراسر ایران، با انتخاب ناوگان متناسب با وزن، ابعاد و نوع محموله شما. از برنامه‌ریزی بارگیری تا تحویل در مقصد، تیم ما مسیر را هماهنگ می‌کند.', detailEn: 'Road transport throughout Iran, with vehicles matched to your cargo weight, dimensions, and requirements. Our team coordinates every step from pickup planning to delivery.' },
  { slug: 'international', icon: 'Globe2', fa: 'حمل‌ونقل بین‌المللی', en: 'International Road Freight', shortFa: 'مسیرهای مطمئن، فراتر از مرزها', shortEn: 'Reliable roads beyond borders.', image: images.hero, detailFa: 'حمل جاده‌ای به و از ترکیه، عراق، افغانستان، ارمنستان، آذربایجان، آسیای میانه و اروپا. امکان استفاده از رویه TIR بر اساس مسیر و شرایط محموله بررسی می‌شود.', detailEn: 'Road freight to and from Turkey, Iraq, Afghanistan, Armenia, Azerbaijan, Central Asia, and Europe. TIR availability is assessed according to the route and cargo requirements.' },
  { slug: 'ftl', icon: 'Container', fa: 'حمل بار کامل (FTL)', en: 'Full Truckload (FTL)', shortFa: 'یک کامیون، فقط برای بار شما', shortEn: 'One truck, dedicated to you.', image: images.truck + '&sat=-25', detailFa: 'اختصاص ظرفیت کامل کامیون به یک محموله برای حمل مستقیم و هماهنگی بهتر زمان‌بندی. انتخاب مناسب برای بارهای حجیم و محموله‌های حساس به زمان.', detailEn: 'Dedicated truck capacity for a single shipment, offering direct transport and coordinated scheduling. Ideal for larger loads and time-sensitive freight.' },
  { slug: 'ltl', icon: 'Boxes', fa: 'خرده‌بار و گروپاژ (LTL)', en: 'Less Than Truckload (LTL)', shortFa: 'بار کمتر، انتخاب اقتصادی‌تر', shortEn: 'Smaller loads. Smarter costs.', image: images.cargo, detailFa: 'تجمیع محموله‌های کوچک‌تر در یک کامیون برای استفاده اقتصادی از ظرفیت. زمان‌بندی حمل و سازگاری کالاها پیش از پذیرش بررسی می‌شود.', detailEn: 'Consolidating smaller shipments to make efficient use of truck capacity. Scheduling and cargo compatibility are reviewed before acceptance.' },
  { slug: 'refrigerated', icon: 'Snowflake', fa: 'حمل‌ونقل یخچالی', en: 'Refrigerated Transport', shortFa: 'حفظ کیفیت در تمام مسیر', shortEn: 'Freshness, every mile.', image: images.warehouse, detailFa: 'حمل کالاهای حساس به دما با کامیون یخچالی. محدوده دمایی، الزامات پایش و بسته‌بندی بر اساس مشخصات محصول پیش از حمل هماهنگ می‌شود.', detailEn: 'Temperature-sensitive freight with refrigerated vehicles. Temperature range, monitoring, and packaging requirements are coordinated according to product specifications.' },
  { slug: 'customs', icon: 'FileCheck2', fa: 'امور گمرکی و مرزی', en: 'Customs & Border Documents', shortFa: 'عبور آسان‌تر، با مدارک کامل', shortEn: 'Clear documents. Clear passage.', image: images.warehouse + '&sat=-30', detailFa: 'هماهنگی مدارک حمل و فرآیندهای مرزی در کنار حمل جاده‌ای. فهرست مدارک و الزامات هر مسیر بر اساس کشور مقصد و نوع کالا بررسی می‌شود.', detailEn: 'Transport documentation and border-process coordination alongside road freight. Requirements are reviewed according to the destination country and cargo type.' }
];
export const industries = [
 ['ShoppingBag', 'خرده‌فروشی و تجارت', 'Retail & E-commerce'], ['Factory', 'صنایع تولیدی', 'Manufacturing'], ['CarFront', 'خودرو و قطعات', 'Automotive'], ['Pill', 'دارو و سلامت', 'Pharmaceutical'], ['Utensils', 'مواد غذایی', 'Food & Beverage'], ['HardHat', 'مصالح ساختمانی', 'Construction'], ['FlaskConical', 'پتروشیمی', 'Petrochemical'], ['Wheat', 'کشاورزی', 'Agriculture']
];
export const routes = [
 { fa: 'ترکیه', en: 'Turkey', cityFa: 'استانبول', cityEn: 'Istanbul', days: '۵–۷', daysEn: '5–7', x: 290, y: 107 },
 { fa: 'عراق', en: 'Iraq', cityFa: 'بغداد', cityEn: 'Baghdad', days: '۳–۵', daysEn: '3–5', x: 338, y: 229 },
 { fa: 'افغانستان', en: 'Afghanistan', cityFa: 'کابل', cityEn: 'Kabul', days: '۴–۶', daysEn: '4–6', x: 635, y: 213 },
 { fa: 'ارمنستان', en: 'Armenia', cityFa: 'ایروان', cityEn: 'Yerevan', days: '۳–۴', daysEn: '3–4', x: 402, y: 85 },
 { fa: 'آذربایجان', en: 'Azerbaijan', cityFa: 'باکو', cityEn: 'Baku', days: '۳–۵', daysEn: '3–5', x: 495, y: 100 },
 { fa: 'آسیای میانه', en: 'Central Asia', cityFa: 'تاشکند', cityEn: 'Tashkent', days: '۷–۱۰', daysEn: '7–10', x: 666, y: 84 },
 { fa: 'اروپا', en: 'Europe', cityFa: 'مقاصد اروپایی', cityEn: 'European destinations', days: '۱۲–۱۸', daysEn: '12–18', x: 140, y: 66 }
];
export const stages = ['Loaded', 'In Transit', 'At Border', 'Customs', 'Delivered'];
export const stageFa = { Loaded: 'بارگیری شده', 'In Transit': 'در مسیر', 'At Border': 'در مرز', Customs: 'گمرک', Delivered: 'تحویل شده' };
export const nav = [['/', 'خانه', 'Home'], ['/services', 'خدمات', 'Services'], ['/routes', 'مسیرها', 'Routes'], ['/about', 'درباره ما', 'About'], ['/blog', 'مجله', 'Journal'], ['/contact', 'تماس با ما', 'Contact']];
export async function api(path, options = {}) {
  const response = await fetch('/api' + path, { ...options, headers: { 'Content-Type': 'application/json', 'X-App-Request': 'freight', ...options.headers } });
  const data = await response.json();
  if (!response.ok) { const error = new Error(data.error || 'Request failed'); error.status = response.status; throw error; }
  return data;
}
