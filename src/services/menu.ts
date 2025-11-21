import { supabase } from '../lib/supabase';
import type { MenuCategory, MenuProduct } from '../types/menu';
import type { Database } from '../lib/database.types';
import { DEMO_MENU_CATEGORIES, DEMO_MENU_PRODUCTS, DEMO_RESTAURANT_ID } from '../data/demoMenu';

type MenuCategoryInsert = Database['public']['Tables']['menu_categories']['Insert'];
type MenuCategoryUpdate = Database['public']['Tables']['menu_categories']['Update'];
type MenuProductInsert = Database['public']['Tables']['menu_products']['Insert'];
type MenuProductUpdate = Database['public']['Tables']['menu_products']['Update'];

// Categories
export async function getCategories(restaurantId: string): Promise<MenuCategory[]> {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    if (restaurantId === DEMO_RESTAURANT_ID) {
      return DEMO_MENU_CATEGORIES;
    }
    return [];
  }

  if (!data || data.length === 0) {
    if (restaurantId === DEMO_RESTAURANT_ID) {
      return DEMO_MENU_CATEGORIES;
    }
    return [];
  }

  return data as MenuCategory[];
}

export async function createCategory(payload: MenuCategoryInsert): Promise<MenuCategory | null> {
  const { data, error } = await supabase.from('menu_categories').insert(payload).select().single();
  if (error) {
    console.error('Error creating category:', error);
    return null;
  }
  return data as MenuCategory;
}

export async function updateCategory(id: string, payload: MenuCategoryUpdate): Promise<boolean> {
  const { error } = await supabase.from('menu_categories').update(payload).eq('id', id);
  if (error) {
    console.error('Error updating category:', error);
    return false;
  }
  return true;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase.from('menu_categories').delete().eq('id', id);
  if (error) {
    console.error('Error deleting category:', error);
    return false;
  }
  return true;
}

// Products
export async function getProductsByCategory(categoryId: string): Promise<MenuProduct[]> {
  const { data, error } = await supabase
    .from('menu_products')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return DEMO_MENU_PRODUCTS[categoryId] || [];
  }

  if (!data || data.length === 0) {
    return DEMO_MENU_PRODUCTS[categoryId] || [];
  }

  return data as MenuProduct[];
}

export async function createProduct(payload: MenuProductInsert): Promise<MenuProduct | null> {
  const { data, error } = await supabase.from('menu_products').insert(payload).select().single();
  if (error) {
    console.error('Error creating product:', error);
    return null;
  }
  return data as MenuProduct;
}

export async function updateProduct(id: string, payload: MenuProductUpdate): Promise<boolean> {
  const { error } = await supabase.from('menu_products').update(payload).eq('id', id);
  if (error) {
    console.error('Error updating product:', error);
    return false;
  }
  return true;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase.from('menu_products').delete().eq('id', id);
  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }
  return true;
}
