# Troubleshooting: Why Don't I See Data on localhost:5173?

## Quick Checklist

### 1. ✅ Have you run the SQL seed script?
   - Go to Supabase Dashboard → SQL Editor
   - Run the file: `supabase/seed_dummy_data.sql`
   - Check for success messages

### 2. ✅ What URL are you visiting?
   
   The app redirects to `/auth` by default. Try these URLs:

   **Customer Menu (No login required):**
   ```
   http://localhost:5173/menu/b37946ab-98cd-435e-b264-91aa0ab5d3f2
   ```

   **Admin Pages (Login required):**
   ```
   http://localhost:5173/auth          (Login first)
   http://localhost:5173/dashboard      (After login)
   http://localhost:5173/admin/orders  (After login)
   ```

### 3. ✅ Is the dev server running?
   ```bash
   npm run dev
   ```
   Should show: `Local: http://localhost:5173/`

### 4. ✅ Check browser console for errors
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

### 5. ✅ Verify data exists in Supabase
   
   Run this in Supabase SQL Editor to check:
   ```sql
   -- Check if restaurant exists
   SELECT id, name, owner_id FROM restaurants 
   WHERE id = 'b37946ab-98cd-435e-b264-91aa0ab5d3f2';
   
   -- Check categories
   SELECT COUNT(*) as category_count FROM categories 
   WHERE restaurant_id = 'b37946ab-98cd-435e-b264-91aa0ab5d3f2';
   
   -- Check dishes
   SELECT COUNT(*) as dish_count FROM dishes d
   JOIN categories c ON c.id = d.category_id
   WHERE c.restaurant_id = 'b37946ab-98cd-435e-b264-91aa0ab5d3f2';
   
   -- Check orders
   SELECT COUNT(*) as order_count FROM orders 
   WHERE restaurant_id = 'b37946ab-98cd-435e-b264-91aa0ab5d3f2';
   ```

## Common Issues

### Issue: "تعذر العثور على المطعم" (Restaurant not found)
**Solution:** Run the seed script in Supabase SQL Editor

### Issue: Redirected to /auth when visiting /menu
**Solution:** This is normal! The customer menu page should work without login. Make sure you're using the full URL:
```
http://localhost:5173/menu/b37946ab-98cd-435e-b264-91aa0ab5d3f2
```

### Issue: Blank page or loading forever
**Solution:** 
1. Check browser console for errors
2. Verify Supabase environment variables in `.env` file
3. Check Network tab - are API calls failing?

### Issue: "Missing Supabase environment variables"
**Solution:** Create a `.env` file in project root:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
Then restart the dev server.

## Quick Test URLs

After running the seed script, test these:

1. **Customer Menu (Public):**
   ```
   http://localhost:5173/menu/b37946ab-98cd-435e-b264-91aa0ab5d3f2
   ```
   Should show: Hero slider, restaurant header, menu categories, dishes

2. **Admin Orders (Requires login):**
   ```
   http://localhost:5173/admin/orders
   ```
   Should show: List of orders with filters

3. **Admin Restaurant (Requires login):**
   ```
   http://localhost:5173/admin/restaurant/b37946ab-98cd-435e-b264-91aa0ab5d3f2
   ```
   Should show: Restaurant editor with all sections

