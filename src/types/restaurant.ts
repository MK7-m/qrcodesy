export interface OpeningHoursRange {
  from: string;
  to: string;
}

export interface DailyOpeningHours {
  day: string; // sat, sun, mon, ...
  ranges: OpeningHoursRange[];
}

export interface RestaurantReview {
  id: string;
  restaurant_id: string;
  author_name: string;
  rating: number;
  comment?: string | null;
  created_at: string;
}

export interface CoverImage {
  url: string;
  order: number;
}

export interface ExtraFee {
  label: string;
  percentage: number; // 0-100
}

export interface Restaurant {
  id: string;
  name: string;
  name_en?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  cover_images?: CoverImage[] | string[] | null; // Support both formats for migration
  description?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  rating?: number | null;
  rating_count?: number | null;
  cuisine_summary?: string | null;
  phone_number?: string;
  whatsapp_number?: string;
  delivery_fee: number;
  extra_fees?: ExtraFee[] | null;
  opening_hours?: DailyOpeningHours[];
  created_at: string;
  city?: string;
  area?: string;
  address_landmark?: string;
  status_override?: 'auto' | 'open' | 'closed' | 'busy';
   plan?: 'a' | 'b' | 'c';
}

export type RestaurantStatus = 'open' | 'closed' | 'busy';
