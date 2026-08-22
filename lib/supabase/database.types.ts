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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assessment_results: {
        Row: {
          beyond_drafting: boolean
          built_workflow: boolean
          completed_at: string
          entry_level: string
          guidance_level: string
          id: string
          is_current: boolean
          user_id: string
          work_context: string
        }
        Insert: {
          beyond_drafting: boolean
          built_workflow: boolean
          completed_at?: string
          entry_level: string
          guidance_level: string
          id?: string
          is_current?: boolean
          user_id: string
          work_context: string
        }
        Update: {
          beyond_drafting?: boolean
          built_workflow?: boolean
          completed_at?: string
          entry_level?: string
          guidance_level?: string
          id?: string
          is_current?: boolean
          user_id?: string
          work_context?: string
        }
        Relationships: []
      }
      build_progress: {
        Row: {
          checked_criteria: number[]
          checked_steps: number[]
          completed_at: string | null
          path_id: string
          ran_workflow: boolean
          tool: string
          unit_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checked_criteria?: number[]
          checked_steps?: number[]
          completed_at?: string | null
          path_id: string
          ran_workflow?: boolean
          tool: string
          unit_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checked_criteria?: number[]
          checked_steps?: number[]
          completed_at?: string | null
          path_id?: string
          ran_workflow?: boolean
          tool?: string
          unit_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "build_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_modules: {
        Row: {
          module_id: number
          path_id: string
          position: number
          user_id: string
        }
        Insert: {
          module_id: number
          path_id: string
          position: number
          user_id: string
        }
        Update: {
          module_id?: number
          path_id?: string
          position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_modules_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          assessment_result_id: string
          completed_at: string | null
          content_version: number
          id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_result_id: string
          completed_at?: string | null
          content_version?: number
          id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_result_id?: string
          completed_at?: string | null
          content_version?: number
          id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_assessment_result_id_fkey"
            columns: ["assessment_result_id"]
            isOneToOne: false
            referencedRelation: "assessment_results"
            referencedColumns: ["id"]
          },
        ]
      }
      local_state_imports: {
        Row: {
          idempotency_key: string
          imported_at: string
          user_id: string
        }
        Insert: {
          idempotency_key: string
          imported_at?: string
          user_id: string
        }
        Update: {
          idempotency_key?: string
          imported_at?: string
          user_id?: string
        }
        Relationships: []
      }
      practice_progress: {
        Row: {
          checked_rules: number[]
          completed_at: string | null
          path_id: string
          reflections: Json
          revealed_hints: number
          unit_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checked_rules?: number[]
          completed_at?: string | null
          path_id: string
          reflections?: Json
          revealed_hints?: number
          unit_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checked_rules?: number[]
          completed_at?: string | null
          path_id?: string
          reflections?: Json
          revealed_hints?: number
          unit_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          daily_nudge_enabled: boolean
          first_name: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_nudge_enabled?: boolean
          first_name?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_nudge_enabled?: boolean
          first_name?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: number[]
          attempt_number: number
          id: string
          path_id: string
          score: number
          submitted_at: string
          unit_id: string
          user_id: string
        }
        Insert: {
          answers: number[]
          attempt_number: number
          id?: string
          path_id: string
          score: number
          submitted_at?: string
          unit_id: string
          user_id: string
        }
        Update: {
          answers?: number[]
          attempt_number?: number
          id?: string
          path_id?: string
          score?: number
          submitted_at?: string
          unit_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_progress: {
        Row: {
          completed_at: string | null
          path_id: string
          started_at: string | null
          status: string
          unit_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          path_id: string
          started_at?: string | null
          status: string
          unit_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          path_id?: string
          started_at?: string | null
          status?: string
          unit_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_local_state_import: {
        Args: { p_idempotency_key: string }
        Returns: boolean
      }
      submit_assessment: {
        Args: {
          p_beyond_drafting: boolean
          p_built_workflow: boolean
          p_entry_level: string
          p_guidance_level: string
          p_module_ids: number[]
          p_work_context: string
        }
        Returns: string
      }
      submit_quiz_attempt: {
        Args: {
          p_answers: number[]
          p_path_id: string
          p_score: number
          p_unit_id: string
        }
        Returns: undefined
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
