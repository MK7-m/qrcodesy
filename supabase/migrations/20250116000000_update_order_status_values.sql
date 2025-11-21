-- Update order status values to match new requirements
-- Map existing statuses to new ones
UPDATE orders SET status = 'pending' WHERE status = 'new';
UPDATE orders SET status = 'preparing' WHERE status = 'in_progress';
UPDATE orders SET status = 'canceled' WHERE status = 'cancelled';

-- Drop the old check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new check constraint with updated status values
ALTER TABLE orders 
  ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'canceled'));

-- Set default to 'pending'
ALTER TABLE orders 
  ALTER COLUMN status SET DEFAULT 'pending';

