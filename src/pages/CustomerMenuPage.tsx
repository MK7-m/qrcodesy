import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { DEMO_MENU_CATEGORIES, DEMO_MENU_PRODUCTS, DEMO_RESTAURANT, DEMO_RESTAURANT_ID } from '../data/demoMenu';
import { Grid, List, ShoppingCart, Minus, Plus, X, StickyNote, Home, Info } from 'lucide-react';
import { CheckoutFlow } from '../components/CheckoutFlow';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Dish = Database['public']['Tables']['dishes']['Row'];

interface CartItem extends Dish {
  quantity: number;
  notes: string;
}

type OrderMode = 'dine-in' | 'delivery' | 'pickup';

export function CustomerMenuPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');
  const orderType = searchParams.get('type') as 'delivery' | 'pickup' | null;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'cart'>('menu');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedOrderMode, setSelectedOrderMode] = useState<OrderMode | null>(null);

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    if (!restaurantId) return;

    if (restaurantId === DEMO_RESTAURANT_ID) {
      setRestaurant(buildDemoRestaurant());
      setCategories(buildDemoCategories());
      setDishes(buildDemoDishes());
      setLoading(false);
      return;
    }

    const [restaurantRes, categoriesRes, dishesRes] = await Promise.all([
      supabase.from('restaurants').select('*').eq('id', restaurantId).maybeSingle(),
      supabase.from('categories').select('*').eq('restaurant_id', restaurantId).eq('is_active', true).order('sort_order'),
      supabase.from('dishes').select('*').eq('restaurant_id', restaurantId).order('sort_order'),
    ]);

    if (restaurantRes.error || !restaurantRes.data) {
      console.error('Restaurant not found');
      setLoading(false);
      return;
    }

    setRestaurant(restaurantRes.data);
    setCategories(categoriesRes.data || []);
    setDishes(dishesRes.data || []);
    setLoading(false);
  };

  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === dish.id);
      if (existing) {
        return prev.map((item) => (item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { ...dish, quantity: 1, notes: '' }];
    });
  };

  const updateCartItem = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== dishId));
    } else {
      setCart((prev) => prev.map((item) => (item.id === dishId ? { ...item, quantity } : item)));
    }
  };

  const updateCartItemNotes = (dishId: string, notes: string) => {
    setCart((prev) => prev.map((item) => (item.id === dishId ? { ...item, notes } : item)));
  };

  const removeFromCart = (dishId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== dishId));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const plan: 'a' | 'b' | 'c' = (restaurant?.plan ?? 'a') as 'a' | 'b' | 'c';
  const canOrder = plan === 'b' || plan === 'c';

  useEffect(() => {
    if (!restaurant) return;

    if (plan === 'a') {
      setSelectedOrderMode(null);
      return;
    }

    if (plan === 'b') {
      setSelectedOrderMode('dine-in');
      return;
    }

    if (orderType === 'delivery' || orderType === 'pickup') {
      setSelectedOrderMode(orderType);
    } else if (tableId) {
      setSelectedOrderMode('dine-in');
    } else {
      setSelectedOrderMode('delivery');
    }
  }, [restaurant, plan, orderType, tableId]);

  const effectiveOrderMode: OrderMode | null = plan === 'a' ? null : plan === 'b' ? 'dine-in' : selectedOrderMode;
  const isDineIn = effectiveOrderMode === 'dine-in';
  const isDeliveryPickup = effectiveOrderMode === 'delivery' || effectiveOrderMode === 'pickup';
  const orderModeOptions: { mode: OrderMode; label: string; description: string }[] = [
    {
      mode: 'dine-in',
      label: 'طلب داخل الصالة',
      description: 'سجل رقم الطاولة ليصلك الطلب مباشرة داخل المطعم',
    },
    {
      mode: 'delivery',
      label: 'توصيل',
      description: 'أدخل العنوان وسنوصّل الطلب إلى باب منزلك',
    },
    {
      mode: 'pickup',
      label: 'استلام من المطعم',
      description: 'استلم الطلب بنفسك عند الموعد الذي تختاره',
    },
  ];
  const orderModeDescriptions: Record<OrderMode, string> = {
    'dine-in': 'سيتم تجهيز طلبك وتقديمه على الطاولة التي تحتوي عليها الصفحة أو تدخلها هنا.',
    delivery: 'سيتم توصيل الطلب إلى العنوان الذي تضيفه في شاشة الدفع.',
    pickup: 'سنُعلمك عندما يصبح الطلب جاهزاً لتستلمه من المطعم.',
  };

  const filteredDishes = useMemo(() => {
    if (selectedCategory) return dishes.filter((d) => d.category_id === selectedCategory);
    return dishes;
  }, [dishes, selectedCategory]);
  const handleCheckout = () => {
    if (!effectiveOrderMode) return;
    setShowCheckout(true);
  };

  if (showCheckout && restaurant && effectiveOrderMode) {
    return (
      <CheckoutFlow
        restaurant={restaurant}
        cart={cart}
        tableId={tableId}
        orderMode={effectiveOrderMode}
        plan={plan}
        onBack={() => setShowCheckout(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">المطعم غير موجود</h1>
          <p className="text-slate-600">الرجاء التحقق من الرابط</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-gradient-to-br from-orange-500 to-orange-600 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="w-16 h-16 rounded-xl object-cover bg-white p-1" />
            ) : (
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                <span className="text-3xl text-orange-500">🍽️</span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              {restaurant.description && <p className="text-orange-50 text-sm mt-1">{restaurant.description}</p>}
            </div>
          </div>
          {isDineIn && (
            <div className="mt-4 bg-orange-400/50 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
              <p className="font-semibold">الطاولة: {tableId ?? 'غير محددة'}</p>
            </div>
          )}
        </div>
      </header>

      {canOrder && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 transition-colors ${
                activeTab === 'menu' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-slate-600'
              }`}
            >
              <Home className="w-5 h-5" />
              القائمة
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 transition-colors relative ${
                activeTab === 'cart' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-slate-600'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              السلة
              {cart.length > 0 && (
                <span className="absolute top-2 right-1/2 translate-x-6 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      <div className={`${activeTab === 'menu' ? 'block' : 'hidden md:block'}`}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4 mb-6">
            {plan === 'a' && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-slate-800 shadow-sm">
                <p className="font-semibold text-orange-600 mb-1">عرض فقط</p>
                <p>هذه النسخة هي قائمة رقمية فقط. الطلب متاح في الخطط الأعلى.</p>
              </div>
            )}
            {plan === 'b' && (
              <div className="rounded-2xl border border-orange-200 bg-white/80 p-4 text-sm text-slate-700 shadow-sm">
                <p className="font-semibold text-slate-900 mb-1">طلبات داخل الصالة فقط</p>
                <p>هذه القائمة مخصصة لطلبات داخل الصالة عن طريق مسح رمز QR على الطاولة.</p>
              </div>
            )}
            {plan === 'c' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-800 mb-3">اختر طريقة الطلب</p>
                <div className="flex flex-wrap gap-3">
                  {orderModeOptions.map((option) => (
                    <button
                      key={option.mode}
                      type="button"
                      onClick={() => setSelectedOrderMode(option.mode)}
                      className={`flex flex-col min-w-[150px] flex-1 gap-1 rounded-2xl border p-3 text-left text-sm transition ${
                        selectedOrderMode === option.mode
                          ? 'bg-orange-500 text-white border-transparent shadow-lg'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-xs text-current/70">{option.description}</span>
                    </button>
                  ))}
                </div>
                {selectedOrderMode && (
                  <p className="mt-3 text-xs text-slate-500">{orderModeDescriptions[selectedOrderMode]}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">القائمة</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>

          {viewMode === 'grid' && (
            <div className="mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                    className={`rounded-xl overflow-hidden border-2 transition-all ${
                      selectedCategory === category.id ? 'border-orange-500 shadow-lg' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {category.image_url ? (
                      <img src={category.image_url} alt={category.name} className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    <div className="p-3 bg-white">
                      <h3 className="font-semibold text-slate-900 text-center">{category.name}</h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'list' && categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  !selectedCategory ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                الكل
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {filteredDishes.map((dish) => {
              const cartItem = cart.find((item) => item.id === dish.id);
              return (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  cartQuantity={cartItem?.quantity || 0}
                  onAdd={() => addToCart(dish)}
                  onUpdateQuantity={(qty) => updateCartItem(dish.id, qty)}
                  orderAllowed={canOrder && (isDineIn || isDeliveryPickup)}
                  plan={plan}
                />
              );
            })}
          </div>
        </div>
      </div>

      {canOrder && (
        <div className={`${activeTab === 'cart' ? 'block' : 'hidden md:block'} md:fixed md:top-16 md:right-0 md:w-96 md:h-[calc(100%-4rem)] md:bg-white md:shadow-xl md:border-l md:border-slate-200 md:overflow-y-auto md:rounded-t-3xl`}>
          <CartView
            cart={cart}
            restaurant={restaurant}
            onUpdateQuantity={updateCartItem}
            onUpdateNotes={updateCartItemNotes}
            onRemove={removeFromCart}
            getTotalPrice={getTotalPrice}
            tableId={tableId}
            orderType={orderType}
            onCheckout={handleCheckout}
          />
        </div>
      )}
    </div>
  );
}

function buildDemoRestaurant(): Restaurant {
  const now = new Date().toISOString();
  return {
    id: DEMO_RESTAURANT_ID,
    owner_id: 'demo-owner',
    name: DEMO_RESTAURANT.name,
    name_en: DEMO_RESTAURANT.name_en ?? null,
    description: DEMO_RESTAURANT.description ?? null,
    short_description: DEMO_RESTAURANT.short_description ?? null,
    long_description: DEMO_RESTAURANT.long_description ?? null,
    logo_url: DEMO_RESTAURANT.logo_url ?? null,
    cover_image_url: DEMO_RESTAURANT.cover_image_url ?? null,
    cover_images: DEMO_RESTAURANT.cover_images as unknown as Database['public']['Tables']['restaurants']['Row']['cover_images'],
    phone: DEMO_RESTAURANT.phone_number ?? null,
    whatsapp: DEMO_RESTAURANT.whatsapp_number ?? null,
    phone_number: DEMO_RESTAURANT.phone_number ?? null,
    whatsapp_number: DEMO_RESTAURANT.whatsapp_number ?? null,
    cuisine_summary: DEMO_RESTAURANT.cuisine_summary ?? null,
    plan: (DEMO_RESTAURANT.plan as 'a' | 'b' | 'c') ?? 'c',
    delivery_fee: DEMO_RESTAURANT.delivery_fee ?? 0,
    extra_fees: DEMO_RESTAURANT.extra_fees as unknown as Database['public']['Tables']['restaurants']['Row']['extra_fees'],
    opening_hours: DEMO_RESTAURANT.opening_hours as unknown as Database['public']['Tables']['restaurants']['Row']['opening_hours'],
    status_override: DEMO_RESTAURANT.status_override ?? 'open',
    city: DEMO_RESTAURANT.city ?? 'دمشق',
    area: DEMO_RESTAURANT.area ?? null,
    address_landmark: DEMO_RESTAURANT.address_landmark ?? null,
    rating: DEMO_RESTAURANT.rating ?? null,
    rating_count: DEMO_RESTAURANT.rating_count ?? null,
    is_active: true,
    created_at: DEMO_RESTAURANT.created_at ?? now,
    updated_at: DEMO_RESTAURANT.created_at ?? now,
  };
}

function buildDemoCategories(): Category[] {
  return DEMO_MENU_CATEGORIES.map((category, index) => ({
    ...category,
    sort_order: category.sort_order ?? index + 1,
    created_at: category.created_at ?? new Date().toISOString(),
  })) as Category[];
}

function buildDemoDishes(): Dish[] {
  const createdAt = new Date().toISOString();
  return Object.values(DEMO_MENU_PRODUCTS)
    .flat()
    .map((product, index) => ({
      id: product.id,
      restaurant_id: DEMO_RESTAURANT_ID,
      category_id: product.category_id,
      name: product.name,
      name_en: null,
      description: product.description ?? null,
      image_url: product.image_url ?? null,
      price: product.price,
      is_available: true,
      sort_order: index + 1,
      created_at: product.created_at ?? createdAt,
      updated_at: product.created_at ?? createdAt,
    })) as Dish[];
}

function DishCard({
  dish,
  cartQuantity,
  onAdd,
  onUpdateQuantity,
  orderAllowed,
  plan,
}: {
  dish: Dish;
  cartQuantity: number;
  onAdd: () => void;
  onUpdateQuantity: (qty: number) => void;
  orderAllowed: boolean;
  plan: 'a' | 'b' | 'c';
}) {
  const isAvailable = dish.is_available ?? true;
  const canAdd = orderAllowed && isAvailable;
  const actionLabel = !isAvailable ? 'غير متوفر اليوم' : plan === 'a' ? 'عرض فقط' : 'أضف إلى السلة';

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow ${
        !isAvailable ? 'opacity-80 cursor-not-allowed' : ''
      }`}
    >
      <div className="flex flex-row-reverse gap-4 p-4 items-center md:items-start">
        {dish.image_url && (
          <img
            src={dish.image_url}
            alt={dish.name}
            className="w-24 h-24 object-cover rounded-xl border border-white shadow-sm"
          />
        )}
        <div className="flex-1 min-w-0 text-right">
          <h3 className="font-bold text-lg text-slate-900 mb-1">{dish.name}</h3>
          {dish.description && <p className="text-sm text-slate-600 mb-2 line-clamp-2">{dish.description}</p>}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xl font-bold text-orange-600">{dish.price.toLocaleString()} ر.س</span>
            <div className="flex justify-end">
              {cartQuantity === 0 ? (
                <button
                  onClick={() => canAdd && onAdd()}
                  disabled={!canAdd}
                  className={`px-4 py-2 min-w-[140px] text-sm font-semibold rounded-full transition ${
                    canAdd
                      ? 'bg-gradient-to-l from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                      : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {actionLabel}
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-orange-50 rounded-full px-3 py-1 shadow-inner">
                  <button
                    onClick={() => onUpdateQuantity(cartQuantity - 1)}
                    className="w-9 h-9 flex items-center justify-center bg-white hover:bg-orange-100 rounded-full transition-colors shadow-sm"
                  >
                    <Minus className="w-4 h-4 text-orange-600" />
                  </button>
                  <span className="w-8 text-center font-bold text-orange-600">{cartQuantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(cartQuantity + 1)}
                    className="w-9 h-9 flex items-center justify-center bg-white hover:bg-orange-100 rounded-full transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-orange-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {!isAvailable && (
            <p className="mt-2 text-xs font-semibold text-red-600">غير متوفر اليوم</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CartView({
  cart,
  restaurant,
  onUpdateQuantity,
  onUpdateNotes,
  onRemove,
  getTotalPrice,
  tableId,
  orderType,
  onCheckout,
}: {
  cart: CartItem[];
  restaurant: Restaurant;
  onUpdateQuantity: (dishId: string, qty: number) => void;
  onUpdateNotes: (dishId: string, notes: string) => void;
  onRemove: (dishId: string) => void;
  getTotalPrice: () => number;
  tableId: string | null;
  orderType: 'delivery' | 'pickup' | null;
  onCheckout: () => void;
}) {
  const [showNotesFor, setShowNotesFor] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-gradient-to-l from-orange-500 to-orange-600 text-white p-5 pt-8 rounded-b-3xl shadow md:pt-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">سلة الطلب</p>
            <h2 className="text-2xl font-bold mt-1">{restaurant.name}</h2>
          </div>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{cart.length} صنف</span>
        </div>
        <p className="text-xs text-white/80 mt-2">
          {tableId ? `طاولة ${tableId}` : orderType === 'delivery' ? 'توصيل للمنزل' : 'استلام من المطعم'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="bg-white rounded-full shadow-md p-6 mb-4">
              <ShoppingCart className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-sm">السلة فارغة – أضف أطباقك من القائمة</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="text-right flex-1">
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-orange-500 font-bold">{item.price.toLocaleString()} ل.س</p>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-red-500 hover:bg-red-50 rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-slate-600" />
                  </button>
                  <span className="w-8 text-center font-medium text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-slate-600" />
                  </button>
                </div>

                <button
                  onClick={() => setShowNotesFor(showNotesFor === item.id ? null : item.id)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <StickyNote className="w-3 h-3" />
                  ملاحظات
                </button>
              </div>

              {showNotesFor === item.id && (
                <div className="mt-3">
                  <textarea
                    value={item.notes}
                    onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                    placeholder="أضف تعليمات خاصة للطبق"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50"
                    rows={2}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-5 bg-white border-t border-slate-200 shadow-inner space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-slate-900">المجموع</span>
          <span className="text-2xl font-bold text-orange-600">{getTotalPrice().toLocaleString()} ل.س</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className={`w-full font-bold py-3 rounded-2xl shadow-lg transition-colors ${
            cart.length === 0
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-l from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white'
          }`}
        >
          {cart.length === 0 ? 'أضف أطباقاً للمتابعة' : tableId ? 'إرسال الطلب للطاولة' : 'متابعة الطلب'}
        </button>
        <p className="text-xs text-slate-500 text-center">
          سيتم تأكيد الطلب وإرساله إلى المطبخ فور الضغط على متابعة الطلب.
        </p>
      </div>
    </div>
  );
}
