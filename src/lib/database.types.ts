export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          owner_id: string
          name: string
          name_en: string | null
          description: string | null
          logo_url: string | null
          phone: string | null
          whatsapp: string | null
          plan: 'a' | 'b' | 'c'
          delivery_fee: number
          opening_hours: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          name_en?: string | null
          description?: string | null
          logo_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          plan?: 'a' | 'b' | 'c'
          delivery_fee?: number
          opening_hours?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          name_en?: string | null
          description?: string | null
          logo_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          plan?: 'a' | 'b' | 'c'
          delivery_fee?: number
          opening_hours?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          name_en: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          name_en?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          name_en?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      dishes: {
        Row: {
          id: string
          restaurant_id: string
          category_id: string
          name: string
          name_en: string | null
          description: string | null
          image_url: string | null
          price: number
          is_available: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          category_id: string
          name: string
          name_en?: string | null
          description?: string | null
          image_url?: string | null
          price: number
          is_available?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          category_id?: string
          name?: string
          name_en?: string | null
          description?: string | null
          image_url?: string | null
          price?: number
          is_available?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      tables: {
        Row: {
          id: string
          restaurant_id: string
          table_number: string
          qr_code_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          table_number: string
          qr_code_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          table_number?: string
          qr_code_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          restaurant_id: string
          order_number: string
          order_type: 'dine_in' | 'delivery' | 'pickup'
          table_id: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_address: string | null
          status: 'new' | 'in_progress' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled'
          subtotal: number
          delivery_fee: number
          total: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          order_number: string
          order_type: 'dine_in' | 'delivery' | 'pickup'
          table_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          status?: 'new' | 'in_progress' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled'
          subtotal: number
          delivery_fee?: number
          total: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          order_number?: string
          order_type?: 'dine_in' | 'delivery' | 'pickup'
          table_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          status?: 'new' | 'in_progress' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled'
          subtotal?: number
          delivery_fee?: number
          total?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          dish_id: string
          dish_name: string
          dish_price: number
          quantity: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          dish_id: string
          dish_name: string
          dish_price: number
          quantity?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          dish_id?: string
          dish_name?: string
          dish_price?: number
          quantity?: number
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}
