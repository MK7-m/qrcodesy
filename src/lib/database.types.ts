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
          short_description: string | null
          long_description: string | null
          logo_url: string | null
          cover_image_url: string | null
          cover_images: Json | null
          phone: string | null
          whatsapp: string | null
          phone_number: string | null
          whatsapp_number: string | null
          cuisine_summary: string | null
          plan: 'a' | 'b' | 'c'
          delivery_fee: number
          extra_fees: Json | null
          opening_hours: Json | null
          status_override: 'auto' | 'open' | 'closed' | 'busy' | null
          city: string | null
          area: string | null
          address_landmark: string | null
          rating: number | null
          rating_count: number | null
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
          short_description?: string | null
          long_description?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          cover_images?: Json | null
          phone?: string | null
          whatsapp?: string | null
          phone_number?: string | null
          whatsapp_number?: string | null
          cuisine_summary?: string | null
          plan?: 'a' | 'b' | 'c'
          delivery_fee?: number
          extra_fees?: Json | null
          opening_hours?: Json | null
          status_override?: 'auto' | 'open' | 'closed' | 'busy' | null
          city?: string | null
          area?: string | null
          address_landmark?: string | null
          rating?: number | null
          rating_count?: number | null
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
          short_description?: string | null
          long_description?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          cover_images?: Json | null
          phone?: string | null
          whatsapp?: string | null
          phone_number?: string | null
          whatsapp_number?: string | null
          cuisine_summary?: string | null
          plan?: 'a' | 'b' | 'c'
          delivery_fee?: number
          extra_fees?: Json | null
          opening_hours?: Json | null
          status_override?: 'auto' | 'open' | 'closed' | 'busy' | null
          city?: string | null
          area?: string | null
          address_landmark?: string | null
          rating?: number | null
          rating_count?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      menu_products: {
        Row: {
          id: string
          category_id: string
          name: string
          price: number
          image_url: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          price: number
          image_url?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          price?: number
          image_url?: string | null
          description?: string | null
          created_at?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'canceled'
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
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'canceled'
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
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'canceled'
          subtotal?: number
          delivery_fee?: number
          total?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_fees: {
        Row: {
          id: string
          order_id: string
          label: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          label: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          label?: string
          amount?: number
          created_at?: string
        }
        Relationships: []
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
        Relationships: []
      }
      restaurant_reviews: {
        Row: {
          id: string
          restaurant_id: string
          author_name: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          author_name: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          author_name?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: []
      }
    },
    Views: {
      [_ in never]: never
    },
    Functions: {
      [_ in never]: never
    },
    Enums: {
      [_ in never]: never
    },
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
