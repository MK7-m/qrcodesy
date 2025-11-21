import React from "react";
import { Home, ShoppingCart } from "lucide-react";
import type { CartItem } from "../types/cart";
import type { DeliveryMode } from "./RestaurantHero";
import { formatPrice } from "../types/formatPrice";

interface StickyFooterProps {
  cart: CartItem[];
  mode: DeliveryMode;
  cartTotal: number;
  deliveryFee: number;
  onOpenCart: () => void;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({
  cart,
  mode,
  cartTotal,
  deliveryFee,
  onOpenCart,
}) => {
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total =
    cartTotal + (mode === "delivery" ? deliveryFee : 0);

  return (
    <div className="sticky-footer">
      <div className="sticky-footer-inner">
        {/* Home button */}
        <button type="button" className="sticky-footer-home-btn">
          <Home size={16} />
          <span>القائمة</span>
        </button>

        {/* Cart button */}
        <button
          type="button"
          className="sticky-footer-cart-btn"
          onClick={onOpenCart}
        >
          <div className="sticky-footer-cart-left">
            <div className="sticky-footer-cart-icon">
              <ShoppingCart size={16} />
              {itemsCount > 0 && (
                <span className="sticky-footer-cart-badge">
                  {itemsCount}
                </span>
              )}
            </div>
            <span className="sticky-footer-cart-text">
              {itemsCount === 0
                ? "السلة فارغة"
                : `السلة (${itemsCount} منتج)`}
            </span>
          </div>

          <div className="sticky-footer-cart-right">
            <span className="sticky-footer-cart-label">
              {mode === "delivery" ? "المجموع مع التوصيل" : "المجموع"}
            </span>
            <span className="sticky-footer-cart-total">
              {formatPrice(total)}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
