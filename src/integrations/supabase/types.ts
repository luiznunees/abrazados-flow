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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      event_videos: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          id: string
          title: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          title?: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          title?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: []
      }
      musicas: {
        Row: {
          created_at: string
          id: string
          loop: boolean
          nome: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          loop?: boolean
          nome?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          loop?: boolean
          nome?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number | null
          cidade: string | null
          created_at: string | null
          data_inscricao: string | null
          email: string | null
          forma_pagamento: string | null
          id: string
          mercado_pago_id: string | null
          nome: string | null
          pagou: boolean | null
          payment_date: string | null
          payment_method: string | null
          payment_status:
            | Database["public"]["Enums"]["mercado_pago_status"]
            | null
          registration_id: string | null
          telefone: string | null
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          amount?: number | null
          cidade?: string | null
          created_at?: string | null
          data_inscricao?: string | null
          email?: string | null
          forma_pagamento?: string | null
          id?: string
          mercado_pago_id?: string | null
          nome?: string | null
          pagou?: boolean | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?:
            | Database["public"]["Enums"]["mercado_pago_status"]
            | null
          registration_id?: string | null
          telefone?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          amount?: number | null
          cidade?: string | null
          created_at?: string | null
          data_inscricao?: string | null
          email?: string | null
          forma_pagamento?: string | null
          id?: string
          mercado_pago_id?: string | null
          nome?: string | null
          pagou?: boolean | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?:
            | Database["public"]["Enums"]["mercado_pago_status"]
            | null
          registration_id?: string | null
          telefone?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          checked_in: boolean | null
          checked_in_at: string | null
          city: string
          created_at: string | null
          email: string
          id: string
          mercado_pago_payment_id: string | null
          name: string
          payment_id: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          phone: string
          qr_code: string | null
          registration_date: string | null
          status: Database["public"]["Enums"]["registration_status"] | null
          updated_at: string | null
        }
        Insert: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          city: string
          created_at?: string | null
          email: string
          id?: string
          mercado_pago_payment_id?: string | null
          name: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          phone: string
          qr_code?: string | null
          registration_date?: string | null
          status?: Database["public"]["Enums"]["registration_status"] | null
          updated_at?: string | null
        }
        Update: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          city?: string
          created_at?: string | null
          email?: string
          id?: string
          mercado_pago_payment_id?: string | null
          name?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          phone?: string
          qr_code?: string | null
          registration_date?: string | null
          status?: Database["public"]["Enums"]["registration_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      admin_stats: {
        Row: {
          checked_in_count: number | null
          paid_registrations: number | null
          pending_registrations: number | null
          total_registrations: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_qr_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      mercado_pago_status: "pending" | "approved" | "rejected" | "cancelled"
      payment_status: "pending" | "paid" | "failed"
      registration_status:
        | "pending"
        | "confirmed"
        | "paid"
        | "cancelled"
        | "checked_in"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      mercado_pago_status: ["pending", "approved", "rejected", "cancelled"],
      payment_status: ["pending", "paid", "failed"],
      registration_status: [
        "pending",
        "confirmed",
        "paid",
        "cancelled",
        "checked_in",
      ],
    },
  },
} as const
