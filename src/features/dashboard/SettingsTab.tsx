import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import type { Json } from '../../lib/database.types';
import { Save, Upload, X, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SectionCard } from '../../components/ui/SectionCard';
import type { Restaurant, DailyOpeningHours } from '../../types/restaurant';
import { HeroSliderManager } from '../../components/HeroSliderManager';
import { ExtraFeesManager } from '../../components/ExtraFeesManager';
import { normalizeCoverImages, prepareCoverImagesForSave } from '../../utils/coverImages';
import { uploadRestaurantLogo, uploadRestaurantCoverImage } from '../../services/storage';

type RestaurantRow = Database['public']['Tables']['restaurants']['Row'];

const SYRIA_CITIES = [
  'دمشق',
  'حلب',
  'حمص',
  'حماة',
  'اللاذقية',
  'طرطوس',
  'السويداء',
  'درعا',
  'دير الزور',
  'الحسكة',
  'الرقة',
  'إدلب',
  'القنيطرة',
];

interface SettingsTabProps {
  restaurant: RestaurantRow;
  restaurantData: Restaurant;
  onUpdate: () => void;
}

export function SettingsTab({ restaurant, restaurantData, onUpdate }: SettingsTabProps) {
  const [formData, setFormData] = useState({
    name: restaurant.name,
    name_en: restaurant.name_en || '',
    short_description: restaurantData.short_description || '',
    long_description: restaurantData.long_description || '',
    logo_url: restaurant.logo_url || '',
    cover_image_url: restaurantData.cover_image_url || '',
    phone_number: restaurantData.phone_number || '',
    whatsapp_number: restaurantData.whatsapp_number || '',
    city: restaurantData.city || '',
    area: restaurantData.area || '',
    address_landmark: restaurantData.address_landmark || '',
    plan: restaurant.plan.toUpperCase() as 'A' | 'B' | 'C',
    delivery_fee: restaurant.delivery_fee || 0,
    status_override: restaurantData.status_override || 'auto',
    opening_hours: restaurantData.opening_hours || [],
    extra_fees: restaurantData.extra_fees || [],
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const messageStyles = {
    success: 'bg-green-50 border border-green-200 text-green-800',
    error: 'bg-red-50 border border-red-200 text-red-800',
    warning: 'bg-amber-50 border border-amber-200 text-amber-800',
  } as const;
  const [supportsExtraFees, setSupportsExtraFees] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_UPLOAD_SIZE_MB = 5;
  const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const detectExtraFeesSupport = useCallback(async () => {
    try {
      const { error } = await supabase.from('restaurants').select('extra_fees').limit(1);
      if (error) {
        if (error.message?.includes('extra_fees')) {
          console.warn('[SettingsTab] extra_fees column missing, disabling manager', error);
          setSupportsExtraFees(false);
        } else {
          console.error('[SettingsTab] Failed to probe extra_fees support', error);
        }
      }
    } catch (err) {
      console.error('[SettingsTab] Unexpected error while probing extra_fees support', err);
    }
  }, []);

  useEffect(() => {
    detectExtraFeesSupport();
  }, [detectExtraFeesSupport]);

  const updateField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateImageFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return 'يرجى اختيار صورة بصيغة ‎JPG‎ أو ‎PNG‎ أو ‎WebP‎ فقط.';
    }
    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > MAX_UPLOAD_SIZE_MB) {
      return `حجم الصورة يجب ألا يتجاوز ${MAX_UPLOAD_SIZE_MB} ميغابايت.`;
    }
    return null;
  };

  const handleLogoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validationMessage = validateImageFile(file);
    if (validationMessage) {
      setMessage({ type: 'error', text: validationMessage });
      return;
    }

    setUploadingLogo(true);
    setMessage(null);

    try {
      console.log('[SettingsTab] Uploading logo', { restaurantId: restaurant.id, fileName: file.name, size: file.size });
      const url = await uploadRestaurantLogo(restaurant.id, file);
      updateField('logo_url', url);
      setMessage({ type: 'success', text: 'تم رفع الشعار بنجاح، لا تنس حفظ التغييرات.' });
    } catch (error) {
      console.error('[SettingsTab] Logo upload failed', error);
      setMessage({ type: 'error', text: 'فشل رفع الشعار، تحقق من الاتصال وحجم الملف.' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validationMessage = validateImageFile(file);
    if (validationMessage) {
      setMessage({ type: 'error', text: validationMessage });
      return;
    }

    setUploadingCover(true);
    setMessage(null);

    try {
      console.log('[SettingsTab] Uploading cover image', { restaurantId: restaurant.id, fileName: file.name, size: file.size });
      const url = await uploadRestaurantCoverImage(restaurant.id, file);
      updateField('cover_image_url', url);
      setMessage({ type: 'success', text: 'تم رفع صورة الغلاف، احفظ الإعدادات لتحديث الواجهة.' });
    } catch (error) {
      console.error('[SettingsTab] Cover upload failed', error);
      setMessage({ type: 'error', text: 'فشل رفع صورة الغلاف، تحقق من الاتصال وحجم الملف.' });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: '???? ??? ?????????? ???? ????? ??? ??????.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const preparedCoverImages = prepareCoverImagesForSave(normalizeCoverImages(restaurantData.cover_images));
      const coverImagesJson = preparedCoverImages as unknown as Json;
      const payload: Record<string, unknown> = {
        name: formData.name,
        name_en: formData.name_en || null,
        short_description: formData.short_description || null,
        long_description: formData.long_description || null,
        logo_url: formData.logo_url || null,
        cover_image_url: formData.cover_image_url || null,
        phone_number: formData.phone_number || null,
        whatsapp_number: formData.whatsapp_number || null,
        city: formData.city || null,
        area: formData.area || null,
        address_landmark: formData.address_landmark || null,
        plan: formData.plan.toLowerCase(),
        delivery_fee: formData.delivery_fee,
        status_override: formData.status_override,
        opening_hours: (formData.opening_hours || []) as unknown as Json,
        cover_images: coverImagesJson,
      };

      if (supportsExtraFees) {
        payload.extra_fees = (formData.extra_fees || []) as unknown as Json;
      }

      console.log('[SettingsTab] Saving restaurant settings', {
        restaurantId: restaurant.id,
        payload: {
          ...payload,
          cover_images: preparedCoverImages.map((img) => img.url),
        },
      });

      const updateRestaurant = async (body: typeof payload) =>
        supabase.from('restaurants').update(body).eq('id', restaurant.id);

      let { error } = await updateRestaurant(payload);

      if (error && payload.extra_fees && error.message?.includes('extra_fees')) {
        console.warn('[SettingsTab] extra_fees column missing during save, retrying without it');
        setSupportsExtraFees(false);
        const { extra_fees, ...withoutExtraFees } = payload;
        ({ error } = await updateRestaurant(withoutExtraFees));
        if (!error) {
          setMessage({
            type: 'warning',
            text: '?? ??? ????????? ???????? ?????? ????????. ???? ????? ????? ????? ???????? (20250115000000_add_order_fees_and_extra_fees.sql).',
          });
          onUpdate();
          return;
        }
      }

      if (error) throw error;

      setMessage({ type: 'success', text: '?? ??? ????????? ?????' });
      setTimeout(() => {
        setMessage(null);
        onUpdate();
      }, 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: '???? ??? ?????????? ???? ???????? ??? ????.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCoverImagesUpdate = async (images: typeof restaurantData.cover_images) => {
    if (!restaurant) return;

    try {
      const normalized = normalizeCoverImages(images || []);
      const prepared = prepareCoverImagesForSave(normalized);
      console.log('[SettingsTab] Updating cover images', { restaurantId: restaurant.id, count: prepared.length });
      const { error } = await supabase
        .from('restaurants')
        .update({ cover_images: prepared as unknown as Json })
        .eq('id', restaurant.id);

      if (error) {
        console.error('Error updating cover images:', error);
        setMessage({ type: 'error', text: '???? ????? ??? ??????? ???? ???????? ??? ????.' });
      } else {
        setMessage({ type: 'success', text: '?? ????? ??? ?????? ?????' });
        setTimeout(() => setMessage(null), 2000);
        onUpdate();
      }
    } catch (error) {
      console.error('Unexpected error while updating cover images:', error);
      setMessage({ type: 'error', text: '???? ????? ??? ??????? ???? ???????? ??? ????.' });
    }
  };

  return (
    <div className="space-y-6">
      <input type="file" ref={logoInputRef} className="hidden" accept="image/png,image/jpeg,image/webp" onChange={handleLogoFileChange} />
      <input type="file" ref={coverInputRef} className="hidden" accept="image/png,image/jpeg,image/webp" onChange={handleCoverFileChange} />
      {message && (
        <div className={`p-4 rounded-2xl ${messageStyles[message.type]}`}>{message.text}</div>
      )}

      {/* Basic Info */}
      <SectionCard title="بيانات المطعم الأساسية" description="الاسم والوصف والشعار">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="اسم المطعم (عربي)"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
          <Input
            label="اسم المطعم (إنجليزي - اختياري)"
            value={formData.name_en}
            onChange={(e) => updateField('name_en', e.target.value)}
          />
          <Input
            label="وصف قصير"
            value={formData.short_description}
            onChange={(e) => updateField('short_description', e.target.value)}
            placeholder="وصف مختصر يظهر في القائمة الرئيسية"
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">وصف طويل</label>
            <textarea
              value={formData.long_description}
              onChange={(e) => updateField('long_description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-150"
              placeholder="وصف تفصيلي عن المطعم"
              dir="rtl"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">رابط الشعار</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => updateField('logo_url', e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="https://example.com/logo.png"
                dir="rtl"
              />
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => logoInputRef.current?.click()}
                loading={uploadingLogo}
              >
                <Upload className="w-4 h-4" />
                رفع
              </Button>
            </div>
            {formData.logo_url && (
              <div className="mt-3">
                <img src={formData.logo_url} alt="Logo preview" className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-sm" />
              </div>
            )}
          </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">???? ?????? ????????</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={formData.cover_image_url}
              onChange={(e) => updateField('cover_image_url', e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="https://example.com/cover.jpg"
              dir="rtl"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => coverInputRef.current?.click()}
              loading={uploadingCover}
            >
              <Upload className="w-4 h-4" />
              ???
            </Button>
          </div>
          {formData.cover_image_url && (
            <div className="mt-3">
              <img src={formData.cover_image_url} alt="Cover preview" className="w-full max-w-lg h-40 object-cover rounded-xl border border-slate-200 shadow-sm" />
            </div>
          )}
        </div>
        </div>
      </SectionCard>

      {/* Cover Images */}
      <SectionCard title="صور العرض (Hero Slider)" description="صور الغلاف التي تظهر في أعلى صفحة القائمة">
        <HeroSliderManager
          restaurantId={restaurant.id}
          coverImages={restaurantData.cover_images}
          onUpdate={handleCoverImagesUpdate}
        />
      </SectionCard>

      {/* Contact */}
      <SectionCard title="معلومات الاتصال" description="هاتف وواتساب">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="رقم الهاتف"
            type="tel"
            value={formData.phone_number}
            onChange={(e) => updateField('phone_number', e.target.value)}
          />
          <Input
            label="رقم الواتساب"
            type="tel"
            value={formData.whatsapp_number}
            onChange={(e) => updateField('whatsapp_number', e.target.value)}
          />
        </div>
      </SectionCard>

      {/* Address */}
      <SectionCard title="العنوان" description="المدينة والمنطقة وعلامة مميزة">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">المدينة</label>
            <select
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-150"
              dir="rtl"
            >
              <option value="">اختر المدينة</option>
              {SYRIA_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="المنطقة"
            value={formData.area}
            onChange={(e) => updateField('area', e.target.value)}
            placeholder="مثال: المزة"
          />
          <Input
            label="علامة مميزة / وصف العنوان"
            value={formData.address_landmark}
            onChange={(e) => updateField('address_landmark', e.target.value)}
            placeholder="جانب القصور، مقابل مطعم X"
          />
        </div>
      </SectionCard>

      {/* Plan */}
      <SectionCard title="الخطة" description="اختر خطة المطعم">
        <div>
          <select
            value={formData.plan}
            onChange={(e) => updateField('plan', e.target.value as 'A' | 'B' | 'C')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-150"
            dir="rtl"
          >
            <option value="A">الخطة A - قائمة رقمية فقط</option>
            <option value="B">الخطة B - قائمة + طلبات من الطاولة</option>
            <option value="C">الخطة C - قائمة + طلبات + توصيل</option>
          </select>
          <p className="mt-2 text-sm text-slate-600">
            {formData.plan === 'A' && 'عرض القائمة الرقمية فقط عبر QR'}
            {formData.plan === 'B' && 'عرض القائمة + إمكانية الطلب من الطاولة'}
            {formData.plan === 'C' && 'جميع المميزات + طلبات التوصيل والاستلام'}
          </p>
        </div>
      </SectionCard>

      {/* Delivery Fee */}
      {formData.plan === 'C' && (
        <SectionCard title="رسوم التوصيل" description="رسوم التوصيل للطلبات الخارجية">
          <Input
            label="رسوم التوصيل (ل.س)"
            type="number"
            value={formData.delivery_fee.toString()}
            onChange={(e) => updateField('delivery_fee', parseFloat(e.target.value) || 0)}
          />
        </SectionCard>
      )}

      {/* Extra Fees */}
      <SectionCard title="الرسوم الإضافية" description="إدارة الرسوم الإضافية التي تُضاف إلى الطلبات (حتى 5 رسوم)">
        {supportsExtraFees ? (
          <ExtraFeesManager
            extraFees={formData.extra_fees}
            onUpdate={(fees) => updateField('extra_fees', fees)}
          />
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm" dir="rtl">
            ???? ?????? ???????? ????? ??? ????? ????? ????????. ???? ????? ?????
            <code className="mx-1 text-xs bg-white/60 px-2 py-0.5 rounded-lg">20250115000000_add_order_fees_and_extra_fees.sql</code>
            ?? Supabase ????????.
          </div>
        )}
      </SectionCard>

      {/* Status Override */}
      <SectionCard title="حالة المطعم" description="تحكم في حالة الفتح/الإغلاق">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { value: 'auto', label: 'تلقائي (حسب أوقات العمل)' },
            { value: 'open', label: 'مفتوح الآن' },
            { value: 'busy', label: 'مشغول الآن' },
            { value: 'closed', label: 'مغلق الآن' },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                formData.status_override === opt.value
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="status_override"
                value={opt.value}
                checked={formData.status_override === opt.value}
                onChange={(e) => updateField('status_override', e.target.value as typeof formData.status_override)}
                className="text-orange-500"
              />
              <span className="text-sm text-slate-800">{opt.label}</span>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* Opening Hours */}
      <SectionCard title="أوقات العمل" description="تحديد أوقات فتح وإغلاق المطعم">
        <OpeningHoursEditor
          openingHours={formData.opening_hours}
          onChange={(hours) => updateField('opening_hours', hours)}
        />
      </SectionCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} variant="primary" size="lg">
          <Save className="w-5 h-5" />
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
}

function OpeningHoursEditor({
  openingHours,
  onChange,
}: {
  openingHours: DailyOpeningHours[];
  onChange: (hours: DailyOpeningHours[]) => void;
}) {
  const days = [
    { key: 'sat', label: 'السبت' },
    { key: 'sun', label: 'الأحد' },
    { key: 'mon', label: 'الإثنين' },
    { key: 'tue', label: 'الثلاثاء' },
    { key: 'wed', label: 'الأربعاء' },
    { key: 'thu', label: 'الخميس' },
    { key: 'fri', label: 'الجمعة' },
  ];

  const getDayData = (dayKey: string) => {
    return openingHours.find((d) => d.day === dayKey) || { day: dayKey, ranges: [] };
  };

  const updateDayRanges = (dayKey: string, ranges: { from: string; to: string }[]) => {
    const updated = openingHours.filter((d) => d.day !== dayKey);
    if (ranges.length > 0) {
      updated.push({ day: dayKey, ranges });
    }
    onChange(updated);
  };

  const addRange = (dayKey: string) => {
    const dayData = getDayData(dayKey);
    updateDayRanges(dayKey, [...dayData.ranges, { from: '09:00', to: '17:00' }]);
  };

  const removeRange = (dayKey: string, index: number) => {
    const dayData = getDayData(dayKey);
    updateDayRanges(dayKey, dayData.ranges.filter((_, i) => i !== index));
  };

  const updateRange = (dayKey: string, index: number, field: 'from' | 'to', value: string) => {
    const dayData = getDayData(dayKey);
    const updatedRanges = dayData.ranges.map((r, i) => (i === index ? { ...r, [field]: value } : r));
    updateDayRanges(dayKey, updatedRanges);
  };

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const dayData = getDayData(day.key);
        return (
          <div key={day.key} className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">{day.label}</h3>
              <Button onClick={() => addRange(day.key)} variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
                إضافة فترة
              </Button>
            </div>
            {dayData.ranges.length === 0 ? (
              <p className="text-sm text-slate-500">مغلق</p>
            ) : (
              <div className="space-y-2">
                {dayData.ranges.map((range, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={range.from}
                      onChange={(e) => updateRange(day.key, idx, 'from', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                    <span className="text-slate-600">إلى</span>
                    <input
                      type="time"
                      value={range.to}
                      onChange={(e) => updateRange(day.key, idx, 'to', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                    <Button
                      onClick={() => removeRange(day.key, idx)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}




