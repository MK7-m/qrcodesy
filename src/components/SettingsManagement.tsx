import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Save, Upload } from 'lucide-react';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];

interface SettingsManagementProps {
  restaurant: Restaurant;
  onUpdate: () => void;
}

export function SettingsManagement({ restaurant, onUpdate }: SettingsManagementProps) {
  const [name, setName] = useState(restaurant.name);
  const [nameEn, setNameEn] = useState(restaurant.name_en || '');
  const [description, setDescription] = useState(restaurant.description || '');
  const [logoUrl, setLogoUrl] = useState(restaurant.logo_url || '');
  const [phone, setPhone] = useState(restaurant.phone || '');
  const [whatsapp, setWhatsapp] = useState(restaurant.whatsapp || '');
  const [plan, setPlan] = useState<'a' | 'b' | 'c'>(restaurant.plan);
  const [deliveryFee, setDeliveryFee] = useState(restaurant.delivery_fee.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('restaurants')
      .update({
        name,
        name_en: nameEn || null,
        description: description || null,
        logo_url: logoUrl || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        plan,
        delivery_fee: parseFloat(deliveryFee) || 0,
      })
      .eq('id', restaurant.id);

    setLoading(false);

    if (error) {
      alert('حدث خطأ في حفظ الإعدادات');
      return;
    }

    alert('تم حفظ الإعدادات بنجاح');
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">معلومات المطعم</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">اسم المطعم (عربي)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">اسم المطعم (إنجليزي - اختياري)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">وصف المطعم (اختياري)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="وصف مختصر عن مطعمك..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">رابط الشعار (اختياري)</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://example.com/logo.png"
              />
              <button
                type="button"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                رفع
              </button>
            </div>
            {logoUrl && (
              <div className="mt-2">
                <img src={logoUrl} alt="Logo preview" className="w-24 h-24 object-cover rounded-lg border border-slate-200" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف (اختياري)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">رقم الواتساب (اختياري)</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0123456789"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">الخطة</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as 'a' | 'b' | 'c')}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="a">الخطة A - قائمة رقمية فقط</option>
              <option value="b">الخطة B - قائمة + طلبات من الطاولة</option>
              <option value="c">الخطة C - قائمة + طلبات + توصيل</option>
            </select>
            <p className="mt-2 text-sm text-slate-600">
              {plan === 'a' && 'عرض القائمة الرقمية فقط عبر QR'}
              {plan === 'b' && 'عرض القائمة + إمكانية الطلب من الطاولة'}
              {plan === 'c' && 'جميع المميزات + طلبات التوصيل والاستلام'}
            </p>
          </div>

          {plan === 'c' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">رسوم التوصيل (ل.س)</label>
              <input
                type="number"
                step="0.01"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="5000"
              />
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              {loading ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">معلومات الحساب</h2>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>معرف المطعم</span>
            <span className="font-mono text-slate-900">{restaurant.id}</span>
          </div>
          <div className="flex justify-between">
            <span>تاريخ الإنشاء</span>
            <span className="text-slate-900">{new Date(restaurant.created_at).toLocaleDateString('ar-SY')}</span>
          </div>
          <div className="flex justify-between">
            <span>الحالة</span>
            <span className={`font-medium ${restaurant.is_active ? 'text-green-600' : 'text-red-600'}`}>
              {restaurant.is_active ? 'نشط' : 'غير نشط'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
