-- ============================================
-- DUMMY DATA SETUP SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Get your user ID (replace this with your actual user ID from Supabase Auth)
-- You can find it in: Dashboard > Authentication > Users
-- Or use: SELECT auth.uid() as user_id;

-- For now, we'll use a variable approach - REPLACE THIS WITH YOUR USER ID
DO $$
DECLARE
  v_user_id uuid;
  v_rest_id uuid := 'b37946ab-98cd-435e-b264-91aa0ab5d3f2'::uuid;
  v_cat_appetizers uuid;
  v_cat_soups uuid;
  v_cat_main uuid;
  v_cat_grilled uuid;
  v_cat_desserts uuid;
  v_cat_beverages uuid;
  v_dish1 uuid;
  v_dish2 uuid;
  v_dish3 uuid;
  -- Menu categories/products (for customer menu)
  v_menu_cat_chicken uuid;
  v_menu_cat_grills uuid;
  v_menu_cat_sandwiches uuid;
  v_menu_cat_appetizers uuid;
  v_menu_cat_desserts uuid;
  v_menu_cat_beverages uuid;
  v_table1 uuid;
  v_order1 uuid;
  v_order2 uuid;
  v_order3 uuid;
BEGIN
  -- Try to get user ID from auth.uid() first (if running as authenticated user)
  -- Otherwise get the first user from auth.users
  BEGIN
    SELECT auth.uid() INTO v_user_id;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- If auth.uid() didn't work, get first user
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users ORDER BY created_at LIMIT 1;
  END IF;
  
  -- If still no user found, you'll need to manually set it:
  -- v_user_id := 'YOUR_USER_ID_HERE'::uuid;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Please set v_user_id manually in the script or ensure you have at least one user in auth.users.';
  END IF;

  RAISE NOTICE 'Using user ID: %', v_user_id;

  -- ============================================
  -- CREATE RESTAURANT
  -- ============================================
  INSERT INTO restaurants (
    id, owner_id, name, name_en, description, logo_url, cover_image_url,
    phone, whatsapp, plan, delivery_fee, extra_fees, opening_hours,
    is_active, cuisine_summary, phone_number, whatsapp_number,
    city, area, address_landmark, short_description, long_description,
    cover_images
  ) VALUES (
    v_rest_id, 
    v_user_id, 
    'مطعم التجربة', 
    'Experience Restaurant',
    'أشهى المأكولات السورية',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    '0938123456', 
    '0938123456', 
    'c', 
    5000,
    '[{"label": "رسوم تغليف", "percentage": 5}, {"label": "خدمة", "percentage": 3}]'::jsonb,
    '[
      {"day": "sat", "ranges": [{"from": "10:00", "to": "22:00"}]},
      {"day": "sun", "ranges": [{"from": "10:00", "to": "22:00"}]},
      {"day": "mon", "ranges": [{"from": "10:00", "to": "22:00"}]},
      {"day": "tue", "ranges": [{"from": "10:00", "to": "22:00"}]},
      {"day": "wed", "ranges": [{"from": "10:00", "to": "22:00"}]},
      {"day": "thu", "ranges": [{"from": "10:00", "to": "22:00"}]},
      {"day": "fri", "ranges": [{"from": "12:00", "to": "22:00"}]}
    ]'::jsonb,
    true, 
    'مأكولات سورية تقليدية', 
    '0938123456', 
    '0938123456',
    'دمشق', 
    'المزة', 
    'جانب القصور، مقابل مطعم الشام', 
    'تشكيلة واسعة من الأطباق الشامية الطازجة يومياً.',
    'مطعم التجربة يقدم أشهى المأكولات السورية التقليدية المحضرة بأيدي خبراء الطهي. نستخدم أجود المكونات الطازجة لنقدم لكم تجربة طعام لا تُنسى.',
    '[
      {"url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200", "order": 0},
      {"url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200", "order": 1},
      {"url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200", "order": 2},
      {"url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200", "order": 3}
    ]'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET
    owner_id = EXCLUDED.owner_id,
    name = EXCLUDED.name,
    extra_fees = EXCLUDED.extra_fees,
    cover_images = EXCLUDED.cover_images;

  RAISE NOTICE 'Restaurant created/updated';

  -- ============================================
  -- CREATE CATEGORIES (for admin dashboard)
  -- ============================================
  INSERT INTO categories (restaurant_id, name, name_en, image_url, sort_order, is_active)
  VALUES 
    (v_rest_id, 'وجبات الفروج الكامل', 'Full Chicken Meals', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 1, true),
    (v_rest_id, 'المشاوي الملكية', 'Royal Grills', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 2, true),
    (v_rest_id, 'السندويشات', 'Sandwiches', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 3, true),
    (v_rest_id, 'المقبلات والسلطات', 'Appetizers & Salads', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 4, true),
    (v_rest_id, 'حلويات شرقية', 'Eastern Desserts', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', 5, true),
    (v_rest_id, 'المشروبات', 'Beverages', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 6, true)
  ON CONFLICT DO NOTHING;

  -- Get category IDs (for admin dashboard)
  SELECT id INTO v_cat_appetizers FROM categories WHERE restaurant_id = v_rest_id AND name = 'وجبات الفروج الكامل';
  SELECT id INTO v_cat_soups FROM categories WHERE restaurant_id = v_rest_id AND name = 'المشاوي الملكية';
  SELECT id INTO v_cat_main FROM categories WHERE restaurant_id = v_rest_id AND name = 'السندويشات';
  SELECT id INTO v_cat_grilled FROM categories WHERE restaurant_id = v_rest_id AND name = 'المقبلات والسلطات';
  SELECT id INTO v_cat_desserts FROM categories WHERE restaurant_id = v_rest_id AND name = 'حلويات شرقية';
  SELECT id INTO v_cat_beverages FROM categories WHERE restaurant_id = v_rest_id AND name = 'المشروبات';

  RAISE NOTICE 'Categories created';

  -- ============================================
  -- CREATE DISHES
  -- ============================================
  -- Appetizers
  INSERT INTO dishes (restaurant_id, category_id, name, name_en, description, image_url, price, is_available, sort_order)
  VALUES
    (v_rest_id, v_cat_appetizers, 'حمص بالطحينة', 'Hummus with Tahini', 'حمص طازج مع طحينة وزيت زيتون', 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400', 15000, true, 1),
    (v_rest_id, v_cat_appetizers, 'متبل', 'Moutabal', 'باذنجان مشوي مع طحينة وثوم', 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400', 15000, true, 2),
    (v_rest_id, v_cat_appetizers, 'فتوش', 'Fattoush', 'سلطة خضار طازجة مع خبز محمص', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 20000, true, 3),
    (v_rest_id, v_cat_appetizers, 'تبولة', 'Tabbouleh', 'سلطة برغل مع بقدونس وطماطم', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 18000, true, 4)
  ON CONFLICT DO NOTHING;

  -- Soups
  INSERT INTO dishes (restaurant_id, category_id, name, name_en, description, image_url, price, is_available, sort_order)
  VALUES
    (v_rest_id, v_cat_soups, 'شوربة عدس', 'Lentil Soup', 'شوربة عدس ساخنة مع ليمون', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', 12000, true, 1),
    (v_rest_id, v_cat_soups, 'شوربة خضار', 'Vegetable Soup', 'شوربة خضار طازجة', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', 15000, true, 2),
    (v_rest_id, v_cat_soups, 'شوربة فريكة', 'Freekeh Soup', 'شوربة فريكة مع لحم', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', 20000, true, 3)
  ON CONFLICT DO NOTHING;

  -- Main Dishes
  INSERT INTO dishes (restaurant_id, category_id, name, name_en, description, image_url, price, is_available, sort_order)
  VALUES
    (v_rest_id, v_cat_main, 'كبسة دجاج', 'Chicken Kabsa', 'أرز مع دجاج مشوي وخضار', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 45000, true, 1),
    (v_rest_id, v_cat_main, 'منسف', 'Mansaf', 'لحم مع أرز ولبن', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 55000, true, 2),
    (v_rest_id, v_cat_main, 'مشكل مشاوي', 'Mixed Grill', 'خليط من المشاوي المختلفة', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 65000, true, 3),
    (v_rest_id, v_cat_main, 'كبسة لحم', 'Meat Kabsa', 'أرز مع لحم مشوي', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 50000, true, 4)
  ON CONFLICT DO NOTHING;

  -- Grilled
  INSERT INTO dishes (restaurant_id, category_id, name, name_en, description, image_url, price, is_available, sort_order)
  VALUES
    (v_rest_id, v_cat_grilled, 'كباب حلب', 'Aleppo Kebab', 'كباب لحم مشوي مع خضار', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 50000, true, 1),
    (v_rest_id, v_cat_grilled, 'شيش طاووق', 'Shish Tawook', 'دجاج مشوي مع صلصة خاصة', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 45000, true, 2),
    (v_rest_id, v_cat_grilled, 'كفتة', 'Kofta', 'لحم مفروم مشوي', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 48000, true, 3)
  ON CONFLICT DO NOTHING;

  -- Desserts
  INSERT INTO dishes (restaurant_id, category_id, name, name_en, description, image_url, price, is_available, sort_order)
  VALUES
    (v_rest_id, v_cat_desserts, 'كنافة نابلسية', 'Nabulsi Knafeh', 'كنافة مع جبنة وقطر', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', 25000, true, 1),
    (v_rest_id, v_cat_desserts, 'بسبوسة', 'Basbousa', 'حلوى سميد مع سكر', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', 20000, true, 2),
    (v_rest_id, v_cat_desserts, 'معمول', 'Maamoul', 'حلوى التمر', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', 22000, true, 3)
  ON CONFLICT DO NOTHING;

  -- Beverages
  INSERT INTO dishes (restaurant_id, category_id, name, name_en, description, image_url, price, is_available, sort_order)
  VALUES
    (v_rest_id, v_cat_beverages, 'عصير برتقال', 'Orange Juice', 'عصير برتقال طازج', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 8000, true, 1),
    (v_rest_id, v_cat_beverages, 'شاي', 'Tea', 'شاي ساخن', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 5000, true, 2),
    (v_rest_id, v_cat_beverages, 'قهوة عربية', 'Arabic Coffee', 'قهوة عربية أصيلة', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 10000, true, 3),
    (v_rest_id, v_cat_beverages, 'عصير ليمون', 'Lemonade', 'عصير ليمون طازج', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 7000, true, 4)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Dishes created';

  -- Get some dish IDs for orders
  SELECT id INTO v_dish1 FROM dishes WHERE restaurant_id = v_rest_id AND name = 'وجبة فرج كامل مشوي' LIMIT 1;
  SELECT id INTO v_dish2 FROM dishes WHERE restaurant_id = v_rest_id AND name = 'كباب حلب' LIMIT 1;
  SELECT id INTO v_dish3 FROM dishes WHERE restaurant_id = v_rest_id AND name = 'حمص بالطحينة' LIMIT 1;

  -- ============================================
  -- CREATE MENU_CATEGORIES (for customer menu page)
  -- ============================================
  INSERT INTO menu_categories (restaurant_id, name, sort_order)
  VALUES 
    (v_rest_id, 'وجبات الفروج الكامل', 1),
    (v_rest_id, 'المشاوي الملكية', 2),
    (v_rest_id, 'السندويشات', 3),
    (v_rest_id, 'المقبلات والسلطات', 4),
    (v_rest_id, 'حلويات شرقية', 5),
    (v_rest_id, 'المشروبات', 6)
  ON CONFLICT DO NOTHING;

  -- Get menu category IDs
  SELECT id INTO v_menu_cat_chicken FROM menu_categories WHERE restaurant_id = v_rest_id AND name = 'وجبات الفروج الكامل';
  SELECT id INTO v_menu_cat_grills FROM menu_categories WHERE restaurant_id = v_rest_id AND name = 'المشاوي الملكية';
  SELECT id INTO v_menu_cat_sandwiches FROM menu_categories WHERE restaurant_id = v_rest_id AND name = 'السندويشات';
  SELECT id INTO v_menu_cat_appetizers FROM menu_categories WHERE restaurant_id = v_rest_id AND name = 'المقبلات والسلطات';
  SELECT id INTO v_menu_cat_desserts FROM menu_categories WHERE restaurant_id = v_rest_id AND name = 'حلويات شرقية';
  SELECT id INTO v_menu_cat_beverages FROM menu_categories WHERE restaurant_id = v_rest_id AND name = 'المشروبات';

  RAISE NOTICE 'Menu categories created';

  -- ============================================
  -- CREATE MENU_PRODUCTS (for customer menu page)
  -- ============================================
  -- وجبات الفروج الكامل (Full Chicken Meals)
  INSERT INTO menu_products (category_id, name, price, image_url, description)
  VALUES
    (v_menu_cat_chicken, 'وجبة فرج كامل مشوي', 45000, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 'فرج كامل مشوي مع أرز وخضار'),
    (v_menu_cat_chicken, 'وجبة فرج كامل بالفرن', 50000, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 'فرج كامل محشو ومشوي بالفرن'),
    (v_menu_cat_chicken, 'وجبة فرج كامل مع صينية', 55000, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 'فرج كامل مع صينية بطاطا وخضار')
  ON CONFLICT DO NOTHING;

  -- المشاوي الملكية (Royal Grills)
  INSERT INTO menu_products (category_id, name, price, image_url, description)
  VALUES
    (v_menu_cat_grills, 'كباب تندوري مدخن', 50000, 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 'لحم غنم محلي متبل بخلطة الحجاز ووصفة اللبن المدخن مع خبز الطابون'),
    (v_menu_cat_grills, 'كباب حلب', 50000, 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 'كباب لحم مشوي مع خضار'),
    (v_menu_cat_grills, 'شيش طاووق', 45000, 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 'دجاج مشوي مع صلصة خاصة'),
    (v_menu_cat_grills, 'كفتة', 48000, 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 'لحم مفروم مشوي'),
    (v_menu_cat_grills, 'مشكل مشاوي', 65000, 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 'خليط من المشاوي المختلفة')
  ON CONFLICT DO NOTHING;

  -- السندويشات (Sandwiches)
  INSERT INTO menu_products (category_id, name, price, image_url, description)
  VALUES
    (v_menu_cat_sandwiches, 'سندويش شاورما دجاج', 25000, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 'شاورما دجاج طازجة مع خضار وصلصة'),
    (v_menu_cat_sandwiches, 'سندويش شاورما لحم', 28000, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 'شاورما لحم طازجة مع خضار وصلصة'),
    (v_menu_cat_sandwiches, 'سندويش كباب', 30000, 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 'كباب مشوي مع خضار وصلصة'),
    (v_menu_cat_sandwiches, 'سندويش كفتة', 27000, 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 'كفتة مشوية مع خضار وصلصة')
  ON CONFLICT DO NOTHING;

  -- المقبلات والسلطات (Appetizers & Salads)
  INSERT INTO menu_products (category_id, name, price, image_url, description)
  VALUES
    (v_menu_cat_appetizers, 'حمص بالطحينة', 15000, 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400', 'حمص طازج مع طحينة وزيت زيتون'),
    (v_menu_cat_appetizers, 'متبل', 15000, 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400', 'باذنجان مشوي مع طحينة وثوم'),
    (v_menu_cat_appetizers, 'فتوش', 20000, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 'سلطة خضار طازجة مع خبز محمص'),
    (v_menu_cat_appetizers, 'تبولة', 18000, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 'سلطة برغل مع بقدونس وطماطم'),
    (v_menu_cat_appetizers, 'سلطة جرجير', 16000, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 'سلطة جرجير طازجة مع زيت زيتون')
  ON CONFLICT DO NOTHING;

  -- حلويات شرقية (Eastern Desserts)
  INSERT INTO menu_products (category_id, name, price, image_url, description)
  VALUES
    (v_menu_cat_desserts, 'كنافة نابلسية', 25000, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', 'كنافة مع جبنة وقطر'),
    (v_menu_cat_desserts, 'بسبوسة', 20000, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', 'حلوى سميد مع سكر'),
    (v_menu_cat_desserts, 'معمول', 22000, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', 'حلوى التمر'),
    (v_menu_cat_desserts, 'بقلاوة', 24000, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', 'بقلاوة محشوة بالفستق')
  ON CONFLICT DO NOTHING;

  -- المشروبات (Beverages)
  INSERT INTO menu_products (category_id, name, price, image_url, description)
  VALUES
    (v_menu_cat_beverages, 'عصير برتقال', 8000, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 'عصير برتقال طازج'),
    (v_menu_cat_beverages, 'شاي', 5000, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 'شاي ساخن'),
    (v_menu_cat_beverages, 'قهوة عربية', 10000, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 'قهوة عربية أصيلة'),
    (v_menu_cat_beverages, 'عصير ليمون', 7000, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 'عصير ليمون طازج'),
    (v_menu_cat_beverages, 'عصير جزر', 9000, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 'عصير جزر طازج')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Menu products created';

  -- ============================================
  -- CREATE TABLES (for dine-in)
  -- ============================================
  INSERT INTO tables (restaurant_id, table_number, is_active)
  VALUES
    (v_rest_id, '1', true),
    (v_rest_id, '2', true),
    (v_rest_id, '3', true),
    (v_rest_id, '4', true),
    (v_rest_id, '5', true),
    (v_rest_id, '6', true),
    (v_rest_id, '7', true),
    (v_rest_id, '8', true)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_table1 FROM tables WHERE restaurant_id = v_rest_id AND table_number = '1' LIMIT 1;

  RAISE NOTICE 'Tables created';

  -- ============================================
  -- CREATE SAMPLE ORDERS
  -- ============================================
  
  -- Order 1: Delivery order (pending)
  INSERT INTO orders (
    restaurant_id, order_number, order_type, customer_name, customer_phone,
    customer_address, status, subtotal, delivery_fee, total, notes
  ) VALUES (
    v_rest_id,
    'ORD-' || EXTRACT(EPOCH FROM NOW())::bigint,
    'delivery',
    'أحمد محمد',
    '0938123456',
    'دمشق - المزة - جانب القصور، مقابل مطعم الشام',
    'pending',
    80000, -- subtotal (2x 40000)
    5000,  -- delivery fee
    88900, -- total (80000 + 5000 + 4000 packaging + 2400 service)
    'يرجى الاتصال قبل التوصيل'
  )
  RETURNING id INTO v_order1;

  -- Order items for delivery order
  INSERT INTO order_items (order_id, dish_id, dish_name, dish_price, quantity, notes)
  SELECT v_order1, v_dish1, name, price, 2, 'بدون بصل'
  FROM dishes WHERE id = v_dish1;

  -- Order fees for delivery order
  INSERT INTO order_fees (order_id, label, amount) VALUES
    (v_order1, 'رسوم تغليف', 4000),
    (v_order1, 'خدمة', 2400);

  -- Order 2: Dine-in order (preparing)
  INSERT INTO orders (
    restaurant_id, order_number, order_type, table_id, status,
    subtotal, delivery_fee, total
  ) VALUES (
    v_rest_id,
    'ORD-' || (EXTRACT(EPOCH FROM NOW())::bigint + 1),
    'dine_in',
    v_table1,
    'preparing',
    120000, -- subtotal
    0,      -- no delivery fee for dine-in
    129600  -- total (120000 + 6000 packaging + 3600 service)
  )
  RETURNING id INTO v_order2;

  -- Order items for dine-in order
  INSERT INTO order_items (order_id, dish_id, dish_name, dish_price, quantity)
  SELECT v_order2, v_dish2, name, price, 2
  FROM dishes WHERE id = v_dish2
  UNION ALL
  SELECT v_order2, v_dish3, name, price, 1
  FROM dishes WHERE id = v_dish3;

  -- Order fees for dine-in order
  INSERT INTO order_fees (order_id, label, amount) VALUES
    (v_order2, 'رسوم تغليف', 6000),
    (v_order2, 'خدمة', 3600);

  -- Order 3: Pickup order (ready)
  INSERT INTO orders (
    restaurant_id, order_number, order_type, customer_name, customer_phone,
    status, subtotal, delivery_fee, total
  ) VALUES (
    v_rest_id,
    'ORD-' || (EXTRACT(EPOCH FROM NOW())::bigint + 2),
    'pickup',
    'فاطمة علي',
    '0945123456',
    'ready',
    50000, -- subtotal
    0,     -- no delivery fee for pickup
    54000  -- total (50000 + 2500 packaging + 1500 service)
  )
  RETURNING id INTO v_order3;

  -- Order items for pickup order
  INSERT INTO order_items (order_id, dish_id, dish_name, dish_price, quantity, notes)
  SELECT v_order3, v_dish1, name, price, 1, NULL
  FROM dishes WHERE id = v_dish1;

  -- Order fees for pickup order
  INSERT INTO order_fees (order_id, label, amount) VALUES
    (v_order3, 'رسوم تغليف', 2500),
    (v_order3, 'خدمة', 1500);

  -- Order 4: Delivery order (confirmed)
  INSERT INTO orders (
    restaurant_id, order_number, order_type, customer_name, customer_phone,
    customer_address, status, subtotal, delivery_fee, total
  ) VALUES (
    v_rest_id,
    'ORD-' || (EXTRACT(EPOCH FROM NOW())::bigint + 3),
    'delivery',
    'محمد خالد',
    '0955123456',
    'دمشق - الميدان - شارع النصر',
    'confirmed',
    95000,
    5000,
    103350
  )
  RETURNING id INTO v_order1;

  INSERT INTO order_items (order_id, dish_id, dish_name, dish_price, quantity)
  SELECT v_order1, v_dish2, name, price, 1
  FROM dishes WHERE id = v_dish2
  UNION ALL
  SELECT v_order1, v_dish3, name, price, 2
  FROM dishes WHERE id = v_dish3;

  INSERT INTO order_fees (order_id, label, amount) VALUES
    (v_order1, 'رسوم تغليف', 4750),
    (v_order1, 'خدمة', 2850);

  -- Order 5: Completed order
  INSERT INTO orders (
    restaurant_id, order_number, order_type, customer_name, customer_phone,
    status, subtotal, delivery_fee, total
  ) VALUES (
    v_rest_id,
    'ORD-' || (EXTRACT(EPOCH FROM NOW())::bigint + 4),
    'pickup',
    'سارة أحمد',
    '0966123456',
    'completed',
    30000,
    0,
    32400
  )
  RETURNING id INTO v_order1;

  INSERT INTO order_items (order_id, dish_id, dish_name, dish_price, quantity)
  SELECT v_order1, v_dish3, name, price, 2
  FROM dishes WHERE id = v_dish3;

  INSERT INTO order_fees (order_id, label, amount) VALUES
    (v_order1, 'رسوم تغليف', 1500),
    (v_order1, 'خدمة', 900);

  RAISE NOTICE 'Sample orders created';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'DUMMY DATA SETUP COMPLETE!';
  RAISE NOTICE 'Restaurant ID: %', v_rest_id;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'You can now test:';
  RAISE NOTICE '- Customer menu: /menu/%', v_rest_id;
  RAISE NOTICE '- Admin orders: /admin/orders';
  RAISE NOTICE '- Admin restaurant: /admin/restaurant/%', v_rest_id;
  RAISE NOTICE '========================================';

END $$;

