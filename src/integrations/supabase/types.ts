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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admission_applications: {
        Row: {
          aadhaar_number: string
          address: string
          blood_group: string | null
          community: string | null
          created_at: string
          date_of_birth: string
          gender: string
          id: string
          nationality: string | null
          parent_email: string | null
          parent_name: string
          parent_phone: string
          previous_school: string | null
          religion: string | null
          standard_applying: string
          student_name: string
        }
        Insert: {
          aadhaar_number: string
          address: string
          blood_group?: string | null
          community?: string | null
          created_at?: string
          date_of_birth: string
          gender: string
          id?: string
          nationality?: string | null
          parent_email?: string | null
          parent_name: string
          parent_phone: string
          previous_school?: string | null
          religion?: string | null
          standard_applying: string
          student_name: string
        }
        Update: {
          aadhaar_number?: string
          address?: string
          blood_group?: string | null
          community?: string | null
          created_at?: string
          date_of_birth?: string
          gender?: string
          id?: string
          nationality?: string | null
          parent_email?: string | null
          parent_name?: string
          parent_phone?: string
          previous_school?: string | null
          religion?: string | null
          standard_applying?: string
          student_name?: string
        }
        Relationships: []
      }
      cash_register: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          payment_method: string | null
          recorded_by: string | null
          reference_id: string | null
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          recorded_by?: string | null
          reference_id?: string | null
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          recorded_by?: string | null
          reference_id?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: []
      }
      fee_payments: {
        Row: {
          academic_year: string | null
          amount: number
          created_at: string
          fee_structure_id: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          receipt_number: string | null
          recorded_by: string | null
          reference_id: string | null
          student_id: string
          term: string | null
        }
        Insert: {
          academic_year?: string | null
          amount: number
          created_at?: string
          fee_structure_id?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          recorded_by?: string | null
          reference_id?: string | null
          student_id: string
          term?: string | null
        }
        Update: {
          academic_year?: string | null
          amount?: number
          created_at?: string
          fee_structure_id?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          recorded_by?: string | null
          reference_id?: string | null
          student_id?: string
          term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structure: {
        Row: {
          academic_year: string
          amount: number
          created_at: string
          fee_type: string
          id: string
          standard: string
          term: string
        }
        Insert: {
          academic_year?: string
          amount?: number
          created_at?: string
          fee_type: string
          id?: string
          standard: string
          term: string
        }
        Update: {
          academic_year?: string
          amount?: number
          created_at?: string
          fee_type?: string
          id?: string
          standard?: string
          term?: string
        }
        Relationships: []
      }
      kindle_library_items: {
        Row: {
          category: string
          created_at: string
          file_format: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          page_count: number
          standard: string
          title: string
          uploaded_by: string | null
          uploaded_by_email: string | null
          word_count: number
        }
        Insert: {
          category?: string
          created_at?: string
          file_format: string
          file_name: string
          file_path: string
          file_size?: number
          id?: string
          page_count?: number
          standard?: string
          title: string
          uploaded_by?: string | null
          uploaded_by_email?: string | null
          word_count?: number
        }
        Update: {
          category?: string
          created_at?: string
          file_format?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          page_count?: number
          standard?: string
          title?: string
          uploaded_by?: string | null
          uploaded_by_email?: string | null
          word_count?: number
        }
        Relationships: []
      }
      pending_fee_payments: {
        Row: {
          amount: string | null
          created_at: string
          id: string
          parent_email: string | null
          payment_method: string
          reference_id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          section: string
          standard: string
          status: string
          student_name: string
        }
        Insert: {
          amount?: string | null
          created_at?: string
          id?: string
          parent_email?: string | null
          payment_method?: string
          reference_id: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          section?: string
          standard: string
          status?: string
          student_name: string
        }
        Update: {
          amount?: string | null
          created_at?: string
          id?: string
          parent_email?: string | null
          payment_method?: string
          reference_id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          section?: string
          standard?: string
          status?: string
          student_name?: string
        }
        Relationships: []
      }
      school_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          payment_method: string | null
          recorded_by: string | null
          reference_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          payment_method?: string | null
          recorded_by?: string | null
          reference_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          payment_method?: string | null
          recorded_by?: string | null
          reference_id?: string | null
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          created_at: string
          designation: string | null
          full_name: string
          id: string
          phone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          designation?: string | null
          full_name: string
          id?: string
          phone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          designation?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          aadhaar_number: string | null
          address: string | null
          admission_number: string
          blood_group: string | null
          created_at: string
          date_of_birth: string | null
          gender: string | null
          id: string
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          section: string | null
          standard: string
          status: string | null
          student_name: string
          updated_at: string
        }
        Insert: {
          aadhaar_number?: string | null
          address?: string | null
          admission_number: string
          blood_group?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          section?: string | null
          standard: string
          status?: string | null
          student_name: string
          updated_at?: string
        }
        Update: {
          aadhaar_number?: string | null
          address?: string | null
          admission_number?: string
          blood_group?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          section?: string | null
          standard?: string
          status?: string | null
          student_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_kindle_catalog: {
        Args: never
        Returns: {
          category: string
          created_at: string
          file_format: string
          file_name: string
          file_size: number
          id: string
          page_count: number
          standard: string
          title: string
          word_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff"
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
    Enums: {
      app_role: ["admin", "staff"],
    },
  },
} as const
