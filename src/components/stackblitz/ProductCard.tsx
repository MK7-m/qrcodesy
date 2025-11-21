import React from 'react';
import type { Product } from '../data/products';
import { formatPrice } from '../types/formatPrice';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onAdd,
  onUpdateQuantity,
}) => {
  return (
    <article className="group flex overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      {/* Square image – same width/height on all devices */}
      <div className="relative h-28 w-28 shrink-0 md:h-32 md:w-32">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        {product.badge && (
          <div className="best-seller-badge">{product.badge}</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-3 pr-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">
            {product.name}
          </h3>
          {product.description && (
            <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-600">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-amber-700">
            {formatPrice(product.price)}
          </span>

          {quantity === 0 ? (
            <button type="button" onClick={onAdd} className="add-to-cart-btn">
              + أضف إلى السلة
            </button>
          ) : (
            <div className="qty-control">
              <button
                type="button"
                className="qty-btn"
                onClick={() => onUpdateQuantity(product.id, -1)}
              >
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                type="button"
                className="qty-btn qty-btn-plus"
                onClick={() => onUpdateQuantity(product.id, 1)}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
