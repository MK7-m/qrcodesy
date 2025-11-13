import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Clock, CheckCircle, XCircle, Truck, ChefHat, Package } from 'lucide-react';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

interface OrderWithItems extends Order {
  items: OrderItem[];
  table_number?: string;
}

interface OrderManagementProps {
  restaurant: Restaurant;
}

export function OrderManagement({ restaurant }: OrderManagementProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();

    const subscription = supabase
      .channel('orders_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurant.id}` }, () => {
        loadOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [restaurant.id]);

  const loadOrders = async () => {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error loading orders:', ordersError);
      setLoading(false);
      return;
    }

    const ordersWithItems = await Promise.all(
      (ordersData || []).map(async (order) => {
        const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', order.id);

        let table_number;
        if (order.table_id) {
          const { data: tableData } = await supabase.from('tables').select('table_number').eq('id', order.table_id).maybeSingle();
          table_number = tableData?.table_number;
        }

        return {
          ...order,
          items: itemsData || [],
          table_number,
        };
      })
    );

    setOrders(ordersWithItems);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);

    if (error) {
      alert('حدث خطأ في تحديث حالة الطلب');
      return;
    }

    loadOrders();
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return order.status !== 'completed' && order.status !== 'cancelled';
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="النشطة" count={orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length} />
        <FilterButton active={filter === 'new'} onClick={() => setFilter('new')} label="جديدة" count={orders.filter((o) => o.status === 'new').length} />
        <FilterButton active={filter === 'in_progress'} onClick={() => setFilter('in_progress')} label="قيد التحضير" count={orders.filter((o) => o.status === 'in_progress').length} />
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد طلبات</h3>
          <p className="text-slate-600">سيظهر الطلبات الجديدة هنا</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
        active ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
      }`}
    >
      {label} ({count})
    </button>
  );
}

function OrderCard({ order, onUpdateStatus }: { order: OrderWithItems; onUpdateStatus: (orderId: string, status: Order['status']) => void }) {
  const getStatusColor = () => {
    switch (order.status) {
      case 'new':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'ready':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = () => {
    switch (order.status) {
      case 'new':
        return 'طلب جديد';
      case 'in_progress':
        return 'قيد التحضير';
      case 'ready':
        return 'جاهز';
      case 'out_for_delivery':
        return 'في الطريق';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return order.status;
    }
  };

  const getStatusIcon = () => {
    switch (order.status) {
      case 'new':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <ChefHat className="w-4 h-4" />;
      case 'ready':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'out_for_delivery':
        return <Truck className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getOrderTypeLabel = () => {
    if (order.order_type === 'dine_in') return 'طلب من الطاولة';
    if (order.order_type === 'delivery') return 'توصيل';
    if (order.order_type === 'pickup') return 'استلام';
    return order.order_type;
  };

  const timeAgo = () => {
    const diff = Date.now() - new Date(order.created_at).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    return `منذ ${hours} ساعة`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-slate-900">#{order.order_number}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()} flex items-center gap-1`}>
              {getStatusIcon()}
              {getStatusLabel()}
            </span>
          </div>
          <span className="text-sm text-slate-600">{timeAgo()}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="font-medium">{getOrderTypeLabel()}</span>
          {order.table_number && <span className="font-medium">الطاولة: {order.table_number}</span>}
        </div>
      </div>

      <div className="p-4">
        {order.customer_name && (
          <div className="mb-3 pb-3 border-b border-slate-200">
            <div className="text-sm text-slate-600 mb-1">معلومات العميل</div>
            <div className="font-medium text-slate-900">{order.customer_name}</div>
            {order.customer_phone && <div className="text-sm text-slate-600">{order.customer_phone}</div>}
            {order.customer_address && <div className="text-sm text-slate-600">{order.customer_address}</div>}
          </div>
        )}

        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex-1">
                <span className="font-medium text-slate-900">
                  {item.quantity}x {item.dish_name}
                </span>
                {item.notes && <div className="text-xs text-slate-600 mt-0.5">ملاحظة: {item.notes}</div>}
              </div>
              <span className="font-medium text-slate-900">{(item.dish_price * item.quantity).toLocaleString()} ل.س</span>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs font-medium text-yellow-800 mb-1">ملاحظات الطلب</div>
            <div className="text-sm text-yellow-900">{order.notes}</div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 mb-4">
          <span className="font-semibold text-slate-900">المجموع</span>
          <span className="text-xl font-bold text-orange-600">{order.total.toLocaleString()} ل.س</span>
        </div>

        <div className="flex gap-2">
          {order.status === 'new' && (
            <>
              <button
                onClick={() => onUpdateStatus(order.id, 'in_progress')}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                بدء التحضير
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'cancelled')}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </>
          )}

          {order.status === 'in_progress' && (
            <button
              onClick={() => onUpdateStatus(order.id, order.order_type === 'delivery' ? 'out_for_delivery' : 'ready')}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
            >
              {order.order_type === 'delivery' ? 'جاهز للتوصيل' : 'جاهز'}
            </button>
          )}

          {(order.status === 'ready' || order.status === 'out_for_delivery') && (
            <button
              onClick={() => onUpdateStatus(order.id, 'completed')}
              className="flex-1 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              تم التسليم
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
