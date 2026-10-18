export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      access_passes: {
        Row: {
          access_days: number;
          created_at: string;
          environment: string;
          expires_at: string;
          id: string;
          payment_customer_id: string | null;
          payment_session_id: string;
          price_id: string;
          starts_at: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          access_days: number;
          created_at?: string;
          environment?: string;
          expires_at: string;
          id?: string;
          payment_customer_id?: string | null;
          payment_session_id: string;
          price_id: string;
          starts_at?: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          access_days?: number;
          created_at?: string;
          environment?: string;
          expires_at?: string;
          id?: string;
          payment_customer_id?: string | null;
          payment_session_id?: string;
          price_id?: string;
          starts_at?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      student_profiles: {
        Row: {
          user_id: string;
          student_public_id: string;
          display_name: string;
          certificate_name: string;
          selected_level: "junior" | "explorer" | "astronomer";
          preferred_language: string;
          age_bracket: "under_13" | "13_to_17" | "18_plus";
          guardian_consent_status:
            "not_required" | "pending_guardian" | "guardian_consented" | "verified_adult";
          guardian_email: string | null;
          guardian_consent_date: string | null;
          profile_visibility: "private" | "students_only" | "public";
          accessibility_settings: Json;
          learning_settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          student_public_id: string;
          display_name?: string;
          certificate_name?: string;
          selected_level?: "junior" | "explorer" | "astronomer";
          preferred_language?: string;
          age_bracket?: "under_13" | "13_to_17" | "18_plus";
          guardian_consent_status?:
            "not_required" | "pending_guardian" | "guardian_consented" | "verified_adult";
          guardian_email?: string | null;
          guardian_consent_date?: string | null;
          profile_visibility?: "private" | "students_only" | "public";
          accessibility_settings?: Json;
          learning_settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          student_public_id?: string;
          display_name?: string;
          certificate_name?: string;
          selected_level?: "junior" | "explorer" | "astronomer";
          preferred_language?: string;
          age_bracket?: "under_13" | "13_to_17" | "18_plus";
          guardian_consent_status?:
            "not_required" | "pending_guardian" | "guardian_consented" | "verified_adult";
          guardian_email?: string | null;
          guardian_consent_date?: string | null;
          profile_visibility?: "private" | "students_only" | "public";
          accessibility_settings?: Json;
          learning_settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      academy_module_progress: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          status: "not_started" | "in_progress" | "completed";
          percent: number;
          time_spent_seconds: number;
          verified_quiz_passed: boolean;
          first_started_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          status?: "not_started" | "in_progress" | "completed";
          percent?: number;
          time_spent_seconds?: number;
          verified_quiz_passed?: boolean;
          first_started_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          module_id?: string;
          status?: "not_started" | "in_progress" | "completed";
          percent?: number;
          time_spent_seconds?: number;
          verified_quiz_passed?: boolean;
          first_started_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      academy_stage_badges: {
        Row: {
          id: string;
          user_id: string;
          stage_id: number;
          badge_id: string;
          awarded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stage_id: number;
          badge_id: string;
          awarded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stage_id?: number;
          badge_id?: string;
          awarded_at?: string;
        };
        Relationships: [];
      };
      academy_courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          total_stages: number;
          total_modules: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          slug: string;
          description: string;
          total_stages?: number;
          total_modules?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          total_stages?: number;
          total_modules?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      academy_course_versions: {
        Row: {
          id: string;
          course_id: string;
          version: string;
          status: "draft" | "active" | "deprecated" | "archived";
          curriculum_metadata: Json;
          passing_exam_threshold: number;
          published_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          version: string;
          status?: "draft" | "active" | "deprecated" | "archived";
          curriculum_metadata?: Json;
          passing_exam_threshold?: number;
          published_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          version?: string;
          status?: "draft" | "active" | "deprecated" | "archived";
          curriculum_metadata?: Json;
          passing_exam_threshold?: number;
          published_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      academy_modules: {
        Row: {
          id: string;
          course_id: string;
          stage_id: number;
          number: number;
          slug: string;
          title: string;
          subtitle: string;
          description: string;
          estimated_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          course_id: string;
          stage_id: number;
          number: number;
          slug: string;
          title: string;
          subtitle: string;
          description: string;
          estimated_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          stage_id?: number;
          number?: number;
          slug?: string;
          title?: string;
          subtitle?: string;
          description?: string;
          estimated_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      academy_module_versions: {
        Row: {
          id: string;
          module_id: string;
          version: string;
          completion_rule_version: string;
          required_evidence_types: string[];
          minimum_quiz_score_pct: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          version?: string;
          completion_rule_version?: string;
          required_evidence_types?: string[];
          minimum_quiz_score_pct?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          version?: string;
          completion_rule_version?: string;
          required_evidence_types?: string[];
          minimum_quiz_score_pct?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      academy_lessons: {
        Row: {
          id: string;
          module_id: string;
          order_index: number;
          title: string;
          visualization_type: string;
          objectives: string[];
          created_at: string;
        };
        Insert: {
          id: string;
          module_id: string;
          order_index?: number;
          title: string;
          visualization_type: string;
          objectives?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          order_index?: number;
          title?: string;
          visualization_type?: string;
          objectives?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      academy_enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          course_version: string;
          enrolled_at: string;
          status: "active" | "paused" | "completed";
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          course_version?: string;
          enrolled_at?: string;
          status?: "active" | "paused" | "completed";
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          course_version?: string;
          enrolled_at?: string;
          status?: "active" | "paused" | "completed";
        };
        Relationships: [];
      };
      academy_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          lesson_id: string;
          scroll_depth_percent: number;
          time_spent_seconds: number;
          is_bookmarked: boolean;
          last_accessed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          lesson_id: string;
          scroll_depth_percent?: number;
          time_spent_seconds?: number;
          is_bookmarked?: boolean;
          last_accessed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          module_id?: string;
          lesson_id?: string;
          scroll_depth_percent?: number;
          time_spent_seconds?: number;
          is_bookmarked?: boolean;
          last_accessed_at?: string;
        };
        Relationships: [];
      };
      academy_activity_evidence: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          activity_type: string;
          evidence_payload: Json;
          client_timestamp: string;
          verification_status: "submitted" | "verified" | "rejected";
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          activity_type: string;
          evidence_payload?: Json;
          client_timestamp: string;
          verification_status?: "submitted" | "verified" | "rejected";
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          module_id?: string;
          activity_type?: string;
          evidence_payload?: Json;
          client_timestamp?: string;
          verification_status?: "submitted" | "verified" | "rejected";
          verified_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      academy_assessment_attempts: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string;
          assessment_version: string;
          question_set_version: string;
          assigned_question_ids: string[];
          answers_payload: Json;
          score: number;
          total_points: number;
          percentage: number;
          passed: boolean;
          client_duration_seconds: number | null;
          idempotency_key: string | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assessment_id: string;
          assessment_version?: string;
          question_set_version?: string;
          assigned_question_ids?: string[];
          answers_payload: Json;
          score: number;
          total_points: number;
          percentage: number;
          passed: boolean;
          client_duration_seconds?: number | null;
          idempotency_key?: string | null;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assessment_id?: string;
          assessment_version?: string;
          question_set_version?: string;
          assigned_question_ids?: string[];
          answers_payload?: Json;
          score?: number;
          total_points?: number;
          percentage?: number;
          passed?: boolean;
          client_duration_seconds?: number | null;
          idempotency_key?: string | null;
          submitted_at?: string;
        };
        Relationships: [];
      };
      academy_verified_completions: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          module_version: string;
          approved_rule_version: string;
          qualifying_assessment_attempt_id: string | null;
          qualifying_evidence_ids: string[];
          verified_at: string;
          idempotency_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          module_version?: string;
          approved_rule_version?: string;
          qualifying_assessment_attempt_id?: string | null;
          qualifying_evidence_ids?: string[];
          verified_at?: string;
          idempotency_key: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          module_id?: string;
          module_version?: string;
          approved_rule_version?: string;
          qualifying_assessment_attempt_id?: string | null;
          qualifying_evidence_ids?: string[];
          verified_at?: string;
          idempotency_key?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      academy_stage_achievements: {
        Row: {
          id: string;
          user_id: string;
          stage_id: number;
          badge_id: string;
          stage_rule_version: string;
          qualifying_module_ids: string[];
          awarded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stage_id: number;
          badge_id: string;
          stage_rule_version?: string;
          qualifying_module_ids: string[];
          awarded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stage_id?: number;
          badge_id?: string;
          stage_rule_version?: string;
          qualifying_module_ids?: string[];
          awarded_at?: string;
        };
        Relationships: [];
      };
      academy_certificate_eligibility: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          course_version: string;
          all_stages_completed: boolean;
          final_exam_passed: boolean;
          final_exam_score_pct: number | null;
          eligible_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          course_version?: string;
          all_stages_completed?: boolean;
          final_exam_passed?: boolean;
          final_exam_score_pct?: number | null;
          eligible_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          course_version?: string;
          all_stages_completed?: boolean;
          final_exam_passed?: boolean;
          final_exam_score_pct?: number | null;
          eligible_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      academy_certificates: {
        Row: {
          id: string;
          certificate_number: string;
          user_id: string;
          student_public_id: string;
          display_name: string;
          certificate_name: string;
          learning_level: "junior" | "explorer" | "astronomer";
          course_id: string;
          course_version: string;
          curriculum_version: string;
          final_score_percentage: number;
          issue_date: string;
          verification_hash: string;
          status: "active" | "revoked" | "superseded";
          revocation_reason: string | null;
          revoked_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          certificate_number: string;
          user_id: string;
          student_public_id: string;
          display_name: string;
          certificate_name: string;
          learning_level: "junior" | "explorer" | "astronomer";
          course_id: string;
          course_version: string;
          curriculum_version?: string;
          final_score_percentage: number;
          issue_date?: string;
          verification_hash: string;
          status?: "active" | "revoked" | "superseded";
          revocation_reason?: string | null;
          revoked_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          certificate_number?: string;
          user_id?: string;
          student_public_id?: string;
          display_name?: string;
          certificate_name?: string;
          learning_level?: "junior" | "explorer" | "astronomer";
          course_id?: string;
          course_version?: string;
          curriculum_version?: string;
          final_score_percentage?: number;
          issue_date?: string;
          verification_hash?: string;
          status?: "active" | "revoked" | "superseded";
          revocation_reason?: string | null;
          revoked_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      academy_audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_role: "student" | "service_role" | "admin" | "system";
          action: string;
          entity_type: string;
          entity_id: string;
          previous_state: Json | null;
          new_state: Json | null;
          ip_hash: string | null;
          user_agent_hash: string | null;
          idempotency_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_role: "student" | "service_role" | "admin" | "system";
          action: string;
          entity_type: string;
          entity_id: string;
          previous_state?: Json | null;
          new_state?: Json | null;
          ip_hash?: string | null;
          user_agent_hash?: string | null;
          idempotency_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_role?: "student" | "service_role" | "admin" | "system";
          action?: string;
          entity_type?: string;
          entity_id?: string;
          previous_state?: Json | null;
          new_state?: Json | null;
          ip_hash?: string | null;
          user_agent_hash?: string | null;
          idempotency_key?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      apply_access_purchase: {
        Args: {
          p_access_days: number;
          p_environment: string;
          p_payment_customer_id: string;
          p_payment_session_id: string;
          p_price_id: string;
          p_user_id: string;
        };
        Returns: string;
      };
      has_active_access: { Args: { check_env?: string }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
