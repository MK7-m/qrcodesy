import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurantById } from '../../services/restaurants';
import { supabase } from '../../lib/supabase';
import type { Json } from '../../lib/database.types';
import type { DailyOpeningHours, OpeningHoursRange, Restaurant, CoverImage } from '../../types/restaurant';
import { HeroSliderManager } from '../../components/HeroSliderManager';
import { ExtraFeesManager } from '../../components/ExtraFeesManager';
import { normalizeCoverImages, prepareCoverImagesForSave } from '../../utils/coverImages';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SectionCard } from '../../components/ui/SectionCard';

// InputField removed - using shared Input component instead

const SYRIA_CITIES = ['دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس', 'السويداء', 'درعا', 'دير الزور', 'الحسكة', 'الرقة', 'إدلب', 'القنيطرة'];

export function RestaurantEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    loadRestaurant(id);
  }, [id]);

  const loadRestaurant = async (restaurantId: string) => {
    setLoading(true);
    const data = await getRestaurantById(restaurantId);
    setRestaurant(data);
    setLoading(false);
  };

  const updateField = <K extends keyof Restaurant>(key: K, value: Restaurant[K]) => {
    if (!restaurant) return;
    setRestaurant({ ...restaurant, [key]: value });
  };

  const addOpeningRange = (day: string) => {
    if (!restaurant) return;
    const range: OpeningHoursRange = { from: '09:00', to: '17:00' };
    const updated = restaurant.opening_hours?.map((d) => (d.day === day ? { ...d, ranges: [...d.ranges, range] } : d));
    setRestaurant({ ...restaurant, opening_hours: updated });
  };

  const updateRange = (day: string, index: number, key: keyof OpeningHoursRange, value: string) => {
    if (!restaurant) return;
    const updated = restaurant.opening_hours?.map((d) => {
      if (d.day !== day) return d;
      const ranges = d.ranges.map((r, i) => (i === index ? { ...r, [key]: value } : r));
      return { ...d, ranges };
    });
    setRestaurant({ ...restaurant, opening_hours: updated });
  };

  const removeRange = (day: string, index: number) => {
    if (!restaurant) return;
    const updated = restaurant.opening_hours?.map((d) => {
      if (d.day !== day) return d;
      return { ...d, ranges: d.ranges.filter((_, i) => i !== index) };
    });
    setRestaurant({ ...restaurant, opening_hours: updated });
  };

  const handleCoverImagesUpdate = async (images: CoverImage[]) => {
    if (!restaurant || !id) return;
    
    const prepared = prepareCoverImagesForSave(images);
    const { error } = await supabase
      .from('restaurants')
      .update({ cover_images: prepared as unknown as Json })
      .eq('id', id);

    if (error) {
      console.error('Error updating cover images:', error);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء تحديث صور العرض' });
    } else {
      // Update local state
      setRestaurant({ ...restaurant, cover_images: prepared });
      setMessage({ type: 'success', text: 'تم تحديث صور العرض بنجاح' });
    }
  };

  const save = async () => {
    if (!restaurant || !id) return;
    if (!restaurant.name.trim()) {
      setMessage({ type: 'error', text: 'الاسم مطلوب' });
      return;
    }
    setSaving(true);
    setMessage(null);
    
    // Normalize cover_images before saving
    const normalizedCoverImages = normalizeCoverImages(restaurant.cover_images);
    const preparedCoverImages = prepareCoverImagesForSave(normalizedCoverImages);
    
    const coverImagesJson = preparedCoverImages as unknown as Json;
    const extraFeesJson = (restaurant.extra_fees || []) as unknown as Json;
    const openingHoursJson = (restaurant.opening_hours || []) as unknown as Json;

    const { error } = await supabase
      .from('restaurants')
      .update({
        name: restaurant.name,
        name_en: restaurant.name_en,
        description: restaurant.description,
        short_description: restaurant.short_description,
        long_description: restaurant.long_description,
        logo_url: restaurant.logo_url,
        cover_image_url: restaurant.cover_image_url,
        cover_images: coverImagesJson,
        extra_fees: extraFeesJson,
        cuisine_summary: restaurant.cuisine_summary,
        phone_number: restaurant.phone_number,
        whatsapp_number: restaurant.whatsapp_number,
        delivery_fee: restaurant.delivery_fee,
        opening_hours: openingHoursJson,
        city: restaurant.city,
        area: restaurant.area,
        address_landmark: restaurant.address_landmark,
        status_override: restaurant.status_override,
      })
      .eq('id', id);

    if (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
    } else {
      setMessage({ type: 'success', text: 'تم الحفظ بنجاح' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center" dir="rtl">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">جارٍ التحميل...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center text-slate-700" dir="rtl">
        تعذر تحميل بيانات المطعم
      </div>
    );
  }

  const days = restaurant.opening_hours?.map((d) => d.day) || ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

  return (
    <div className="space-y-4" dir="rtl">
      {message && (
        <div
          className={`rounded-xl px-4 py-3 border ${
            message.type === 'success' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">بيانات المطعم</h2>
            <p className="text-sm text-slate-500">تحديث بيانات المطعم الأساسية</p>
          </div>
          <Button
            onClick={save}
            loading={saving}
            variant="primary"
            size="md"
          >
            حفظ
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="اسم المطعم" value={restaurant.name} onChange={(e) => updateField('name', e.target.value)} required />
          <Input label="الاسم بالإنجليزية (اختياري)" value={restaurant.name_en || ''} onChange={(e) => updateField('name_en', e.target.value)} />
          <Input label="وصف قصير" value={restaurant.short_description || ''} onChange={(e) => updateField('short_description', e.target.value)} />
          <Input label="وصف طويل" value={restaurant.long_description || ''} onChange={(e) => updateField('long_description', e.target.value)} />
          <Input label="شعار (URL)" value={restaurant.logo_url || ''} onChange={(e) => updateField('logo_url', e.target.value)} placeholder="https://..." />
          <Input label="صورة الغلاف الافتراضية (URL)" value={restaurant.cover_image_url || ''} onChange={(e) => updateField('cover_image_url', e.target.value)} placeholder="https://..." />
          <Input label="ملخص المطبخ" value={restaurant.cuisine_summary || ''} onChange={(e) => updateField('cuisine_summary', e.target.value)} placeholder="مثال: مأكولات سورية" />
          <Input label="رسوم التوصيل" type="number" value={restaurant.delivery_fee?.toString() || '0'} onChange={(e) => updateField('delivery_fee', Number(e.target.value) || 0)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">صور العرض الترويجي</h2>
          <p className="text-sm text-slate-500">إدارة صور العرض الترويجي (حتى 10 صور)</p>
        </div>
        <HeroSliderManager
          restaurantId={restaurant.id}
          coverImages={restaurant.cover_images}
          onUpdate={handleCoverImagesUpdate}
        />
      </div>

      <SectionCard
        title="الرسوم الإضافية"
        description="إدارة الرسوم الإضافية التي تُضاف إلى الطلبات (حتى 5 رسوم)"
      >
        <ExtraFeesManager
          extraFees={restaurant.extra_fees || []}
          onUpdate={(fees) => {
            if (!restaurant) return;
            setRestaurant({ ...restaurant, extra_fees: fees });
          }}
        />
      </SectionCard>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">معلومات الاتصال</h2>
            <p className="text-sm text-slate-500">هاتف وواتساب</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="الهاتف" type="tel" value={restaurant.phone_number || ''} onChange={(e) => updateField('phone_number', e.target.value)} />
          <Input label="واتساب" type="tel" value={restaurant.whatsapp_number || ''} onChange={(e) => updateField('whatsapp_number', e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">العنوان (سوريا)</h2>
            <p className="text-sm text-slate-500">المدن السورية مع معلومات تفصيلية</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">المدينة</label>
            <select
              className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition"
              value={restaurant.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
            >
              <option value="">اختر المدينة</option>
              {SYRIA_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <Input label="المنطقة" value={restaurant.area || ''} onChange={(e) => updateField('area', e.target.value)} placeholder="مثال: المزة" />
          <Input
            label="علامة مميزة / وصف العنوان"
            value={restaurant.address_landmark || ''}
            onChange={(e) => updateField('address_landmark', e.target.value)}
            placeholder="جانب القصور، مقابل مطعم X"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">حالة المطعم</h2>
            <p className="text-sm text-slate-500">تحكم في حالة الفتح/الإغلاق</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { value: 'auto', label: 'تلقائي (حسب أوقات العمل)' },
            { value: 'open', label: 'مفتوح الآن' },
            { value: 'busy', label: 'مشغول الآن' },
            { value: 'closed', label: 'مغلق الآن' },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer ${
                restaurant.status_override === opt.value ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="status_override"
                value={opt.value}
                checked={restaurant.status_override === opt.value}
                onChange={(e) => updateField('status_override', e.target.value as Restaurant['status_override'])}
              />
              <span className="text-sm text-slate-800">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">ساعات العمل</h2>
            <p className="text-sm text-slate-500">إدارة أوقات العمل لكل يوم</p>
          </div>
        </div>

        <div className="space-y-4">
          {days.map((day) => {
            const dayData =
              restaurant.opening_hours?.find((d: DailyOpeningHours) => d.day === day) || { day, ranges: [] };
            return (
              <div key={day} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-slate-800">{day}</div>
                  <button className="text-sm text-orange-600 font-medium hover:text-orange-700" onClick={() => addOpeningRange(day)}>
                    إضافة فترة
                  </button>
                </div>
                <div className="space-y-2">
                  {dayData.ranges.map((range, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2"
                        value={range.from}
                        onChange={(e) => updateRange(day, idx, 'from', e.target.value)}
                        placeholder="09:00"
                      />
                      <span className="text-slate-500">إلى</span>
                      <input
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2"
                        value={range.to}
                        onChange={(e) => updateRange(day, idx, 'to', e.target.value)}
                        placeholder="17:00"
                      />
                      <button className="text-sm text-red-500 hover:text-red-600" onClick={() => removeRange(day, idx)} type="button">
                        حذف
                      </button>
                    </div>
                  ))}
                  {dayData.ranges.length === 0 && <p className="text-sm text-slate-500">لا توجد فترات مسجلة لهذا اليوم.</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RestaurantEditorPage;
