export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      access_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
          user_type: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_type: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_type?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      backups: {
        Row: {
          backup_type: string
          created_at: string
          file_path: string
          file_size: number | null
          id: string
          status: string
        }
        Insert: {
          backup_type: string
          created_at?: string
          file_path: string
          file_size?: number | null
          id?: string
          status?: string
        }
        Update: {
          backup_type?: string
          created_at?: string
          file_path?: string
          file_size?: number | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      clicks: {
        Row: {
          converted: boolean
          created_at: string
          id: string
          ip_address: string | null
          restaurant_id: string
          user_agent: string | null
          waiter_id: string
        }
        Insert: {
          converted?: boolean
          created_at?: string
          id?: string
          ip_address?: string | null
          restaurant_id: string
          user_agent?: string | null
          waiter_id: string
        }
        Update: {
          converted?: boolean
          created_at?: string
          id?: string
          ip_address?: string | null
          restaurant_id?: string
          user_agent?: string | null
          waiter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clicks_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clicks_waiter_id_fkey"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "waiters"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_champions: {
        Row: {
          clicks: number
          created_at: string
          id: string
          month: number
          restaurant_id: string
          waiter_id: string | null
          waiter_name: string
          year: number
        }
        Insert: {
          clicks?: number
          created_at?: string
          id?: string
          month: number
          restaurant_id: string
          waiter_id?: string | null
          waiter_name: string
          year: number
        }
        Update: {
          clicks?: number
          created_at?: string
          id?: string
          month?: number
          restaurant_id?: string
          waiter_id?: string | null
          waiter_name?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_champions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_champions_waiter_id_fkey"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "waiters"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          created_at: string
          current_rating: number | null
          google_review_url: string
          id: string
          initial_rating: number | null
          name: string
          negative_feedback: string | null
          plan_expiry_date: string | null
          plan_status: string
          positive_feedback: string | null
          responsible_email: string | null
          responsible_name: string | null
          responsible_phone: string | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_rating?: number | null
          google_review_url: string
          id?: string
          initial_rating?: number | null
          name: string
          negative_feedback?: string | null
          plan_expiry_date?: string | null
          plan_status?: string
          positive_feedback?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_rating?: number | null
          google_review_url?: string
          id?: string
          initial_rating?: number | null
          name?: string
          negative_feedback?: string | null
          plan_expiry_date?: string | null
          plan_status?: string
          positive_feedback?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author: string | null
          content: string | null
          created_at: string
          id: string
          rating: number | null
          restaurant_id: string
          translated: boolean
          translated_content: string | null
          waiter_id: string | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          restaurant_id: string
          translated?: boolean
          translated_content?: string | null
          waiter_id?: string | null
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          restaurant_id?: string
          translated?: boolean
          translated_content?: string | null
          waiter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_waiter_id_fkey"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "waiters"
            referencedColumns: ["id"]
          },
        ]
      }
      waiters: {
        Row: {
          clicks: number
          conversions: number
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          restaurant_id: string
          token_expiry_date: string | null
          tracking_token: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          clicks?: number
          conversions?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          restaurant_id: string
          token_expiry_date?: string | null
          tracking_token: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          clicks?: number
          conversions?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          restaurant_id?: string
          token_expiry_date?: string | null
          tracking_token?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waiters_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
