import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Grid, List, ShoppingCart, Minus, Plus, X, StickyNote, Home } from 'lucide-react';
import { CheckoutFlow } from '../components/CheckoutFlow';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Dish = Database['public']['Tables']['dishes']['Row'];

interface CartItem extends Dish {
  quantity: number;
  notes: string;
}

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

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    if (!restaurantId) return;

    const [restaurantRes, categoriesRes, dishesRes] = await Promise.all([
      supabase.from('restaurants').select('*').eq('id', restaurantId).maybeSingle(),
      supabase.from('categories').select('*').eq('restaurant_id', restaurantId).eq('is_active', true).order('sort_order'),
      supabase.from('dishes').select('*').eq('restaurant_id', restaurantId).eq('is_available', true).order('sort_order'),
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

  const canOrder = restaurant?.plan === 'b' || restaurant?.plan === 'c';
  const isDineIn = tableId && restaurant?.plan === 'b';
  const isDeliveryPickup = orderType && restaurant?.plan === 'c';

  if (showCheckout && restaurant) {
    return (
      <CheckoutFlow
        restaurant={restaurant}
        cart={cart}
        tableId={tableId}
        orderType={orderType}
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

  const filteredDishes = selectedCategory ? dishes.filter((d) => d.category_id === selectedCategory) : dishes;

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
              <p className="font-semibold">الطاولة: {tableId}</p>
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
                  canOrder={canOrder && (isDineIn || isDeliveryPickup)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {canOrder && (
        <div className={`${activeTab === 'cart' ? 'block' : 'hidden md:block'} md:fixed md:top-0 md:right-0 md:w-96 md:h-full md:bg-white md:shadow-xl md:border-l md:border-slate-200 md:overflow-y-auto`}>
          <CartView
            cart={cart}
            restaurant={restaurant}
            onUpdateQuantity={updateCartItem}
            onUpdateNotes={updateCartItemNotes}
            onRemove={removeFromCart}
            getTotalPrice={getTotalPrice}
            tableId={tableId}
            orderType={orderType}
            onCheckout={() => setShowCheckout(true)}
          />
        </div>
      )}
    </div>
  );
}

function DishCard({
  dish,
  cartQuantity,
  onAdd,
  onUpdateQuantity,
  canOrder,
}: {
  dish: Dish;
  cartQuantity: number;
  onAdd: () => void;
  onUpdateQuantity: (qty: number) => void;
  canOrder: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex gap-4 p-4">
        {dish.image_url && <img src={dish.image_url} alt={dish.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-slate-900 mb-1">{dish.name}</h3>
          {dish.description && <p className="text-sm text-slate-600 mb-2 line-clamp-2">{dish.description}</p>}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-orange-600">{dish.price.toLocaleString()} ل.س</span>
            {canOrder && (
              <div>
                {cartQuantity === 0 ? (
                  <button
                    onClick={onAdd}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    إضافة
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-orange-50 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQuantity(cartQuantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4 text-orange-600" />
                    </button>
                    <span className="w-8 text-center font-bold text-orange-600">{cartQuantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(cartQuantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 text-orange-600" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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

  if (cart.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p>السلة فارغة</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
        <h2 className="text-xl font-bold text-slate-900">السلة</h2>
        <p className="text-sm text-slate-600">{cart.length} منتج</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{item.name}</h3>
                <p className="text-sm text-orange-600 font-bold">{item.price.toLocaleString()} ل.س</p>
              </div>
              <button onClick={() => onRemove(item.id)} className="p-1 hover:bg-red-50 rounded transition-colors">
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-100 rounded transition-colors"
                >
                  <Minus className="w-3 h-3 text-slate-600" />
                </button>
                <span className="w-8 text-center font-medium text-slate-900">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-100 rounded transition-colors"
                >
                  <Plus className="w-3 h-3 text-slate-600" />
                </button>
              </div>

              <button
                onClick={() => setShowNotesFor(showNotesFor === item.id ? null : item.id)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                <StickyNote className="w-3 h-3" />
                ملاحظات
              </button>
            </div>

            {showNotesFor === item.id && (
              <div className="mt-2">
                <textarea
                  value={item.notes}
                  onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                  placeholder="أضف ملاحظات للطبق (مثلاً: بدون بصل)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={2}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-slate-900">المجموع</span>
          <span className="text-2xl font-bold text-orange-600">{getTotalPrice().toLocaleString()} ل.س</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
        >
          {tableId ? 'إرسال الطلب' : 'متابعة الطلب'}
        </button>
      </div>
    </div>
  );
}
