import { Clock, CheckCircle, ChefHat, Package, XCircle } from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'canceled';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'قيد الانتظار',
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
          icon: <Clock className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
        };
      case 'confirmed':
        return {
          label: 'تم التأكيد',
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: <CheckCircle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
        };
      case 'preparing':
        return {
          label: 'قيد التحضير',
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          icon: <ChefHat className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
        };
      case 'ready':
        return {
          label: 'جاهز',
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-200',
          icon: <Package className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
        };
      case 'completed':
        return {
          label: 'مكتمل',
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: <CheckCircle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
        };
      case 'canceled':
        return {
          label: 'ملغى',
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: <XCircle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

