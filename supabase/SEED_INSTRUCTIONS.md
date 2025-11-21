# Dummy Data Setup Instructions

## Quick Setup

1. **Open Supabase SQL Editor**
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Click "New Query"

2. **Run the Seed Script**
   - Open the file `supabase/seed_dummy_data.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter

3. **Verify the Data**
   - Check that the restaurant was created
   - Verify categories and dishes exist
   - Check that sample orders were created

## What Gets Created

✅ **Restaurant**: "مطعم الشام الأصيل" (Sham Original Restaurant)
- ID: `b37946ab-98cd-435e-b264-91aa0ab5d3f2`
- Plan: C (delivery + pickup)
- Extra fees: 5% packaging, 3% service
- 4 cover images for hero slider
- Full opening hours

✅ **6 Categories**:
- المقبلات (Appetizers)
- الشوربات (Soups)
- الأطباق الرئيسية (Main Dishes)
- المشاوي (Grilled)
- الحلويات (Desserts)
- المشروبات (Beverages)

✅ **20+ Dishes** across all categories

✅ **8 Tables** for dine-in orders (Table 1-8)

✅ **5 Sample Orders**:
- 2 Delivery orders (pending, confirmed)
- 1 Dine-in order (preparing)
- 2 Pickup orders (ready, completed)

## Testing URLs

After running the script, you can test:

- **Customer Menu**: `/menu/b37946ab-98cd-435e-b264-91aa0ab5d3f2`
- **Admin Orders**: `/admin/orders`
- **Admin Restaurant**: `/admin/restaurant/b37946ab-98cd-435e-b264-91aa0ab5d3f2`

## Troubleshooting

If you get an error about user ID:
1. Go to Authentication > Users in Supabase Dashboard
2. Copy your user ID
3. In the SQL script, find the line: `SELECT id INTO v_user_id FROM auth.users ORDER BY created_at LIMIT 1;`
4. Replace it with: `v_user_id := 'YOUR_USER_ID_HERE'::uuid;`

## Notes

- The script uses `ON CONFLICT DO NOTHING` so it's safe to run multiple times
- Restaurant data will be updated if it already exists
- All prices are in Syrian Pounds (SYP)

