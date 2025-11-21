import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  getOrderById,
  updateOrderStatus,
  updateOrderItemQuantity,
  updateOrderItemNotes,
  deleteOrderItem,
  recalculateOrderTotals,
  updateOrderNotes,
  type OrderWithDetails,
} from '../../services/orders';
import { getRestaurantById } from '../../services/restaurants';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { ArrowRight, Plus, Minus, Trash2, Save } from 'lucide-react';
import type { Restaurant } from '../../types/restaurant';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'canceled';
export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');

  const loadRestaurant = useCallback(async () => {
    if (!user) return null;

    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    return data ? (await getRestaurantById(data.id)) : null;
  }, [user]);

  const loadData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [orderData, restaurantData] = await Promise.all([
        getOrderById(id),
        loadRestaurant(),
      ]);

      if (orderData) {
        setOrder(orderData);
        setEditingNotes(orderData.notes || '');
      }

      if (restaurantData) {
        setRestaurant(restaurantData);
      }
    } catch (error) {
      console.error('Error loading order data:', error);
    } finally {
      setLoading(false);
    }
  }, [id, loadRestaurant]);

  useEffect(() => {
    if (!id || !user) return;
    loadData();
  }, [id, user, loadData]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || !id) return;

    setSaving(true);
    const success = await updateOrderStatus(id, newStatus);
    if (success) {
      setOrder({ ...order, status: newStatus });
    }
    setSaving(false);
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (!order || !restaurant || !id) return;

    setSaving(true);
    const success = await updateOrderItemQuantity(itemId, newQuantity);
    if (success) {
      // Reload order to get updated items
      const updatedOrder = await getOrderById(id);
      if (updatedOrder) {
        // Recalculate totals
        await recalculateOrderTotals(id, restaurant);
        const finalOrder = await getOrderById(id);
        if (finalOrder) {
          setOrder(finalOrder);
        }
      }
    }
    setSaving(false);
  };

  const handleItemNotesChange = async (itemId: string, notes: string) => {
    if (!order) return;

    setSaving(true);
    const success = await updateOrderItemNotes(itemId, notes);
    if (success) {
      const updatedOrder = await getOrderById(id!);
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
    }
    setSaving(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!order || !restaurant || !id) return;
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;

    setSaving(true);
    const success = await deleteOrderItem(itemId);
    if (success) {
      // Recalculate totals
      await recalculateOrderTotals(id, restaurant);
      const updatedOrder = await getOrderById(id);
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
    }
    setSaving(false);
  };

  const handleOrderNotesSave = async () => {
    if (!id) return;

    setSaving(true);
    const success = await updateOrderNotes(id, editingNotes);
    if (success && order) {
      setOrder({ ...order, notes: editingNotes });
    }
    setSaving(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case 'dine_in':
        return 'طلب داخلي';
      case 'delivery':
        return 'توصيل';
      case 'pickup':
        return 'استلام';
      default:
        return type;
    }
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

  if (!order || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">تعذر تحميل بيانات الطلب</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowRight className="w-5 h-5" />
          العودة إلى قائمة الطلبات
        </button>

        {/* Section A - Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">الطلب #{order.order_number}</h1>
              <p className="text-slate-600">{formatDate(order.created_at)}</p>
            </div>
            <div className="flex items-center gap-4">
              <OrderStatusBadge status={order.status} size="lg" />
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                disabled={saving}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none font-medium"
              >
                <option value="pending">قيد الانتظار</option>
                <option value="confirmed">تم التأكيد</option>
                <option value="preparing">قيد التحضير</option>
                <option value="ready">جاهز</option>
                <option value="completed">مكتمل</option>
                <option value="canceled">ملغى</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section B - Customer Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">معلومات العميل</h2>
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            {order.order_type === 'dine_in' ? (
              <div>
                <span className="text-sm text-slate-600">رقم الطاولة:</span>
                <span className="font-semibold text-slate-900 mr-2">{order.table_number || 'غير محدد'}</span>
              </div>
            ) : (
              <>
                {order.customer_name && (
                  <div>
                    <span className="text-sm text-slate-600">الاسم:</span>
                    <span className="font-semibold text-slate-900 mr-2">{order.customer_name}</span>
                  </div>
                )}
                {order.customer_phone && (
                  <div>
                    <span className="text-sm text-slate-600">الهاتف:</span>
                    <span className="font-semibold text-slate-900 mr-2">{order.customer_phone}</span>
                  </div>
                )}
                {order.order_type === 'delivery' && order.customer_address && (
                  <div>
                    <span className="text-sm text-slate-600">العنوان:</span>
                    <span className="font-semibold text-slate-900 mr-2">{order.customer_address}</span>
                  </div>
                )}
              </>
            )}
            <div>
              <span className="text-sm text-slate-600">نوع الطلب:</span>
              <span className="font-semibold text-slate-900 mr-2">{getOrderTypeLabel(order.order_type)}</span>
            </div>
          </div>
        </div>

        {/* Section C - Order Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">عناصر الطلب</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">اسم العنصر</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">الكمية</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">السعر</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">الملاحظات</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-600">
                      لا توجد عناصر
                    </td>
                  </tr>
                ) : (
                  order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{item.dish_name}</div>
                        <div className="text-sm text-slate-600">{Number(item.dish_price).toLocaleString()} ر.س للواحدة</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={saving || item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={saving}
                            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {(Number(item.dish_price) * item.quantity).toLocaleString()} ر.س
                      </td>
                      <td className="px-4 py-3">
                        {editingItemId === item.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              defaultValue={item.notes || ''}
                              onBlur={(e) => {
                                handleItemNotesChange(item.id, e.target.value);
                                setEditingItemId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleItemNotesChange(item.id, e.currentTarget.value);
                                  setEditingItemId(null);
                                }
                                if (e.key === 'Escape') {
                                  setEditingItemId(null);
                                }
                              }}
                              className="flex-1 px-2 py-1 text-sm rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingItemId(item.id)}
                            className="text-sm text-slate-600 hover:text-orange-600 text-left w-full"
                          >
                            {item.notes || 'إضافة ملاحظة'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={saving}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section D - Fees Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">ملخص الفاتورة</h2>
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">المجموع الفرعي</span>
              <span className="font-semibold text-slate-900">{order.subtotal.toLocaleString()} ر.س</span>
            </div>
            {order.fees.map((fee, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-slate-600">{fee.label}</span>
                <span className="font-semibold text-slate-900">{fee.amount.toLocaleString()} ر.س</span>
              </div>
            ))}
            {order.delivery_fee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">رسوم التوصيل</span>
                <span className="font-semibold text-slate-900">{order.delivery_fee.toLocaleString()} ر.س</span>
              </div>
            )}
            <div className="border-t border-slate-300 pt-3 mt-3 flex justify-between text-lg font-bold">
              <span className="text-slate-900">المجموع</span>
              <span className="text-orange-600">{order.total.toLocaleString()} ر.س</span>
            </div>
          </div>
        </div>

        {/* Section E - Notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">ملاحظات الطلب</h2>
          <div className="space-y-3">
            <textarea
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
              placeholder="ملاحظات إضافية حول الطلب..."
              dir="rtl"
            />
            <button
              onClick={handleOrderNotesSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition disabled:opacity-50 font-medium"
            >
              <Save className="w-4 h-4" />
              حفظ الملاحظات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

