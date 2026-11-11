export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          image_url: string | null
          created_at: string | null
          id: string
          name: string
          published: boolean
          slug: string | null
        }
        Insert: {
          image_url?: string | null
          created_at?: string | null
          id: string
          name: string
          published?: boolean
          slug?: string | null
        }
        Update: {
          image_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          published?: boolean
          slug?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          campaign_name: string
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          image_url: string | null
          published: boolean
          start_date: string
          updated_at: string
        }
        Insert: {
          campaign_name: string
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          image_url?: string | null
          published?: boolean
          start_date: string
          updated_at?: string
        }
        Update: {
          campaign_name?: string
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          image_url?: string | null
          published?: boolean
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          published: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          published?: boolean
          title: string
          type?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          published?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          id: string
          items: Json
          payment_method: string | null
          payment_status: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          items: Json
          payment_method?: string | null
          payment_status?: string | null
          total_amount: number
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          items?: Json
          payment_method?: string | null
          payment_status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          old_price: number | null
          price: number
          published: boolean
          stock: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          old_price?: number | null
          price: number
          published?: boolean
          stock?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          old_price?: number | null
          price?: number
          published?: boolean
          stock?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      store_appearance: {
        Row: {
          announcement_enabled: boolean
          announcement_text: string | null
          footer_contact: string | null
          footer_social_links: Json
          footer_text: string | null
          hero_button_text: string | null
          hero_button_url: string | null
          hero_enabled: boolean
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: number
          updated_at: string
        }
        Insert: {
          announcement_enabled?: boolean
          announcement_text?: string | null
          footer_contact?: string | null
          footer_social_links?: Json
          footer_text?: string | null
          hero_button_text?: string | null
          hero_button_url?: string | null
          hero_enabled?: boolean
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: number
          updated_at?: string
        }
        Update: {
          announcement_enabled?: boolean
          announcement_text?: string | null
          footer_contact?: string | null
          footer_social_links?: Json
          footer_text?: string | null
          hero_button_text?: string | null
          hero_button_url?: string | null
          hero_enabled?: boolean
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      store_banners: {
        Row: {
          active: boolean
          button_text: string | null
          button_url: string | null
          created_at: string
          ends_at: string | null
          id: string
          image_url: string | null
          link_type: string | null
          sort_order: number
          starts_at: string | null
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          link_type?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          link_type?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          address: Json
          contact_email: string | null
          facebook: string | null
          id: number
          instagram: string | null
          payment_methods: Json
          policies: Json
          shipping_origin: Json
          store_name: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: Json
          contact_email?: string | null
          facebook?: string | null
          id?: number
          instagram?: string | null
          payment_methods?: Json
          policies?: Json
          shipping_origin?: Json
          store_name?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: Json
          contact_email?: string | null
          facebook?: string | null
          id?: number
          instagram?: string | null
          payment_methods?: Json
          policies?: Json
          shipping_origin?: Json
          store_name?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
