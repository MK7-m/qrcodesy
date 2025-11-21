# Unified Seed Data Instructions

## Problem Solved

The app uses **two different table sets**:
- **Customer Menu** (`/menu/:restaurantId`) → `menu_categories` + `menu_products`
- **Admin Dashboard** (`/dashboard`) → `categories` + `dishes`

The seed script now populates **BOTH** with identical data.

## How to Run

1. **Open Supabase SQL Editor**
   - Go to Supabase Dashboard → SQL Editor → New Query

2. **Run the Seed Script**
   - Open `supabase/seed_dummy_data.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run" (or Ctrl+Enter)

3. **Verify**
   - Check `/dashboard` → Menu tab → Should see 6 categories with dishes
   - Check `/menu/b37946ab-98cd-435e-b264-91aa0ab5d3f2` → Should see same 6 categories with same items

## What Gets Created

### Restaurant
- **Name**: "مطعم التجربة"
- **ID**: `b37946ab-98cd-435e-b264-91aa0ab5d3f2`
- **Plan**: C (full features)
- **Location**: دمشق - المزة

### Categories (Both Tables)
1. **وجبات الفروج الكامل** (Full Chicken Meals) - 3 items
2. **المشاوي الملكية** (Royal Grills) - 5 items
3. **السندويشات** (Sandwiches) - 4 items
4. **المقبلات والسلطات** (Appetizers & Salads) - 5 items
5. **حلويات شرقية** (Eastern Desserts) - 4 items
6. **المشروبات** (Beverages) - 5 items

**Total**: 26 menu items across both table sets

### Sample Orders
- 5 sample orders (delivery, dine-in, pickup)
- Various statuses (pending, preparing, ready, completed)

## Data Synchronization

The seed script ensures:
- ✅ Same category names in both `categories` and `menu_categories`
- ✅ Same items in both `dishes` and `menu_products`
- ✅ Same prices, descriptions, and images
- ✅ Both views show identical data

## Testing URLs

After running the seed:
- **Customer Menu**: `http://localhost:5173/menu/b37946ab-98cd-435e-b264-91aa0ab5d3f2`
- **Admin Dashboard**: `http://localhost:5173/dashboard`
- **Admin Orders**: `http://localhost:5173/dashboard` → Orders tab

Both should show the same restaurant, categories, and menu items!

