import React from "react";
import { CATEGORIES } from "../data/categories";

interface CategoryTabsProps {
  activeCategoryId: string;
  onChange: (id: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategoryId,
  onChange,
}) => {
  return (
    <div className="category-tabs-wrapper sticky top-16 z-30">
      <div className="category-tabs-scroller">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={
                "category-chip" + (isActive ? " category-chip--active" : "")
              }
              onClick={() => {
                onChange(cat.id);
                const element = document.getElementById(`cat-${cat.id}`);
                if (element) {
                  const y =
                    element.getBoundingClientRect().top +
                    window.scrollY -
                    140;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
