import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { LogOut, Menu as MenuIcon, ShoppingBag, QrCode, Settings, Plus } from 'lucide-react';
import { MenuManagement } from '../components/MenuManagement';
import { QRManagement } from '../components/QRManagement';
import { OrderManagement } from '../components/OrderManagement';
import { SettingsManagement } from '../components/SettingsManagement';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'qr' | 'settings'>('menu');

  useEffect(() => {
    loadRestaurant();
  }, [user]);

  const loadRestaurant = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading restaurant:', error);
    }

    setRestaurant(data);
    setLoading(false);
  };

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
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating restaurant:', error);
      alert('حدث خطأ في إنشاء المطعم');
      return;
    }

    setRestaurant(data);
  };

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
    return <RestaurantSetup onCreateRestaurant={createRestaurant} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt={restaurant.name} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <MenuIcon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-900">{restaurant.name}</h1>
                <p className="text-xs text-slate-500">الخطة {restaurant.plan.toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
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
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'menu' && <MenuTab restaurant={restaurant} />}
        {activeTab === 'orders' && <OrdersTab restaurant={restaurant} />}
        {activeTab === 'qr' && <QRTab restaurant={restaurant} />}
        {activeTab === 'settings' && <SettingsTab restaurant={restaurant} onUpdate={loadRestaurant} />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
        active
          ? 'border-orange-500 text-orange-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
      }`}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
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
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="مطعم الشام"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              {loading ? 'جارٍ الإنشاء...' : 'إنشاء المطعم'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MenuTab({ restaurant }: { restaurant: Restaurant }) {
  return <MenuManagement restaurant={restaurant} />;
}

function OrdersTab({ restaurant }: { restaurant: Restaurant }) {
  return <OrderManagement restaurant={restaurant} />;
}

function QRTab({ restaurant }: { restaurant: Restaurant }) {
  return <QRManagement restaurant={restaurant} />;
}

function SettingsTab({ restaurant, onUpdate }: { restaurant: Restaurant; onUpdate: () => void }) {
  return <SettingsManagement restaurant={restaurant} onUpdate={onUpdate} />;
}
