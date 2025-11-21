# Plan A/B/C Implementation Analysis Report

**Date**: Current Analysis  
**Scope**: Restaurant plan-based feature implementation status

---

## Executive Summary

The codebase has **partial implementation** of plan-based behavior. The database schema and TypeScript types are in place, and there is plan-aware logic in both customer UI and dashboard, but several critical behaviors are **missing or incomplete**.

---

## 1. Database Schema

### ✅ **Plan Field in `restaurants` Table: IMPLEMENTED**

**Location**: `supabase/migrations/20251113204257_create_initial_schema.sql` (line 115)

**Details**:
- Column: `plan text NOT NULL DEFAULT 'a'`
- Constraint: `CHECK (plan IN ('a', 'b', 'c'))`
- Default value: `'a'`

**Status**: ✅ **FULLY IMPLEMENTED**

---

## 2. TypeScript Types

### ✅ **Plan Field in TypeScript Types: IMPLEMENTED**

**Locations**:
- `src/lib/database.types.ts` (lines 22, 38, 54): Database types include `plan: 'a' | 'b' | 'c'`
- `src/pages/CustomerMenuPage.tsx` (line 20): Local type extends with `plan?: 'a' | 'b' | 'c'`
- `src/types/restaurant.ts`: Restaurant interface does **NOT** include `plan` field (missing)

**Status**: ⚠️ **PARTIALLY IMPLEMENTED**
- Database types: ✅ Complete
- Restaurant interface: ❌ Missing `plan` field

---

## 3. Customer UI (`/menu/:restaurantId`) - Plan Behavior

### File: `src/pages/CustomerMenuPage.tsx`

#### Plan Detection Logic (Lines 158-160):
```typescript
const canOrder = !!(restaurant?.plan === 'b' || restaurant?.plan === 'c');
const isDineIn = !!(tableId && restaurant?.plan === 'b');
const isDeliveryPickup = !!(orderType && restaurant?.plan === 'c');
```

### ❌ **Plan A Behavior: NOT FULLY IMPLEMENTED**

**Current State**:
- `canOrder` is `false` for Plan A ✅
- Cart UI is conditionally rendered based on `canOrder` (line 241, 378) ✅
- **BUT**: "Add to Cart" buttons on dish cards are still shown (line 369: `canOrder={canOrder && (isDineIn || isDeliveryPickup)}`)
- **ISSUE**: For Plan A, `canOrder` is false, so buttons should be disabled/hidden, but the logic `canOrder && (isDineIn || isDeliveryPickup)` evaluates to `false && false = false`, which should work, but the button might still render visually.

**What's Missing**:
- No explicit "menu-only" message for Plan A users
- No visual indication that ordering is disabled
- Cart functionality might still be accessible if user somehow adds items

**Status**: ⚠️ **PARTIALLY IMPLEMENTED** - Logic exists but UX feedback is missing

---

### ⚠️ **Plan B Behavior: PARTIALLY IMPLEMENTED**

**Current State**:
- `isDineIn` is set when `tableId` exists AND `plan === 'b'` ✅
- Table number is displayed when `isDineIn` is true (line 231-238) ✅
- Cart is shown when `canOrder` is true (Plan B allows ordering) ✅
- **BUT**: No explicit blocking of `?type=delivery` or `?type=pickup` URLs for Plan B
- **ISSUE**: If a Plan B restaurant URL has `?type=delivery`, `isDeliveryPickup` would be false, but there's no validation preventing delivery/pickup orders

**What's Missing**:
- Validation to prevent delivery/pickup order types for Plan B
- UI indication that only dine-in orders are allowed
- No way for Plan B customers to initiate delivery/pickup (which is correct, but should be explicit)

**Status**: ⚠️ **PARTIALLY IMPLEMENTED** - Dine-in works, but delivery/pickup blocking is implicit, not explicit

---

### ⚠️ **Plan C Behavior: PARTIALLY IMPLEMENTED**

**Current State**:
- `isDeliveryPickup` is set when `orderType` exists AND `plan === 'c'` ✅
- `canOrder` is true for Plan C ✅
- Cart and checkout flow support all order types ✅
- **BUT**: No explicit UI to let customers choose between dine-in/delivery/pickup
- **ISSUE**: Plan C should allow customers to choose order type, but currently relies on URL parameters (`?table=X` for dine-in, `?type=delivery` or `?type=pickup`)

**What's Missing**:
- Order type selector UI for Plan C customers
- Clear indication of available order types
- Seamless switching between order types

**Status**: ⚠️ **PARTIALLY IMPLEMENTED** - All order types work, but UX for choosing order type is missing

---

### ✅ **`?table=` Parameter Support: IMPLEMENTED**

**Location**: `src/pages/CustomerMenuPage.tsx` (line 30)

**Details**:
- Reads `tableId` from URL: `const tableId = searchParams.get('table');`
- Passes `tableId` to `CheckoutFlow` component (line 172)
- Displays table number when present (line 231-238)
- Used in `isDineIn` logic (line 159)

**Status**: ✅ **FULLY IMPLEMENTED**

---

## 4. Checkout Flow (`CheckoutFlow.tsx`)

### File: `src/components/CheckoutFlow.tsx`

**Current State**:
- Accepts `tableId` prop (line 22, 34)
- Sets `isDineIn = !!tableId` (line 40)
- Supports dine-in, delivery, and pickup flows
- **BUT**: No plan validation inside CheckoutFlow - it trusts the parent component

**Status**: ✅ **FUNCTIONAL** - Works correctly when called with proper parameters, but lacks plan validation

---

## 5. Dish Availability (`is_available`)

### ❌ **`is_available` in `menu_products`: NOT IMPLEMENTED**

**Database Status**:
- `dishes` table: ✅ Has `is_available boolean` (migration line 49)
- `menu_products` table: ❌ **NO `is_available` field** (see `supabase/migrations/menu_tables.sql`)

**UI Status**:
- Admin dashboard (`MenuTab.tsx`): ✅ Toggle available for `dishes` table (lines 106, 240-273, 448-570)
- Customer menu: ❌ No filtering based on availability for `menu_products`

**TypeScript Types**:
- `MenuProduct` interface (`src/types/menu.ts`): ❌ No `is_available` field
- `Dish` type (from database): ✅ Has `is_available`

**Status**: ❌ **NOT IMPLEMENTED** for customer-facing menu (`menu_products` table)

---

## 6. Dashboard Plan Awareness

### ✅ **Dashboard Shows Plan: IMPLEMENTED**

**Location**: `src/pages/DashboardPage.tsx` (lines 127-131, 151)

**Details**:
- Plan labels defined: `{ a: 'الخطة A', b: 'الخطة B', c: 'الخطة C' }`
- Displayed in header badge: `{planLabels[restaurant.plan]}`
- Shows plan badge next to restaurant status

**Status**: ✅ **FULLY IMPLEMENTED**

---

### ✅ **Settings Tab Plan Management: IMPLEMENTED**

**Location**: `src/features/dashboard/SettingsTab.tsx` (lines 49, 88, 262-279)

**Details**:
- Plan selector dropdown (lines 262-268)
- Plan descriptions shown (lines 272-274)
- Delivery fee field shown only for Plan C (line 280)
- Saves plan to database (line 88: `plan: formData.plan.toLowerCase()`)

**Status**: ✅ **FULLY IMPLEMENTED**

---

### ✅ **QR Tab Plan-Specific Messages: IMPLEMENTED**

**Location**: `src/features/dashboard/QRTab.tsx`

**Details**:
- Plan info section (lines 35-53): Shows plan-specific descriptions
- Main QR description (lines 84-87): Different messages for each plan
- Table QR section (line 95): Only shown for Plan B & C
- Plan A info section (lines 157-165): Additional guidance for Plan A

**Status**: ✅ **FULLY IMPLEMENTED**

---

## 7. Summary Checklist

| Feature | Status | Details |
|---------|--------|---------|
| **Plan field in DB** | ✅ **YES** | `restaurants.plan` with CHECK constraint, default 'a' |
| **Plan field in TS types** | ⚠️ **PARTIAL** | Database types ✅, Restaurant interface ❌ missing `plan` |
| **Customer UI Plan A** | ⚠️ **PARTIAL** | `canOrder` false ✅, but no UX feedback/message |
| **Customer UI Plan B** | ⚠️ **PARTIAL** | Dine-in works ✅, but delivery/pickup blocking is implicit |
| **Customer UI Plan C** | ⚠️ **PARTIAL** | All order types work ✅, but no order type selector UI |
| **`?table=` param support** | ✅ **YES** | Fully implemented, reads from URL, displays table number |
| **Dish availability (`is_available`)** | ❌ **NO** | Exists in `dishes` ✅, missing in `menu_products` ❌, not used in customer UI |
| **Dashboard plan awareness** | ✅ **YES** | Plan shown, editable in settings, plan-specific QR messages |

---

## 8. Critical Missing Features

### High Priority:
1. **Plan A UX**: Add clear "menu-only" message and disable/hide cart buttons
2. **Plan B Validation**: Explicitly block delivery/pickup order types (validate in CheckoutFlow or before)
3. **Plan C Order Type Selector**: Add UI for customers to choose dine-in/delivery/pickup
4. **`is_available` for `menu_products`**: Add field to schema and filter unavailable items in customer UI

### Medium Priority:
5. **Restaurant TypeScript Interface**: Add `plan` field to `src/types/restaurant.ts`
6. **Plan Validation in CheckoutFlow**: Add plan checks inside CheckoutFlow component

---

## 9. Files Requiring Changes

### Customer UI:
- `src/pages/CustomerMenuPage.tsx`: Add Plan A message, Plan B validation, Plan C selector
- `src/components/CheckoutFlow.tsx`: Add plan validation
- `src/types/restaurant.ts`: Add `plan` field

### Database:
- `supabase/migrations/`: Add `is_available` to `menu_products` table
- `src/types/menu.ts`: Add `is_available` to `MenuProduct` interface

### Services:
- `src/services/menu.ts`: Filter `menu_products` by `is_available` when fetching

---

## 10. Testing Recommendations

1. **Plan A**: Visit `/menu/:id` → Verify cart is hidden, no "Add to Cart" buttons
2. **Plan B**: Visit `/menu/:id?table=1` → Verify dine-in works, `/menu/:id?type=delivery` → Should be blocked
3. **Plan C**: Visit `/menu/:id` → Should show order type selector, all types should work
4. **Availability**: Toggle `is_available` in dashboard → Verify item disappears from customer menu

---

**End of Report**

