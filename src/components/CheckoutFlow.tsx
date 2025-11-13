import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { ArrowRight, CheckCircle, Truck, Package } from 'lucide-react';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type Dish = Database['public']['Tables']['dishes']['Row'];

interface CartItem extends Dish {
  quantity: number;
  notes: string;
}

interface CheckoutFlowProps {
  restaurant: Restaurant;
  cart: CartItem[];
  tableId: string | null;
  orderType: 'delivery' | 'pickup' | null;
  onBack: () => void;
}

export function CheckoutFlow({ restaurant, cart, tableId, orderType: initialOrderType, onBack }: CheckoutFlowProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'method' | 'info' | 'review'>('method');
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>(initialOrderType || 'delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const isDineIn = !!tableId;
  const showMethodSelection = !isDineIn && !initialOrderType;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? restaurant.delivery_fee : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: orderNumberData } = await supabase.rpc('generate_order_number', { rest_id: restaurant.id });

      const orderData: Database['public']['Tables']['orders']['Insert'] = {
        restaurant_id: restaurant.id,
        order_number: orderNumberData || `ORD-${Date.now()}`,
        order_type: isDineIn ? 'dine_in' : orderType,
        table_id: tableId || null,
        customer_name: isDineIn ? null : customerName,
        customer_phone: isDineIn ? null : customerPhone,
        customer_address: orderType === 'delivery' ? customerAddress : null,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        notes: orderNotes || null,
        status: 'new',
      };

      const { data: order, error: orderError } = await supabase.from('orders').insert(orderData).select().single();

      if (orderError) throw orderError;

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        dish_id: item.id,
        dish_name: item.name,
        dish_price: item.price,
        quantity: item.quantity,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderNumber(order.order_number);
      setOrderSuccess(true);
    } catch (error) {
      console.error('Order error:', error);
      alert('حدث خطأ في إرسال الطلب. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">تم استلام طلبك!</h1>
          <p className="text-slate-600 mb-6">رقم الطلب: #{orderNumber}</p>
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-700 mb-2">
              {isDineIn && 'سيصل طلبك إلى الطاولة قريباً'}
              {orderType === 'delivery' && 'سيتم توصيل طلبك في أقرب وقت'}
              {orderType === 'pickup' && 'يمكنك استلام طلبك عندما يكون جاهزاً'}
            </p>
            <div className="text-2xl font-bold text-orange-600">{total.toLocaleString()} ل.س</div>
            <p className="text-xs text-slate-600 mt-1">الدفع عند الاستلام</p>
          </div>
          <button
            onClick={() => navigate(`/menu/${restaurant.id}`)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors"
          >
            العودة إلى القائمة
          </button>
        </div>
      </div>
    );
  }

  if (isDineIn) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
            <ArrowRight className="w-5 h-5" />
            العودة
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">مراجعة الطلب</h2>

            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">
                      {item.quantity}x {item.name}
                    </span>
                    {item.notes && <div className="text-xs text-slate-600">{item.notes}</div>}
                  </div>
                  <span className="font-medium">{(item.price * item.quantity).toLocaleString()} ل.س</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4 mb-4">
              <div className="flex justify-between text-lg font-bold">
                <span>المجموع</span>
                <span className="text-orange-600">{total.toLocaleString()} ل.س</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات إضافية (اختياري)</label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="مثلاً: نريد الطلب بسرعة"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-4 rounded-lg transition-colors shadow-lg"
          >
            {loading ? 'جارٍ إرسال الطلب...' : 'تأكيد الطلب'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowRight className="w-5 h-5" />
          العودة
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`flex items-center gap-2 ${step === 'method' ? 'text-orange-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'method' ? 'bg-orange-500 text-white' : 'bg-slate-200'}`}>
                1
              </div>
              <span className="text-sm font-medium">الطريقة</span>
            </div>
            <div className="flex-1 h-px bg-slate-200"></div>
            <div className={`flex items-center gap-2 ${step === 'info' ? 'text-orange-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'info' ? 'bg-orange-500 text-white' : 'bg-slate-200'}`}>
                2
              </div>
              <span className="text-sm font-medium">المعلومات</span>
            </div>
            <div className="flex-1 h-px bg-slate-200"></div>
            <div className={`flex items-center gap-2 ${step === 'review' ? 'text-orange-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-orange-500 text-white' : 'bg-slate-200'}`}>
                3
              </div>
              <span className="text-sm font-medium">المراجعة</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {step === 'method' && showMethodSelection && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">اختر طريقة الاستلام</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setOrderType('delivery')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    orderType === 'delivery' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Truck className={`w-12 h-12 mx-auto mb-3 ${orderType === 'delivery' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <div className="font-bold text-slate-900">توصيل</div>
                  <div className="text-sm text-slate-600 mt-1">{restaurant.delivery_fee.toLocaleString()} ل.س</div>
                </button>
                <button
                  onClick={() => setOrderType('pickup')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    orderType === 'pickup' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Package className={`w-12 h-12 mx-auto mb-3 ${orderType === 'pickup' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <div className="font-bold text-slate-900">استلام</div>
                  <div className="text-sm text-slate-600 mt-1">مجاناً</div>
                </button>
              </div>
              <button onClick={() => setStep('info')} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors">
                التالي
              </button>
            </div>
          )}

          {step === 'info' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">معلومات التواصل</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الاسم</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                {orderType === 'delivery' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">العنوان</label>
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                {showMethodSelection && (
                  <button onClick={() => setStep('method')} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">
                    السابق
                  </button>
                )}
                <button
                  onClick={() => setStep('review')}
                  disabled={!customerName || !customerPhone || (orderType === 'delivery' && !customerAddress)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">مراجعة الطلب</h2>

              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {orderType === 'delivery' ? <Truck className="w-5 h-5 text-orange-600" /> : <Package className="w-5 h-5 text-orange-600" />}
                  <span className="font-bold">{orderType === 'delivery' ? 'توصيل' : 'استلام'}</span>
                </div>
                <div className="text-sm text-slate-700">
                  <div>{customerName}</div>
                  <div>{customerPhone}</div>
                  {customerAddress && <div>{customerAddress}</div>}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">
                        {item.quantity}x {item.name}
                      </span>
                      {item.notes && <div className="text-xs text-slate-600">{item.notes}</div>}
                    </div>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString()} ل.س</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>المجموع الفرعي</span>
                  <span>{subtotal.toLocaleString()} ل.س</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span>رسوم التوصيل</span>
                    <span>{deliveryFee.toLocaleString()} ل.س</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>المجموع</span>
                  <span className="text-orange-600">{total.toLocaleString()} ل.س</span>
                </div>
                <p className="text-xs text-slate-600 mt-2">الدفع عند الاستلام فقط</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات إضافية (اختياري)</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('info')} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">
                  السابق
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
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
