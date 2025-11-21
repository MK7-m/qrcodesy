import { useEffect, useState, useCallback } from 'react';
import { Database } from '../../lib/database.types';
import { getRestaurantOrders, getOrderById, updateOrderStatus } from '../../services/orders';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { Button } from '../../components/ui/Button';
import { SectionCard } from '../../components/ui/SectionCard';
import { TableSkeleton, CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Eye, X } from 'lucide-react';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type OrderWithDetails = Awaited<ReturnType<typeof getRestaurantOrders>>[0];

interface OrdersTabProps {
  restaurant: Restaurant;
}

export function OrdersTab({ restaurant }: OrdersTabProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [filters, setFilters] = useState<{
    status: OrderWithDetails['status'] | 'all';
    orderType: OrderWithDetails['order_type'] | 'all';
  }>({
    status: 'all',
    orderType: 'all',
  });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRestaurantOrders(restaurant.id, filters);
      setOrders(data);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }, [restaurant.id, filters.status, filters.orderType]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderWithDetails['status']) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      loadOrders();
      if (selectedOrder?.id === orderId) {
        const updated = await getOrderById(orderId);
        if (updated) setSelectedOrder(updated);
      }
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadOrders} />;
  }

  const filteredOrders = orders.filter((order) => {
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    if (filters.orderType !== 'all' && order.order_type !== filters.orderType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <SectionCard title="الطلبات" description="إدارة جميع طلبات المطعم">
        <div className="flex flex-wrap gap-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">الحالة</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value as OrderWithDetails['status'] | 'all' })
              }
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              dir="rtl"
            >
              <option value="all">الكل</option>
              <option value="pending">قيد الانتظار</option>
              <option value="confirmed">تم التأكيد</option>
              <option value="preparing">قيد التحضير</option>
              <option value="ready">جاهز</option>
              <option value="completed">مكتمل</option>
              <option value="canceled">ملغى</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">نوع الطلب</label>
            <select
              value={filters.orderType}
              onChange={(e) =>
                setFilters({ ...filters, orderType: e.target.value as OrderWithDetails['order_type'] | 'all' })
              }
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              dir="rtl"
            >
              <option value="all">الكل</option>
              <option value="dine_in">طلب داخلي</option>
              <option value="delivery">توصيل</option>
              <option value="pickup">استلام</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">لا توجد طلبات</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">رقم الطلب</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">التاريخ والوقت</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">النوع</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">عدد العناصر</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">المجموع</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">الحالة</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">#{order.order_number}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{getOrderTypeLabel(order.order_type)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{order.items.length}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{order.total.toLocaleString()} ر.س</td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Button onClick={() => setSelectedOrder(order)} variant="primary" size="sm">
                          <Eye className="w-4 h-4" />
                          عرض التفاصيل
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">#{order.order_number}</h3>
                      <p className="text-sm text-slate-600">{formatDate(order.created_at)}</p>
                    </div>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                    <span>{getOrderTypeLabel(order.order_type)}</span>
                    <span>{order.items.length} عناصر</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="font-semibold text-slate-900">المجموع:</span>
                    <span className="font-bold text-orange-600">{order.total.toLocaleString()} ر.س</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </SectionCard>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}

function OrderDetailDrawer({
  order,
  onClose,
  onStatusChange,
}: {
  order: OrderWithDetails;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderWithDetails['status']) => void;
}) {
  const [saving, setSaving] = useState(false);

  const handleStatusUpdate = async (newStatus: OrderWithDetails['status']) => {
    setSaving(true);
    await onStatusChange(order.id, newStatus);
    setSaving(false);
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" dir="rtl" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">تفاصيل الطلب #{order.order_number}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <SectionCard title="حالة الطلب">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">تغيير الحالة</label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value as OrderWithDetails['status'])}
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  dir="rtl"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="confirmed">تم التأكيد</option>
                  <option value="preparing">قيد التحضير</option>
                  <option value="ready">جاهز</option>
                  <option value="completed">مكتمل</option>
                  <option value="canceled">ملغى</option>
                </select>
              </div>
              <div>
                <OrderStatusBadge status={order.status} size="lg" />
              </div>
            </div>
          </SectionCard>

          {/* Order Info */}
          <SectionCard title="معلومات الطلب">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">نوع الطلب:</span>
                <span className="font-medium text-slate-900">{getOrderTypeLabel(order.order_type)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">التاريخ:</span>
                <span className="font-medium text-slate-900">{new Date(order.created_at).toLocaleString('ar-SY')}</span>
              </div>
              {order.table_number && (
                <div className="flex justify-between">
                  <span className="text-slate-600">رقم الطاولة:</span>
                  <span className="font-medium text-slate-900">{order.table_number}</span>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Customer Info */}
          {(order.customer_name || order.customer_phone || order.customer_address) && (
            <SectionCard title="معلومات العميل">
              <div className="space-y-2 text-sm">
                {order.customer_name && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">الاسم:</span>
                    <span className="font-medium text-slate-900">{order.customer_name}</span>
                  </div>
                )}
                {order.customer_phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">الهاتف:</span>
                    <span className="font-medium text-slate-900">{order.customer_phone}</span>
                  </div>
                )}
                {order.customer_address && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">العنوان:</span>
                    <span className="font-medium text-slate-900">{order.customer_address}</span>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Items */}
          <SectionCard title="العناصر">
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">
                      {item.quantity}x {item.dish_name}
                    </div>
                    {item.notes && <div className="text-sm text-slate-600 mt-1">ملاحظة: {item.notes}</div>}
                  </div>
                  <div className="font-bold text-orange-600">{(item.dish_price * item.quantity).toLocaleString()} ر.س</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Fees */}
          <SectionCard title="الفاتورة">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">المجموع الفرعي:</span>
                <span className="font-medium text-slate-900">{order.subtotal.toLocaleString()} ر.س</span>
              </div>
              {order.fees.map((fee, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-slate-600">{fee.label}:</span>
                  <span className="font-medium text-slate-900">{fee.amount.toLocaleString()} ر.س</span>
                </div>
              ))}
              {order.delivery_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">رسوم التوصيل:</span>
                  <span className="font-medium text-slate-900">{order.delivery_fee.toLocaleString()} ر.س</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-slate-200 text-lg font-bold">
                <span className="text-slate-900">المجموع:</span>
                <span className="text-orange-600">{order.total.toLocaleString()} ر.س</span>
              </div>
            </div>
          </SectionCard>

          {/* Notes */}
          {order.notes && (
            <SectionCard title="ملاحظات الطلب">
              <p className="text-sm text-slate-700">{order.notes}</p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

