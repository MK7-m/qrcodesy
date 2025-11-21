-- Add extra_fees JSONB column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS extra_fees jsonb DEFAULT '[]'::jsonb;

-- Create order_fees table
CREATE TABLE IF NOT EXISTS order_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on order_fees
ALTER TABLE order_fees ENABLE ROW LEVEL SECURITY;

-- Policy: Restaurant owners can view order fees for their orders
CREATE POLICY "Restaurant owners can view own order fees"
  ON order_fees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN restaurants ON restaurants.id = orders.restaurant_id
      WHERE orders.id = order_fees.order_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Policy: Customers can insert order fees when creating orders
CREATE POLICY "Customers can create order fees"
  ON order_fees FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Public can view order fees for recent orders (within 1 hour)
CREATE POLICY "Public can view recent order fees"
  ON order_fees FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_fees.order_id
      AND orders.created_at > now() - interval '1 hour'
    )
  );

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_order_fees_order ON order_fees(order_id);

