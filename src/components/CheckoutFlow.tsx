import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Truck, Package, Utensils } from 'lucide-react';
import type { Restaurant } from '../types/restaurant';
import { calculateOrderTotals } from '../utils/orderCalculations';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

// Minimal cart item interface - only fields actually used in checkout
export interface CartItem {
  id: string;
  name: string;
  price: number | string;
  quantity: number;
  notes: string;
}

type OrderMode = 'dine-in' | 'delivery' | 'pickup';

interface CheckoutFlowProps {
  restaurant: Restaurant;
  cart: CartItem[];
  tableId: string | null;
  orderMode: OrderMode;
  plan: 'a' | 'b' | 'c';
  onBack: () => void;
  onOrderComplete?: () => void;
}

type DineInStep = 'table' | 'review' | 'confirmation';
type DeliveryPickupStep = 'info' | 'review' | 'confirmation';

export function CheckoutFlow({
  restaurant,
  cart,
  tableId,
  orderMode,
  plan,
  onBack,
  onOrderComplete,
}: CheckoutFlowProps) {
  const navigate = useNavigate();
  const allowedModes: OrderMode[] =
    plan === 'b' ? ['dine-in'] : plan === 'c' ? ['dine-in', 'delivery', 'pickup'] : [];

  if (plan === 'a') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-6 text-center space-y-4">
          <CheckCircle className="w-12 h-12 mx-auto text-orange-500" />
          <h1 className="text-xl font-semibold text-slate-900">الطلبات غير مفعّلة</h1>
          <p className="text-sm text-slate-600">
            هذه الخطة لا تسمح بإتمام الطلب عبر التطبيق. يمكنك العودة لاختيار خطة أعلى أو التواصل مع المطعم.
          </p>
          <Button variant="secondary" size="md" className="w-full" onClick={onBack}>
            العودة إلى القائمة
          </Button>
        </div>
      </div>
    );
  }

  if (!allowedModes.includes(orderMode)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-6 text-center space-y-4">
          <Package className="w-12 h-12 mx-auto text-orange-500" />
          <h1 className="text-xl font-semibold text-slate-900">طريقة الطلب غير متوفرة</h1>
          <p className="text-sm text-slate-600">
            خطة المطعم لا تسمح بهذه الطريقة. اختر نوعاً آخر من الطلب أو اطلب المساعدة من الموظفين.
          </p>
          <Button variant="secondary" size="md" className="w-full" onClick={onBack}>
            العودة إلى القائمة
          </Button>
        </div>
      </div>
    );
  }

  const isDineIn = orderMode === 'dine-in';
  const isDelivery = orderMode === 'delivery';

  // Dine-in state
  const [dineInStep, setDineInStep] = useState<DineInStep>('table');
  const [tableNumber, setTableNumber] = useState(tableId || '');
  const [tableNumberError, setTableNumberError] = useState('');

  // Delivery/Pickup state
  const [deliveryPickupStep, setDeliveryPickupStep] = useState<DeliveryPickupStep>('info');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerArea, setCustomerArea] = useState('');
  const [customerLandmark, setCustomerLandmark] = useState('');
  const [customerErrors, setCustomerErrors] = useState<Record<string, string>>({});

  // Common state
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const stepRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when step changes
  useEffect(() => {
    if (stepRef.current) {
      stepRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [dineInStep, deliveryPickupStep]);

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const deliveryFee = isDelivery ? restaurant.delivery_fee : 0;
  const totals = calculateOrderTotals(subtotal, restaurant.extra_fees, deliveryFee);

  const validateDineIn = (): boolean => {
    if (!tableNumber.trim()) {
      setTableNumberError('رقم الطاولة مطلوب');
      return false;
    }
    setTableNumberError('');
    return true;
  };

  const validateDelivery = (): boolean => {
    const errors: Record<string, string> = {};
    if (!customerName.trim()) errors.name = 'الاسم مطلوب';
    if (!customerPhone.trim()) errors.phone = 'رقم الهاتف مطلوب';
    if (!customerCity.trim()) errors.city = 'المدينة مطلوبة';
    if (!customerArea.trim()) errors.area = 'المنطقة مطلوبة';
    if (!customerLandmark.trim()) errors.landmark = 'علامة مميزة/العنوان مطلوبة';

    setCustomerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePickup = (): boolean => {
    const errors: Record<string, string> = {};
    if (!customerName.trim()) errors.name = 'الاسم مطلوب';
    if (!customerPhone.trim()) errors.phone = 'رقم الهاتف مطلوب';

    setCustomerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Generate order number
      const timestamp = Date.now();
      const orderNumberValue = `ORD-${timestamp}`;
      const tableReference = tableNumber.trim() || tableId || null;
      const orderTypePayload = orderMode === 'dine-in' ? 'dine_in' : orderMode;

      const orderData = {
        restaurant_id: restaurant.id,
        order_number: orderNumberValue,
        order_type: orderTypePayload as 'dine_in' | 'delivery' | 'pickup',
        table_id: isDineIn ? tableReference : null,
        customer_name: isDineIn ? null : customerName,
        customer_phone: isDineIn ? null : customerPhone,
        customer_address:
          isDelivery
            ? `${customerCity} - ${customerArea} - ${customerLandmark}`
            : null,
        subtotal: totals.subtotal,
        delivery_fee: totals.deliveryFee,
        total: totals.total,
        notes: orderNotes || null,
        status: 'pending' as const,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        dish_id: item.id,
        dish_name: item.name,
        dish_price: Number(item.price),
        quantity: item.quantity,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Insert order fees
      if (totals.extraFees.length > 0) {
        const orderFees = totals.extraFees.map((fee) => ({
          order_id: order.id,
          label: fee.label,
          amount: fee.amount,
        }));

        const { error: feesError } = await supabase.from('order_fees').insert(orderFees);
        if (feesError) throw feesError;
      }

      setOrderNumber(orderNumberValue);
      setOrderSuccess(true);
      if (onOrderComplete) {
        onOrderComplete();
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('حدث خطأ في إرسال الطلب. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // Confirmation screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">تم استلام طلبك بنجاح</h1>
            <p className="text-xl font-semibold text-orange-600">رقم الطلب: #{orderNumber}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 mb-6">
            <p className="text-lg font-bold text-slate-900 mb-2">{totals.total.toLocaleString()} ر.س</p>
            <p className="text-sm text-slate-600">الدفع عند الاستلام</p>
          </div>
          <Button
            onClick={() => {
              navigate(`/menu/${restaurant.id}`);
            }}
            fullWidth
            variant="primary"
            size="lg"
          >
            العودة إلى القائمة
          </Button>
        </div>
      </div>
    );
  }

  // Dine-in flow
  if (isDineIn) {
    return (
      <div className="min-h-screen bg-slate-50" dir="rtl">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="mb-4">
            <Button variant="secondary" size="sm" onClick={onBack}>
              العودة إلى القائمة
            </Button>
          </div>
          {/* Step indicator */}
          <div className="mb-6">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4" style={{ width: dineInStep === 'table' ? '33%' : dineInStep === 'review' ? '66%' : '100%' }} />
            <div className="flex items-center justify-between text-sm">
              <span className={dineInStep === 'table' ? 'font-bold text-orange-600' : 'text-slate-400'}>1. رقم الطاولة</span>
              <span className={dineInStep === 'review' ? 'font-bold text-orange-600' : 'text-slate-400'}>2. المراجعة</span>
              <span className={dineInStep === 'confirmation' ? 'font-bold text-orange-600' : 'text-slate-400'}>3. التأكيد</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4" ref={stepRef}>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">إتمام الطلب</h1>

            {dineInStep === 'table' && (
              <div className="space-y-6">
                <Input
                  label="رقم الطاولة"
                  value={tableNumber}
                  onChange={(e) => {
                    setTableNumber(e.target.value);
                    setTableNumberError('');
                  }}
                  error={tableNumberError}
                  placeholder="أدخل رقم الطاولة"
                  required
                />

                <Button
                  onClick={() => {
                    if (validateDineIn()) {
                      setDineInStep('review');
                    }
                  }}
                  fullWidth
                  variant="primary"
                  size="lg"
                  disabled={!tableNumber.trim()}
                >
                  التالي
                </Button>
              </div>
            )}

            {dineInStep === 'review' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">تفاصيل الطلب</h2>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">
                            {item.quantity}x {item.name}
                          </span>
                          {item.notes && <div className="text-xs text-slate-600 mt-1">{item.notes}</div>}
                        </div>
                        <span className="font-medium">{(Number(item.price) * item.quantity).toLocaleString()} ر.س</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">طريقة الطلب</h2>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Utensils className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-semibold text-slate-900">تناول الطعام في المطعم</div>
                        <div className="text-sm text-slate-600">الطاولة: {tableNumber}</div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-3">سيتم تجهيز طلبك وتقديمه على طاولتك داخل المطعم.</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">ملخص الفاتورة</h2>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>المجموع الفرعي</span>
                      <span>{totals.subtotal.toLocaleString()} ر.س</span>
                    </div>
                    {totals.extraFees.map((fee, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{fee.label}</span>
                        <span>{fee.amount.toLocaleString()} ر.س</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-300 pt-2 mt-2 flex justify-between text-lg font-bold">
                      <span>المجموع</span>
                      <span className="text-orange-600">{totals.total.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات إضافية (اختياري)</label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="مثلاً: نريد الطلب بسرعة"
                    dir="rtl"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setDineInStep('table')}
                    variant="secondary"
                    size="md"
                  >
                    السابق
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    loading={loading}
                    fullWidth
                    variant="primary"
                    size="lg"
                  >
                    {loading ? 'جارٍ إرسال الطلب...' : 'تأكيد الطلب'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Delivery/Pickup flow
  const currentStep = deliveryPickupStep;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4">
          <Button variant="secondary" size="sm" onClick={onBack}>
            العودة إلى القائمة
          </Button>
        </div>
        {/* Step indicator */}
        <div className="mb-6">
          <div
            className="h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4"
            style={{ width: currentStep === 'info' ? '33%' : currentStep === 'review' ? '66%' : '100%' }}
          />
          <div className="flex items-center justify-between text-sm">
            <span className={currentStep === 'info' ? 'font-bold text-orange-600' : 'text-slate-400'}>1. المعلومات</span>
            <span className={currentStep === 'review' ? 'font-bold text-orange-600' : 'text-slate-400'}>2. المراجعة</span>
            <span className={currentStep === 'confirmation' ? 'font-bold text-orange-600' : 'text-slate-400'}>3. التأكيد</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">إتمام الطلب</h1>

          {currentStep === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الاسم</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setCustomerErrors({ ...customerErrors, name: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-2xl border bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                    customerErrors.name ? 'border-red-500' : 'border-slate-200'
                  }`}
                  placeholder="أدخل اسمك"
                  dir="rtl"
                />
                {customerErrors.name && <p className="text-red-500 text-sm mt-1">{customerErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    setCustomerErrors({ ...customerErrors, phone: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-2xl border bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                    customerErrors.phone ? 'border-red-500' : 'border-slate-200'
                  }`}
                  placeholder="09xxxxxxxx"
                  dir="rtl"
                />
                {customerErrors.phone && <p className="text-red-500 text-sm mt-1">{customerErrors.phone}</p>}
              </div>

              {isDelivery && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">المدينة</label>
                    <input
                      type="text"
                      value={customerCity}
                      onChange={(e) => {
                        setCustomerCity(e.target.value);
                        setCustomerErrors({ ...customerErrors, city: '' });
                      }}
                      className={`w-full px-4 py-3 rounded-2xl border bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                        customerErrors.city ? 'border-red-500' : 'border-slate-200'
                      }`}
                      placeholder="مثال: دمشق"
                      dir="rtl"
                    />
                    {customerErrors.city && <p className="text-red-500 text-sm mt-1">{customerErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">المنطقة</label>
                    <input
                      type="text"
                      value={customerArea}
                      onChange={(e) => {
                        setCustomerArea(e.target.value);
                        setCustomerErrors({ ...customerErrors, area: '' });
                      }}
                      className={`w-full px-4 py-3 rounded-2xl border bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                        customerErrors.area ? 'border-red-500' : 'border-slate-200'
                      }`}
                      placeholder="مثال: المزة"
                      dir="rtl"
                    />
                    {customerErrors.area && <p className="text-red-500 text-sm mt-1">{customerErrors.area}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">علامة مميزة / العنوان</label>
                    <textarea
                      value={customerLandmark}
                      onChange={(e) => {
                        setCustomerLandmark(e.target.value);
                        setCustomerErrors({ ...customerErrors, landmark: '' });
                      }}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-2xl border bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                        customerErrors.landmark ? 'border-red-500' : 'border-slate-200'
                      }`}
                      placeholder="مثال: جانب القصور، مقابل مطعم X"
                      dir="rtl"
                    />
                    {customerErrors.landmark && <p className="text-red-500 text-sm mt-1">{customerErrors.landmark}</p>}
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  const isValid = isDelivery ? validateDelivery() : validatePickup();
                  if (isValid) {
                    setDeliveryPickupStep('review');
                  }
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-2xl transition shadow-lg"
              >
                التالي
              </button>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">تفاصيل الطلب</h2>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">
                          {item.quantity}x {item.name}
                        </span>
                        {item.notes && <div className="text-xs text-slate-600 mt-1">{item.notes}</div>}
                      </div>
                      <span className="font-medium">{(Number(item.price) * item.quantity).toLocaleString()} ر.س</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">طريقة الطلب</h2>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {isDelivery ? <Truck className="w-5 h-5 text-orange-600" /> : <Package className="w-5 h-5 text-orange-600" />}
                    <div>
                      <div className="font-semibold text-slate-900">{isDelivery ? 'توصيل' : 'استلام'}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-700 space-y-1">
                    <div>{customerName}</div>
                    <div>{customerPhone}</div>
                    {isDelivery && (
                      <>
                        <div>{customerCity} - {customerArea}</div>
                        <div>{customerLandmark}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">ملخص الفاتورة</h2>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>المجموع الفرعي</span>
                    <span>{totals.subtotal.toLocaleString()} ر.س</span>
                  </div>
                  {totals.extraFees.map((fee, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{fee.label}</span>
                      <span>{fee.amount.toLocaleString()} ر.س</span>
                    </div>
                  ))}
                  {totals.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>رسوم التوصيل</span>
                      <span>{totals.deliveryFee.toLocaleString()} ر.س</span>
                    </div>
                  )}
                  <div className="border-t border-slate-300 pt-2 mt-2 flex justify-between text-lg font-bold">
                    <span>المجموع</span>
                    <span className="text-orange-600">{totals.total.toLocaleString()} ر.س</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات إضافية (اختياري)</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="مثلاً: نريد الطلب بسرعة"
                  dir="rtl"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeliveryPickupStep('info')}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition"
                >
                  السابق
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition shadow-lg"
                >
                  {loading ? 'جارٍ إرسال الطلب...' : 'تأكيد الطلب'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
