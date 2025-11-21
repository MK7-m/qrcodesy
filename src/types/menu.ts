export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface MenuProduct {
  id: string;
  category_id: string;
  name: string;
  price: number;
  image_url?: string | null;
  description?: string | null;
  created_at: string;
   is_available?: boolean;
}
