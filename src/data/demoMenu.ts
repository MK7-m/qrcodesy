import type { MenuCategory, MenuProduct } from '../types/menu';
import type { Restaurant, RestaurantReview } from '../types/restaurant';

export const DEMO_RESTAURANT_ID = 'b37946ab-98cd-435e-b264-91aa0ab5d3f2';

export const DEMO_RESTAURANT: Restaurant = {
  id: DEMO_RESTAURANT_ID,
  name: 'مطعم ليالي الحجاز',
  name_en: 'Layali Al Hijaz',
  logo_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=160&q=80',
  cover_image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  cover_images: [
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1100&q=80',
  ],
  description: 'رحلة إلى المطبخ الحجازي المعاصر مع أطباق موسمية ولمسة عصرية مقدمة بعناية للضيوف.',
  rating: 4.9,
  rating_count: 1280,
  cuisine_summary: 'مأكولات حجازية معاصرة • أفران حجرية • عروض موسمية',
  phone_number: '920012345',
  whatsapp_number: '966500000000',
  delivery_fee: 12,
  extra_fees: [
    { label: 'رسوم خدمة الطاولة', percentage: 5 },
    { label: 'ضريبة القيمة المضافة', percentage: 15 },
  ],
  opening_hours: [
    { day: 'sat', ranges: [{ from: '13:00', to: '01:00' }] },
    { day: 'sun', ranges: [{ from: '13:00', to: '01:00' }] },
    { day: 'mon', ranges: [{ from: '13:00', to: '01:00' }] },
    { day: 'tue', ranges: [{ from: '13:00', to: '01:00' }] },
    { day: 'wed', ranges: [{ from: '13:00', to: '01:00' }] },
    { day: 'thu', ranges: [{ from: '13:00', to: '02:00' }] },
    { day: 'fri', ranges: [{ from: '13:00', to: '02:00' }] },
  ],
  created_at: '2024-06-01T12:00:00Z',
  city: 'جدة',
  area: 'الحمراء',
  address_landmark: 'واجهة الكورنيش البحري',
  status_override: 'open',
  short_description: 'جلسات خارجية مطلة على البحر وخيارات نباتية مميزة.',
  long_description:
    'ليالي الحجاز يجمع الروائح العطرية للبهارات الأصلية مع تقديم معاصر، ويقدم تجربة ضيافة سعودية أصيلة مع طاقم متحدث بالعربية والإنجليزية.',
};

export const DEMO_MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'mock-cat-grills',
    restaurant_id: DEMO_RESTAURANT_ID,
    name: 'المشاوي الملكية',
    sort_order: 1,
    created_at: '2024-06-01T12:00:00Z',
  },
  {
    id: 'mock-cat-seafood',
    restaurant_id: DEMO_RESTAURANT_ID,
    name: 'بحريات البحر الأحمر',
    sort_order: 2,
    created_at: '2024-06-01T12:00:00Z',
  },
  {
    id: 'mock-cat-desserts',
    restaurant_id: DEMO_RESTAURANT_ID,
    name: 'حلويات القهوة العربية',
    sort_order: 3,
    created_at: '2024-06-01T12:00:00Z',
  },
];

export const DEMO_MENU_PRODUCTS: Record<string, MenuProduct[]> = {
  'mock-cat-grills': [
    {
      id: 'mock-dish-01',
      category_id: 'mock-cat-grills',
      name: 'كباب تندوري مدخن',
      price: 68,
      image_url: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=600&q=80',
      description: 'لحم غنم محلي متبل بخلطة الحجاز ووصفة اللبن المدخن مع خبز الطابون.',
      created_at: '2024-06-01T12:00:00Z',
    },
    {
      id: 'mock-dish-02',
      category_id: 'mock-cat-grills',
      name: 'ريش ظأن على الجمر',
      price: 92,
      image_url: 'https://images.unsplash.com/photo-1612197527762-3b5c6d3d4179?auto=format&fit=crop&w=600&q=80',
      description: 'ريش طازجة متبلة بالزعتر البري تقدم مع تبولة الرمان وصلصة الدقوس.',
      created_at: '2024-06-01T12:00:00Z',
    },
  ],
  'mock-cat-seafood': [
    {
      id: 'mock-dish-03',
      category_id: 'mock-cat-seafood',
      name: 'روبيان بحر أحمر مقرمش',
      price: 74,
      image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
      description: 'روبيان كبير يقدم مع صلصة الليمون المحترق وزيت الكزبرة الطازجة.',
      created_at: '2024-06-01T12:00:00Z',
    },
    {
      id: 'mock-dish-04',
      category_id: 'mock-cat-seafood',
      name: 'سمك ناجل مشوي بالفحم',
      price: 120,
      image_url: 'https://images.unsplash.com/photo-1470320691330-1e8a1b7ab103?auto=format&fit=crop&w=600&q=80',
      description: 'شرائح ناجل بصوص الليمون الأسود وتتبيلة الكركم والتمر الهندي.',
      created_at: '2024-06-01T12:00:00Z',
    },
  ],
  'mock-cat-desserts': [
    {
      id: 'mock-dish-05',
      category_id: 'mock-cat-desserts',
      name: 'بسبوسة الزعفران والورد',
      price: 32,
      image_url: 'https://images.unsplash.com/photo-1505253216365-31c9c1c762ea?auto=format&fit=crop&w=600&q=80',
      description: 'بسبوسة طرية مع عسل السدر وكريمة مستكة خفيفة.',
      created_at: '2024-06-01T12:00:00Z',
    },
    {
      id: 'mock-dish-06',
      category_id: 'mock-cat-desserts',
      name: 'آيس كريم تمر مديني',
      price: 38,
      image_url: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=600&q=80',
      description: 'آيس كريم بسكوت الزنجبيل ودبس التمر مع مكسرات محمصة.',
      created_at: '2024-06-01T12:00:00Z',
    },
  ],
};

export const DEMO_REVIEWS: RestaurantReview[] = [
  {
    id: 'mock-review-1',
    restaurant_id: DEMO_RESTAURANT_ID,
    author_name: 'فيصل الحربي',
    rating: 5,
    comment: 'جلسات خارجية جميلة والأكل يقدم بسرعة حتى وقت الذروة. أنصح بتجربة ريش الظأن.',
    created_at: '2024-06-10T21:00:00Z',
  },
  {
    id: 'mock-review-2',
    restaurant_id: DEMO_RESTAURANT_ID,
    author_name: 'رهف الشهري',
    rating: 4.8,
    comment: 'القائمة واضحة في الجوال وخيارات النباتيين ممتازة، فريق الخدمة متعاون للغاية.',
    created_at: '2024-06-08T17:30:00Z',
  },
];
