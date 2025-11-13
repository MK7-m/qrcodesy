/*
  # Fix Security and Performance Issues

  ## Changes

  ### 1. Add Missing Foreign Key Indexes
  - Add index on `order_items.dish_id`
  - Add index on `orders.table_id`
  - Add index on `restaurants.owner_id`

  ### 2. Optimize RLS Policies
  - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
  - This prevents re-evaluation of auth functions for each row

  ### 3. Fix Function Search Path
  - Set explicit search_path for functions to prevent security issues

  ## Security Impact
  - Improved query performance with proper indexing
  - Optimized RLS policy evaluation
  - Secured function search paths
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_order_items_dish ON order_items(dish_id);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);

-- Drop existing RLS policies for restaurants
DROP POLICY IF EXISTS "Restaurant owners can view own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can update own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can insert own restaurant" ON restaurants;

-- Recreate restaurants policies with optimized auth.uid() calls
CREATE POLICY "Restaurant owners can view own restaurant"
  ON restaurants FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = owner_id);

CREATE POLICY "Restaurant owners can update own restaurant"
  ON restaurants FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = owner_id)
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Restaurant owners can insert own restaurant"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = owner_id);

-- Drop and recreate categories policies
DROP POLICY IF EXISTS "Restaurant owners can manage own categories" ON categories;

CREATE POLICY "Restaurant owners can manage own categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = categories.restaurant_id
      AND restaurants.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = categories.restaurant_id
      AND restaurants.owner_id = (select auth.uid())
    )
  );

-- Drop and recreate dishes policies
DROP POLICY IF EXISTS "Restaurant owners can manage own dishes" ON dishes;

CREATE POLICY "Restaurant owners can manage own dishes"
  ON dishes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.owner_id = (select auth.uid())
    )
  );

-- Drop and recreate tables policies
DROP POLICY IF EXISTS "Restaurant owners can manage own tables" ON tables;

CREATE POLICY "Restaurant owners can manage own tables"
  ON tables FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = tables.restaurant_id
      AND restaurants.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = tables.restaurant_id
      AND restaurants.owner_id = (select auth.uid())
    )
  );

-- Drop and recreate orders policies
DROP POLICY IF EXISTS "Restaurant owners can manage own orders" ON orders;

CREATE POLICY "Restaurant owners can manage own orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.owner_id = (select auth.uid())
    )
  );

-- Drop and recreate order_items policies
DROP POLICY IF EXISTS "Restaurant owners can view own order items" ON order_items;

CREATE POLICY "Restaurant owners can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN restaurants ON restaurants.id = orders.restaurant_id
      WHERE orders.id = order_items.order_id
      AND restaurants.owner_id = (select auth.uid())
    )
  );

-- Fix function search paths by dropping triggers first, then functions, then recreating
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_dishes_updated_at ON dishes;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS generate_order_number(uuid);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION generate_order_number(rest_id uuid)
RETURNS text AS $$
DECLARE
  today_date text;
  order_count integer;
  order_num text;
BEGIN
  today_date := to_char(current_date, 'YYYYMMDD');
  
  SELECT COUNT(*) INTO order_count
  FROM orders
  WHERE restaurant_id = rest_id
  AND created_at >= current_date;
  
  order_num := today_date || '-' || LPAD((order_count + 1)::text, 4, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Recreate triggers
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();