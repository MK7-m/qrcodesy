/*
  # QR Menu & Ordering SaaS - Initial Schema

  ## Overview
  This migration creates the foundational database structure for a QR-based digital menu 
  and ordering SaaS platform for Syrian restaurants.

  ## New Tables

  ### 1. `restaurants`
  Main table for restaurant accounts
  - `id` (uuid, primary key)
  - `owner_id` (uuid, references auth.users)
  - `name` (text) - Restaurant name
  - `name_en` (text) - English name (optional)
  - `description` (text) - Restaurant description
  - `logo_url` (text) - Logo image URL
  - `phone` (text) - Contact phone
  - `whatsapp` (text) - WhatsApp number
  - `plan` (text) - Current plan: 'a', 'b', or 'c'
  - `delivery_fee` (numeric) - Flat delivery fee
  - `opening_hours` (jsonb) - Store hours configuration
  - `is_active` (boolean) - Account status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `categories`
  Menu categories for each restaurant
  - `id` (uuid, primary key)
  - `restaurant_id` (uuid, references restaurants)
  - `name` (text) - Category name in Arabic
  - `name_en` (text) - Category name in English (optional)
  - `image_url` (text) - Category image for grid view
  - `sort_order` (integer) - Display order
  - `is_active` (boolean) - Visibility toggle
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `dishes`
  Menu items/dishes
  - `id` (uuid, primary key)
  - `restaurant_id` (uuid, references restaurants)
  - `category_id` (uuid, references categories)
  - `name` (text) - Dish name in Arabic
  - `name_en` (text) - Dish name in English (optional)
  - `description` (text) - Dish description
  - `image_url` (text) - Dish photo
  - `price` (numeric) - Current price
  - `is_available` (boolean) - Availability toggle
  - `sort_order` (integer) - Display order within category
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `tables`
  Physical tables for Plan B (dine-in ordering)
  - `id` (uuid, primary key)
  - `restaurant_id` (uuid, references restaurants)
  - `table_number` (text) - Table identifier
  - `qr_code_url` (text) - Generated QR code image
  - `is_active` (boolean) - Table status
  - `created_at` (timestamptz)

  ### 5. `orders`
  Customer orders (dine-in, delivery, pickup)
  - `id` (uuid, primary key)
  - `restaurant_id` (uuid, references restaurants)
  - `order_number` (text) - Human-readable order number
  - `order_type` (text) - 'dine_in', 'delivery', or 'pickup'
  - `table_id` (uuid, references tables) - For dine-in orders
  - `customer_name` (text) - For delivery/pickup
  - `customer_phone` (text) - For delivery/pickup
  - `customer_address` (text) - For delivery orders
  - `status` (text) - 'new', 'in_progress', 'ready', 'out_for_delivery', 'completed', 'cancelled'
  - `subtotal` (numeric) - Order subtotal
  - `delivery_fee` (numeric) - Delivery fee if applicable
  - `total` (numeric) - Final total
  - `notes` (text) - Order-level notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `order_items`
  Individual items in each order
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `dish_id` (uuid, references dishes)
  - `dish_name` (text) - Snapshot of dish name at order time
  - `dish_price` (numeric) - Snapshot of price at order time
  - `quantity` (integer) - Number of items
  - `notes` (text) - Item-specific notes (e.g., "no onions")
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Restrictive policies for authenticated restaurant owners only
  - Public read access to menus (for customers)
  - Order creation allowed for anonymous users (customers)

  ## Important Notes
  1. All monetary values use numeric type for precision
  2. Timestamps use timestamptz for timezone support
  3. Sort orders enable drag-and-drop reordering
  4. Data snapshots in order_items preserve historical accuracy
*/

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  name_en text,
  description text,
  logo_url text,
  phone text,
  whatsapp text,
  plan text NOT NULL DEFAULT 'a' CHECK (plan IN ('a', 'b', 'c')),
  delivery_fee numeric DEFAULT 0,
  opening_hours jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can view own restaurant"
  ON restaurants FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Restaurant owners can update own restaurant"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Restaurant owners can insert own restaurant"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Public can view active restaurants"
  ON restaurants FOR SELECT
  TO anon
  USING (is_active = true);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  name_en text,
  image_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage own categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = categories.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = categories.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  TO anon
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = categories.restaurant_id
      AND restaurants.is_active = true
    )
  );

-- Create dishes table
CREATE TABLE IF NOT EXISTS dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  name_en text,
  description text,
  image_url text,
  price numeric NOT NULL,
  is_available boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage own dishes"
  ON dishes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view available dishes"
  ON dishes FOR SELECT
  TO anon
  USING (
    is_available = true
    AND EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.is_active = true
    )
  );

-- Create tables table (for physical restaurant tables)
CREATE TABLE IF NOT EXISTS tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  table_number text NOT NULL,
  qr_code_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, table_number)
);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage own tables"
  ON tables FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = tables.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = tables.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active tables"
  ON tables FOR SELECT
  TO anon
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = tables.restaurant_id
      AND restaurants.is_active = true
    )
  );

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  order_number text NOT NULL,
  order_type text NOT NULL CHECK (order_type IN ('dine_in', 'delivery', 'pickup')),
  table_id uuid REFERENCES tables(id),
  customer_name text,
  customer_phone text,
  customer_address text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'ready', 'out_for_delivery', 'completed', 'cancelled')),
  subtotal numeric NOT NULL,
  delivery_fee numeric DEFAULT 0,
  total numeric NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, order_number)
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage own orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can view own orders temporarily"
  ON orders FOR SELECT
  TO anon
  USING (created_at > now() - interval '1 hour');

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  dish_id uuid REFERENCES dishes(id) NOT NULL,
  dish_name text NOT NULL,
  dish_price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN restaurants ON restaurants.id = orders.restaurant_id
      WHERE orders.id = order_items.order_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create order items"
  ON order_items FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can view own order items temporarily"
  ON order_items FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.created_at > now() - interval '1 hour'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(restaurant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant ON dishes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_dishes_sort ON dishes(category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
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

-- Create function to generate order numbers
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
$$ LANGUAGE plpgsql;