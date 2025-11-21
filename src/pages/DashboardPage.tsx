import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { LogOut, Menu as MenuIcon, ShoppingBag, QrCode, Settings, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { getRestaurantById } from '../services/restaurants';
import type { Restaurant as RestaurantType } from '../types/restaurant';
import { computeRestaurantStatus } from '../utils/openingHours';
import { MenuTab } from '../features/dashboard/MenuTab';
import { OrdersTab } from '../features/dashboard/OrdersTab';
import { QRTab } from '../features/dashboard/QRTab';
import { SettingsTab } from '../features/dashboard/SettingsTab';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [restaurantData, setRestaurantData] = useState<RestaurantType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'qr' | 'settings'>('menu');

  const loadRestaurant = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error loading restaurant:', fetchError);
        setError('تعذر تحميل بيانات المطعم');
        setLoading(false);
        return;
      }

      if (data) {
        setRestaurant(data);
        // Load full restaurant data with normalized fields
        const fullData = await getRestaurantById(data.id);
        setRestaurantData(fullData);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRestaurant();
  }, [loadRestaurant]);

  const createRestaurant = async (name: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        owner_id: user.id,
        name,
        plan: 'a',
        delivery_fee: 0,
        is_active: true,
        opening_hours: [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating restaurant:', error);
      alert('حدث خطأ في إنشاء المطعم');
      return;
    }

    setRestaurant(data);
    const fullData = await getRestaurantById(data.id);
    setRestaurantData(fullData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full">
          <ErrorMessage message={error} onRetry={loadRestaurant} />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return <RestaurantSetup onCreateRestaurant={createRestaurant} />;
  }

  const status = restaurantData
    ? computeRestaurantStatus(restaurantData.opening_hours, restaurantData.status_override)
    : 'closed';

  const statusConfig = {
    open: { label: 'مفتوح', color: 'bg-green-100 text-green-700 border-green-200' },
    closed: { label: 'مغلق', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    busy: { label: 'مشغول', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  };

  const planLabels = {
    a: 'الخطة A',
    b: 'الخطة B',
    c: 'الخطة C',
  };

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt={restaurant.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                  <MenuIcon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{restaurant.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-lg">
                    {planLabels[restaurant.plan]}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg border ${statusConfig[status].color}`}>
                    {statusConfig[status].label}
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={() => signOut()} variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            <TabButton
              active={activeTab === 'menu'}
              onClick={() => setActiveTab('menu')}
              icon={<MenuIcon className="w-5 h-5" />}
              label="القائمة"
            />
            <TabButton
              active={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
              icon={<ShoppingBag className="w-5 h-5" />}
              label="الطلبات"
            />
            <TabButton
              active={activeTab === 'qr'}
              onClick={() => setActiveTab('qr')}
              icon={<QrCode className="w-5 h-5" />}
              label="رموز QR"
            />
            <TabButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              icon={<Settings className="w-5 h-5" />}
              label="الإعدادات"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'menu' && restaurant && <MenuTab restaurant={restaurant} />}
        {activeTab === 'orders' && restaurant && <OrdersTab restaurant={restaurant} />}
        {activeTab === 'qr' && restaurant && <QRTab restaurant={restaurant} />}
        {activeTab === 'settings' && restaurant && restaurantData && (
          <SettingsTab restaurant={restaurant} restaurantData={restaurantData} onUpdate={loadRestaurant} />
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
        active
          ? 'border-orange-500 text-orange-600 bg-orange-50'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      }`}
      dir="rtl"
    >
      {icon}
      {label}
    </button>
  );
}

function RestaurantSetup({ onCreateRestaurant }: { onCreateRestaurant: (name: string) => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await onCreateRestaurant(name.trim());
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">مرحباً بك!</h1>
            <p className="text-slate-600">لنبدأ بإنشاء مطعمك الأول</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="restaurant-name" className="block text-sm font-medium text-slate-700 mb-2">
                اسم المطعم
              </label>
              <input
                id="restaurant-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="مطعم الشام"
                dir="rtl"
              />
            </div>

            <Button type="submit" loading={loading} disabled={!name.trim()} fullWidth variant="primary" size="lg">
              إنشاء المطعم
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
