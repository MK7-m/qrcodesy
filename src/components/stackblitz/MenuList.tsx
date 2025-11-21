import React from "react";
import { CATEGORIES } from "../data/categories";
import { PRODUCTS } from "../data/products";
import type { Product } from "../data/products";
import type { CartItem } from "../types/cart";
import { ProductCard } from "./ProductCard";

interface MenuListProps {
  activeCategoryId: string;
  onCategoryInView: (id: string) => void; // kept for future use
  cart: CartItem[];
  onAdd: (product: Product) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

export const MenuList: React.FC<MenuListProps> = ({
  activeCategoryId,
  onCategoryInView, // not used yet
  cart,
  onAdd,
  onUpdateQuantity,
}) => {
  const getQuantity = (productId: string) => {
    const item = cart.find((it) => it.id === productId);
    return item?.quantity || 0;
  };

  return (
    <div className="menu-list">
      {CATEGORIES.map((cat) => {
        const items = PRODUCTS.filter((p) => p.categoryId === cat.id);
        if (!items.length) return null;

        const isActive = activeCategoryId === cat.id;

        return (
          <section
            key={cat.id}
            id={`cat-${cat.id}`}
            className="category-section scroll-mt-28"
          >
            {/* Section header */}
            <div className="category-section-title">
              <span
                className={
                  "category-section-chip" +
                  (isActive ? " category-section-chip--active" : "")
                }
              >
                {cat.name}
              </span>
            </div>

            {/* Products */}
            <div className="category-section-grid">
              {items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={getQuantity(product.id)}
                  onAdd={() => onAdd(product)}
                  onUpdateQuantity={onUpdateQuantity}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
