-- Quick verification script to check if dummy data exists
-- Run this in Supabase SQL Editor to verify data was created

-- Check restaurant
SELECT 
  'Restaurant' as check_type,
  CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
  COUNT(*) as count
FROM restaurants 
WHERE id = 'b37946ab-98cd-435e-b264-91aa0ab5d3f2'

UNION ALL

-- Check categories
SELECT 
  'Categories' as check_type,
  CASE WHEN COUNT(*) >= 6 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
  COUNT(*) as count
FROM categories 
WHERE restaurant_id = 'b37946ab-98cd-435e-b264-91aa0ab5d3f2'

UNION ALL

-- Check dishes
SELECT 
  'Dishes' as check_type,
  CASE WHEN COUNT(*) >= 20 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
  COUNT(*) as count
FROM dishes d
JOIN categories c ON c.id = d.category_id
WHERE c.restaurant_id = 'b37946ab-98cd-435e-b264-91aa0ab5d3f2'

UNION ALL

-- Check tables
SELECT 
  'Tables' as check_type,
  CASE WHEN COUNT(*) >= 8 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
  COUNT(*) as count
FROM tables 
WHERE restaurant_id = 'b37946ab-98cd-435e-b264-91aa0ab5d3f2'

UNION ALL

-- Check orders
SELECT 
  'Orders' as check_type,
  CASE WHEN COUNT(*) >= 5 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
  COUNT(*) as count
FROM orders 
WHERE restaurant_id = 'b37946ab-98cd-435e-b264-91aa0ab5d3f2'

UNION ALL

-- Check order items
SELECT 
  'Order Items' as check_type,
  CASE WHEN COUNT(*) >= 10 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
  COUNT(*) as count
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.restaurant_id = 'b37946ab-98cd-435e-b264-91aa0ab5d3f2'

UNION ALL

-- Check order fees
SELECT 
  'Order Fees' as check_type,
  CASE WHEN COUNT(*) >= 10 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
  COUNT(*) as count
FROM order_fees of
JOIN orders o ON o.id = of.order_id
WHERE o.restaurant_id = 'b37946ab-98cd-435e-b264-91aa0ab5d3f2';

-- Detailed restaurant info
SELECT 
  id,
  name,
  owner_id,
  plan,
  delivery_fee,
  extra_fees,
  cover_images,
  is_active
FROM restaurants 
WHERE id = 'b37946ab-98cd-435e-b264-91aa0ab5d3f2';

