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
      classes: {
        Row: {
          class_name: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          payment_amount: number
          timetable: string
          updated_at: string | null
          webinar_id: string | null
        }
        Insert: {
          class_name: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          payment_amount: number
          timetable: string
          updated_at?: string | null
          webinar_id?: string | null
        }
        Update: {
          class_name?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          payment_amount?: number
          timetable?: string
          updated_at?: string | null
          webinar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          class_id: string
          enrolled_at: string | null
          id: string
          is_active: boolean | null
          student_id: string
        }
        Insert: {
          class_id: string
          enrolled_at?: string | null
          id?: string
          is_active?: boolean | null
          student_id: string
        }
        Update: {
          class_id?: string
          enrolled_at?: string | null
          id?: string
          is_active?: boolean | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          name: string
          profile_image_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          name: string
          profile_image_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          name?: string
          profile_image_url?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          class_id: string
          created_at: string | null
          id: string
          month: string
          payment_slip_url: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          class_id: string
          created_at?: string | null
          id?: string
          month: string
          payment_slip_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          class_id?: string
          created_at?: string | null
          id?: string
          month?: string
          payment_slip_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      predefined_qna: {
        Row: {
          answer: string
          class_id: string
          created_at: string | null
          id: string
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          class_id: string
          created_at?: string | null
          id?: string
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          class_id?: string
          created_at?: string | null
          id?: string
          question?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predefined_qna_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          nic_no: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          role: Database["public"]["Enums"]["app_role"]
          telegram_no: string | null
          updated_at: string | null
          webinar_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          nic_no?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          role?: Database["public"]["Enums"]["app_role"]
          telegram_no?: string | null
          updated_at?: string | null
          webinar_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          nic_no?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          role?: Database["public"]["Enums"]["app_role"]
          telegram_no?: string | null
          updated_at?: string | null
          webinar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          role_name: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          role_name: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          role_name?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      webinars: {
        Row: {
          channel_link: string | null
          created_at: string | null
          csv_upload_url: string | null
          current_participants: number | null
          description: string | null
          id: string
          max_participants: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          channel_link?: string | null
          created_at?: string | null
          csv_upload_url?: string | null
          current_participants?: number | null
          description?: string | null
          id?: string
          max_participants?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          channel_link?: string | null
          created_at?: string | null
          csv_upload_url?: string | null
          current_participants?: number | null
          description?: string | null
          id?: string
          max_participants?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faq_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      faq_questions: {
        Row: {
          id: string;
          category_id: string | null;
          question: string;
          answer: string;
          is_active: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          question: string;
          answer: string;
          is_active?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          question?: string;
          answer?: string;
          is_active?: boolean | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "faq_questions_category_id_fkey",
            columns: ["category_id"],
            isOneToOne: false,
            referencedRelation: "faq_categories",
            referencedColumns: ["id"],
          },
        ];
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "admin" | "super_admin" | "student"
      payment_status: "pending" | "verified" | "rejected"
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
    : never,
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
    Enums: {
      app_role: ["admin", "super_admin", "student"],
      payment_status: ["pending", "verified", "rejected"],
    },
  },
} as const
