# Database Schema Notes

## Overview
This document describes the Supabase database schema for the restaurant ordering application.

## Main Tables

### `restaurants`
**Purpose**: Stores restaurant information and settings.

**Key Fields**:
- `id` (uuid, PK)
- `owner_id` (uuid, FK → auth.users)
- `name` (text) - Arabic restaurant name
- `name_en` (text, nullable) - English restaurant name
- `description` (text, nullable) - Short description
- `short_description` (text, nullable) - Brief tagline
- `long_description` (text, nullable) - Detailed description
- `logo_url` (text, nullable) - Restaurant logo image URL
- `cover_image_url` (text, nullable) - Main cover image URL
- `cover_images` (jsonb, nullable) - Array of cover images for hero slider
- `phone` / `phone_number` (text, nullable) - Phone number
- `whatsapp` / `whatsapp_number` (text, nullable) - WhatsApp number
- `city` (text, nullable) - City name (e.g., "دمشق")
- `area` (text, nullable) - Area/neighborhood (e.g., "المزة")
- `address_landmark` (text, nullable) - Address landmark/description
- `plan` ('a' | 'b' | 'c') - Subscription plan
  - `a`: Menu only (browse)
  - `b`: Menu + dine-in orders
  - `c`: Menu + dine-in + delivery/pickup
- `delivery_fee` (numeric) - Delivery fee in SYP
- `extra_fees` (jsonb, nullable) - Array of extra fees with label and percentage
  - Example: `[{"label": "رسوم تغليف", "percentage": 5}, {"label": "خدمة", "percentage": 3}]`
- `opening_hours` (jsonb, nullable) - Daily opening hours
  - Format: `[{"day": "sat", "ranges": [{"from": "10:00", "to": "22:00"}]}, ...]`
- `status_override` ('auto' | 'open' | 'closed' | 'busy', nullable) - Manual status override
- `is_active` (boolean) - Whether restaurant is active
- `rating` (numeric, default 0) - Average rating
- `rating_count` (integer, default 0) - Number of ratings
- `cuisine_summary` (text, nullable) - Cuisine type tag (e.g., "مأكولات سورية")

**Relationships**:
- One-to-many with `categories`
- One-to-many with `dishes`
- One-to-many with `orders`
- One-to-many with `tables`

---

### `categories`
**Purpose**: Menu categories (e.g., "المقبلات", "المشاوي").

**Key Fields**:
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK → restaurants.id)
- `name` (text) - Arabic category name
- `name_en` (text, nullable) - English category name
- `image_url` (text, nullable) - Category image URL
- `sort_order` (integer) - Display order
- `is_active` (boolean) - Whether category is active

**Relationships**:
- Many-to-one with `restaurants`
- One-to-many with `dishes`

---

### `dishes`
**Purpose**: Menu items/products.

**Key Fields**:
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK → restaurants.id)
- `category_id` (uuid, FK → categories.id)
- `name` (text) - Arabic dish name
- `name_en` (text, nullable) - English dish name
- `description` (text, nullable) - Dish description
- `image_url` (text, nullable) - Dish image URL
- `price` (numeric) - Price in SYP
- `is_available` (boolean) - Whether dish is currently available
- `sort_order` (integer) - Display order within category

**Relationships**:
- Many-to-one with `restaurants`
- Many-to-one with `categories`
- One-to-many with `order_items`

---

### `tables`
**Purpose**: Restaurant tables for dine-in orders (Plan B & C).

**Key Fields**:
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK → restaurants.id)
- `table_number` (text) - Table identifier (e.g., "1", "A1")
- `qr_code_url` (text, nullable) - QR code image URL (optional)
- `is_active` (boolean) - Whether table is active

**Relationships**:
- Many-to-one with `restaurants`
- One-to-many with `orders` (via `table_id`)

---

### `orders`
**Purpose**: Customer orders.

**Key Fields**:
- `id` (uuid, PK)
- `restaurant_id` (uuid, FK → restaurants.id)
- `order_number` (text) - Unique order number (e.g., "ORD-1234567890")
- `order_type` ('dine_in' | 'delivery' | 'pickup')
- `table_id` (uuid, nullable, FK → tables.id) - For dine-in orders
- `customer_name` (text, nullable) - Customer name (for delivery/pickup)
- `customer_phone` (text, nullable) - Customer phone (for delivery/pickup)
- `customer_address` (text, nullable) - Delivery address
- `status` ('pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'canceled')
- `subtotal` (numeric) - Subtotal before fees
- `delivery_fee` (numeric) - Delivery fee (0 for dine-in/pickup)
- `total` (numeric) - Final total including all fees
- `notes` (text, nullable) - Order notes

**Relationships**:
- Many-to-one with `restaurants`
- Many-to-one with `tables` (optional)
- One-to-many with `order_items`
- One-to-many with `order_fees`

---

### `order_items`
**Purpose**: Individual items in an order.

**Key Fields**:
- `id` (uuid, PK)
- `order_id` (uuid, FK → orders.id)
- `dish_id` (uuid, FK → dishes.id)
- `dish_name` (text) - Snapshot of dish name at time of order
- `dish_price` (numeric) - Snapshot of dish price at time of order
- `quantity` (integer) - Quantity ordered
- `notes` (text, nullable) - Item-specific notes

**Relationships**:
- Many-to-one with `orders`
- Many-to-one with `dishes`

---

### `order_fees`
**Purpose**: Additional fees applied to orders (e.g., packaging, service).

**Key Fields**:
- `id` (uuid, PK)
- `order_id` (uuid, FK → orders.id)
- `label` (text) - Fee label (e.g., "رسوم تغليف")
- `amount` (numeric) - Fee amount in SYP

**Relationships**:
- Many-to-one with `orders`

---

## Data Flow

### Customer Menu Flow
1. Customer visits `/menu/:restaurantId`
2. Frontend fetches:
   - Restaurant data from `restaurants` table
   - Categories from `categories` table (filtered by `restaurant_id`)
   - Dishes from `dishes` table (filtered by `restaurant_id` or `category_id`)
3. Customer adds items to cart (client-side)
4. On checkout:
   - Create order in `orders` table
   - Create order items in `order_items` table
   - Calculate and create fees in `order_fees` table

### Admin Dashboard Flow
1. Admin logs in and accesses `/dashboard`
2. System loads restaurant by `owner_id` from `restaurants` table
3. Admin can:
   - View/edit restaurant settings
   - Manage categories and dishes
   - View orders with filters
   - Generate QR codes

---

## Notes

- **Currency**: All prices are in Syrian Pounds (SYP), displayed as "ر.س" in the UI
- **RTL Support**: All text fields support Arabic (RTL) text
- **Image URLs**: Currently using placeholder URLs (e.g., Unsplash). In production, these should be uploaded to Supabase Storage.
- **Order Status**: Status values must match the enum defined in the migration
- **Extra Fees**: Stored as JSONB array with `label` and `percentage` fields. Calculated as percentage of subtotal.
- **Opening Hours**: Stored as JSONB array with day keys and time ranges.

---

## Seed Data

See `supabase/seed_dummy_data.sql` for a complete seed script that creates:
- 1 restaurant ("مطعم الشام الأصيل")
- 6 categories
- 20+ dishes across categories
- 8 tables
- 5 sample orders with items and fees

