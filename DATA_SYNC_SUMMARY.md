# Data Synchronization Summary

## Problem Identified

The application uses **two different sets of tables**:

1. **Customer Menu Page** (`/menu/:restaurantId`) uses:
   - `menu_categories` table
   - `menu_products` table
   - Service: `src/services/menu.ts`

2. **Admin Dashboard** (`/dashboard`) uses:
   - `categories` table
   - `dishes` table
   - Component: `src/features/dashboard/MenuTab.tsx`

This caused different data to appear in each view.

## Solution Applied

Updated `supabase/seed_dummy_data.sql` to populate **BOTH** sets of tables with **identical data**:

### 1. Categories & Dishes (Admin Dashboard)
- ✅ Updated category names to match requirements:
  - وجبات الفروج الكامل (Full Chicken Meals)
  - المشاوي الملكية (Royal Grills)
  - السندويشات (Sandwiches)
  - المقبلات والسلطات (Appetizers & Salads)
  - حلويات شرقية (Eastern Desserts)
  - المشروبات (Beverages)

- ✅ Updated dishes to match new categories with appropriate items

### 2. Menu Categories & Menu Products (Customer Menu)
- ✅ Added inserts for `menu_categories` with same names
- ✅ Added inserts for `menu_products` with matching items

## Seed Script Structure

The seed script now:

1. Creates restaurant "مطعم التجربة"
2. Creates categories in `categories` table (for admin)
3. Creates dishes in `dishes` table (for admin)
4. Creates categories in `menu_categories` table (for customer menu)
5. Creates products in `menu_products` table (for customer menu)
6. Creates tables for dine-in
7. Creates sample orders

## How to Run

1. Open Supabase SQL Editor
2. Copy entire contents of `supabase/seed_dummy_data.sql`
3. Paste and run
4. Both `/dashboard` and `/menu/:restaurantId` will now show the same data

## Result

✅ Both views now show:
- Same restaurant name: "مطعم التجربة"
- Same 6 categories with matching names
- Same menu items in each category
- Consistent data across admin and customer views

