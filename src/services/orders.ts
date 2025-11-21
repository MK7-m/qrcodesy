import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import type { Restaurant } from '../types/restaurant';
import { calculateOrderTotals } from '../utils/orderCalculations';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type OrderFee = Database['public']['Tables']['order_fees']['Row'];

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  fees: OrderFee[];
  table_number?: string;
}

export interface OrderTotalsUpdate {
  subtotal: number;
  deliveryFee: number;
  total: number;
  fees: Array<{ label: string; amount: number }>;
}

/**
 * Fetch all orders for a restaurant
 */
type OrderStatus = Order['status'];
type OrderType = Order['order_type'];

export async function getRestaurantOrders(
  restaurantId: string,
  filters?: {
    status?: OrderStatus | 'all';
    orderType?: OrderType | 'all';
    startDate?: string;
    endDate?: string;
  }
): Promise<OrderWithDetails[]> {
  let query = supabase
    .from('orders')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.orderType && filters.orderType !== 'all') {
    query = query.eq('order_type', filters.orderType);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  // Fetch items and fees for each order
  const ordersWithDetails = await Promise.all(
    (orders || []).map(async (order) => {
      const [itemsResult, feesResult, tableResult] = await Promise.all([
        supabase.from('order_items').select('*').eq('order_id', order.id),
        supabase.from('order_fees').select('*').eq('order_id', order.id),
        order.table_id
          ? supabase.from('tables').select('table_number').eq('id', order.table_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      return {
        ...order,
        items: itemsResult.data || [],
        fees: feesResult.data || [],
        table_number: tableResult.data?.table_number,
      };
    })
  );

  return ordersWithDetails;
}

/**
 * Fetch a single order with all details
 */
export async function getOrderById(orderId: string): Promise<OrderWithDetails | null> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    console.error('Error fetching order:', error);
    return null;
  }

  const [itemsResult, feesResult, tableResult] = await Promise.all([
    supabase.from('order_items').select('*').eq('order_id', order.id),
    supabase.from('order_fees').select('*').eq('order_id', order.id),
    order.table_id
      ? supabase.from('tables').select('table_number').eq('id', order.table_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  return {
    ...order,
    items: itemsResult.data || [],
    fees: feesResult.data || [],
    table_number: tableResult.data?.table_number,
  };
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<boolean> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    return false;
  }

  return true;
}

/**
 * Update order item quantity
 */
export async function updateOrderItemQuantity(
  itemId: string,
  quantity: number
): Promise<boolean> {
  if (quantity <= 0) {
    // Delete item if quantity is 0 or less
    const { error } = await supabase.from('order_items').delete().eq('id', itemId);
    return !error;
  }

  const { error } = await supabase
    .from('order_items')
    .update({ quantity })
    .eq('id', itemId);

  if (error) {
    console.error('Error updating order item:', error);
    return false;
  }

  return true;
}

/**
 * Update order item notes
 */
export async function updateOrderItemNotes(itemId: string, notes: string): Promise<boolean> {
  const { error } = await supabase
    .from('order_items')
    .update({ notes: notes || null })
    .eq('id', itemId);

  if (error) {
    console.error('Error updating order item notes:', error);
    return false;
  }

  return true;
}

/**
 * Delete order item
 */
export async function deleteOrderItem(itemId: string): Promise<boolean> {
  const { error } = await supabase.from('order_items').delete().eq('id', itemId);

  if (error) {
    console.error('Error deleting order item:', error);
    return false;
  }

  return true;
}

/**
 * Recalculate order totals and update order + order_fees
 */
export async function recalculateOrderTotals(
  orderId: string,
  restaurant: Restaurant
): Promise<boolean> {
  // Get current order items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (itemsError || !items) {
    console.error('Error fetching order items:', itemsError);
    return false;
  }

  // Get order to determine delivery fee
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('order_type')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.error('Error fetching order:', orderError);
    return false;
  }

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + Number(item.dish_price) * item.quantity, 0);

  // Calculate delivery fee
  const deliveryFee = order.order_type === 'delivery' ? restaurant.delivery_fee : 0;

  // Calculate totals with extra fees
  const totals = calculateOrderTotals(subtotal, restaurant.extra_fees, deliveryFee);

  // Update order
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      subtotal: totals.subtotal,
      delivery_fee: totals.deliveryFee,
      total: totals.total,
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('Error updating order totals:', updateError);
    return false;
  }

  // Delete existing order_fees
  await supabase.from('order_fees').delete().eq('order_id', orderId);

  // Insert new order_fees
  if (totals.extraFees.length > 0) {
    const orderFees = totals.extraFees.map((fee) => ({
      order_id: orderId,
      label: fee.label,
      amount: fee.amount,
    }));

    const { error: feesError } = await supabase.from('order_fees').insert(orderFees);
    if (feesError) {
      console.error('Error inserting order fees:', feesError);
      return false;
    }
  }

  return true;
}

/**
 * Update order notes
 */
export async function updateOrderNotes(orderId: string, notes: string): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({ notes: notes || null })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order notes:', error);
    return false;
  }

  return true;
}

