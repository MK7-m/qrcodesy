import React from 'react';
import { ShoppingCart, X } from 'lucide-react';
import type { CartItem } from '../types/cart';
import { formatPrice } from '../types/formatPrice';

export type OrderMode = 'dine-in' | 'delivery' | 'pickup';

interface CartSheetProps {
  cart: CartItem[];
  mode: OrderMode;
  cartTotal: number;
  deliveryFee: number;
  orderTotal: number;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onUpdateItemNote: (id: string, note: string) => void;
  onCheckout: () => void;
  onModeChange: (mode: OrderMode) => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({
  cart,
  mode,
  cartTotal,
  deliveryFee,
  orderTotal,
  onClose,
  onUpdateQuantity,
  onUpdateItemNote,
  onCheckout,
  onModeChange,
}) => {
  const hasItems = cart.length > 0;

  const orderModes: { value: OrderMode; label: string }[] = [
    { value: 'dine-in', label: 'طلب داخلي' },
    { value: 'delivery', label: 'توصيل' },
    { value: 'pickup', label: 'استلام' },
  ];

  return (
    <>
      {/* Gray overlay behind the sheet */}
      <div className="modal-overlay-below-header" onClick={onClose} />


      {/* Sheet container */}
      <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
        <div className="w-full max-w-md rounded-t-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-black/25 md:rounded-3xl flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  سلة الطلب
                </h3>
                <p className="text-[11px] text-slate-500">
                  السلة جاهزة – اختر طريقة الطلب ثم تابع
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Order mode */}
          <div className="mb-3" dir="rtl">
            <p className="mb-1 text-center text-[11px] text-slate-500">
              طريقة الطلب
            </p>
            <div className="cart-order-mode-toggle-wrapper">
              <div className="cart-order-mode-toggle">
                {orderModes.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onModeChange(opt.value)}
                    className={
                      'cart-order-mode-option ' +
                      (mode === opt.value
                        ? 'cart-order-mode-option--active'
                        : '')
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items */}
          <div
            className="cart-items-scroll flex-1 min-h-0 space-y-2 overflow-y-auto pr-1"
            dir="rtl"
          >
            {!hasItems && (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                لا يوجد أي عناصر في السلة حاليًا.
              </div>
            )}

            {cart.map((item) => (
              <div
                key={item.id}
                className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="cart-item-header">
                  {/* text + price (RTL block) */}
                  <div className="cart-item-text">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-price">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  {/* qty controls – same style as main screen */}
                  <div className="qty-control" dir="ltr">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn qty-btn-plus"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <textarea
                  rows={1}
                  placeholder="ملاحظات على هذا الطبق (اختياري)"
                  className="cart-note-input"
                  value={item.note ?? ''}
                  onChange={(e) => onUpdateItemNote(item.id, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Summary + CTA */}
          <div className="mt-3 border-t border-slate-200 pt-3" dir="rtl">
            <div className="space-y-1 text-[11px] text-slate-700">
              <div className="flex items-center justify-between">
                <span>المجموع الفرعي</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>أجرة التوصيل</span>
                <span>
                  {mode === 'delivery' ? formatPrice(deliveryFee) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>الإجمالي</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onCheckout}
              disabled={!hasItems}
              className={
                'cart-continue-btn ' +
                (!hasItems ? 'cart-continue-btn--disabled' : '')
              }
            >
              متابعة الطلب
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
