import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getRestaurantOrders } from '../../services/orders';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { Database } from '../../lib/database.types';
import { Package, Eye } from 'lucide-react';
import { TableSkeleton, CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type OrderWithDetails = Awaited<ReturnType<typeof getRestaurantOrders>>[0];

export function AdminOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    status: OrderWithDetails['status'] | 'all';
    orderType: OrderWithDetails['order_type'] | 'all';
    startDate: string;
    endDate: string;
  }>({
    status: 'all',
    orderType: 'all',
    startDate: '',
    endDate: '',
  });

  const loadRestaurant = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading restaurant:', error);
      return;
    }

    setRestaurant(data);
  }, [user]);

  const loadOrders = useCallback(async () => {
    if (!restaurant) return;

    setLoading(true);
    try {
      const data = await getRestaurantOrders(restaurant.id, filters);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }, [restaurant, filters]);

  useEffect(() => {
    if (!user) return;
    loadRestaurant();
  }, [user, loadRestaurant]);

  useEffect(() => {
    if (restaurant) {
      loadOrders();
    }
  }, [restaurant, loadOrders]);

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

  if (loading && !restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-4">
          <CardSkeleton />
          <TableSkeleton rows={5} />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full">
          <ErrorMessage message="تعذر تحميل بيانات المطعم، الرجاء المحاولة مرة أخرى" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">الطلبات</h1>
          <p className="text-slate-600">إدارة جميع طلبات المطعم</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">الحالة</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value as OrderWithDetails['status'] | 'all',
                  })
                }
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
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
                  setFilters({
                    ...filters,
                    orderType: e.target.value as OrderWithDetails['order_type'] | 'all',
                  })
                }
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
              >
                <option value="all">الكل</option>
                <option value="dine_in">طلب داخلي</option>
                <option value="delivery">توصيل</option>
                <option value="pickup">استلام</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">من تاريخ</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">إلى تاريخ</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">رقم الطلب</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">التاريخ والوقت</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">النوع</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">عدد العناصر</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">المجموع</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600">لا توجد طلبات</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">#{order.order_number}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{getOrderTypeLabel(order.order_type)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{order.items.length}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{order.total.toLocaleString()} ر.س</td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => navigate(`/dashboard`)}
                          variant="primary"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                          عرض التفاصيل
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">لا توجد طلبات</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/dashboard`)}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-slate-900">#{order.order_number}</span>
                  <OrderStatusBadge status={order.status} size="sm" />
                </div>
                <div className="space-y-2 text-sm text-slate-600 mb-3">
                  <div className="flex items-center justify-between">
                    <span>النوع:</span>
                    <span className="font-medium">{getOrderTypeLabel(order.order_type)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>التاريخ:</span>
                    <span className="font-medium">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>عدد العناصر:</span>
                    <span className="font-medium">{order.items.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>المجموع:</span>
                    <span className="font-bold text-slate-900">{order.total.toLocaleString()} ر.س</span>
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard`);
                  }}
                  fullWidth
                  variant="primary"
                  size="sm"
                >
                  <Eye className="w-4 h-4" />
                  عرض التفاصيل
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

