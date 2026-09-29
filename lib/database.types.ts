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
    PostgrestVersion: "14.5"
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
      capture: {
        Row: {
          cleared: boolean
          created_at: string
          id: string
          text: string
          user_id: string
        }
        Insert: {
          cleared?: boolean
          created_at?: string
          id?: string
          text: string
          user_id?: string
        }
        Update: {
          cleared?: boolean
          created_at?: string
          id?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      cycles: {
        Row: {
          created_at: string
          end_date: string
          id: string
          personal_project: string | null
          start_date: string
          status: string
          user_id: string
          why: string | null
          wig: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          personal_project?: string | null
          start_date: string
          status?: string
          user_id?: string
          why?: string | null
          wig: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          personal_project?: string | null
          start_date?: string
          status?: string
          user_id?: string
          why?: string | null
          wig?: string
        }
        Relationships: []
      }
      day_logs: {
        Row: {
          date: string
          done_min: boolean
          done_target: boolean
          habit_id: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          date: string
          done_min?: boolean
          done_target?: boolean
          habit_id: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Update: {
          date?: string
          done_min?: boolean
          done_target?: boolean
          habit_id?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "day_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      days: {
        Row: {
          bad_day: boolean
          barrier: string | null
          closed_at: string | null
          confirmed_at: string | null
          date: string
          energy: number | null
          khushu: number | null
          owned: string | null
          plan: Json | null
          shukr: string | null
          state: Database["public"]["Enums"]["day_state_enum"]
          user_id: string
          went_well: string | null
          went_wrong: string | null
        }
        Insert: {
          bad_day?: boolean
          barrier?: string | null
          closed_at?: string | null
          confirmed_at?: string | null
          date: string
          energy?: number | null
          khushu?: number | null
          owned?: string | null
          plan?: Json | null
          shukr?: string | null
          state?: Database["public"]["Enums"]["day_state_enum"]
          user_id?: string
          went_well?: string | null
          went_wrong?: string | null
        }
        Update: {
          bad_day?: boolean
          barrier?: string | null
          closed_at?: string | null
          confirmed_at?: string | null
          date?: string
          energy?: number | null
          khushu?: number | null
          owned?: string | null
          plan?: Json | null
          shukr?: string | null
          state?: Database["public"]["Enums"]["day_state_enum"]
          user_id?: string
          went_well?: string | null
          went_wrong?: string | null
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          block_key: string
          created_at: string
          date: string
          ended_at: string | null
          energy: Database["public"]["Enums"]["energy_enum"] | null
          id: string
          minutes: number
          mode: Database["public"]["Enums"]["focus_mode_enum"]
          project: string
          started_at: string
          user_id: string
        }
        Insert: {
          block_key: string
          created_at?: string
          date: string
          ended_at?: string | null
          energy?: Database["public"]["Enums"]["energy_enum"] | null
          id?: string
          minutes?: number
          mode?: Database["public"]["Enums"]["focus_mode_enum"]
          project: string
          started_at?: string
          user_id?: string
        }
        Update: {
          block_key?: string
          created_at?: string
          date?: string
          ended_at?: string | null
          energy?: Database["public"]["Enums"]["energy_enum"] | null
          id?: string
          minutes?: number
          mode?: Database["public"]["Enums"]["focus_mode_enum"]
          project?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habits: {
        Row: {
          active: boolean
          checkpoint: Database["public"]["Enums"]["checkpoint_enum"]
          created_at: string
          days: number[]
          deen_no_points: boolean
          id: string
          is_minimum: boolean
          key: string
          kind: Database["public"]["Enums"]["habit_kind_enum"]
          min_value: number | null
          name: string
          pillar: Database["public"]["Enums"]["pillar_enum"]
          sort: number
          target_from_week: number | null
          target_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          checkpoint: Database["public"]["Enums"]["checkpoint_enum"]
          created_at?: string
          days?: number[]
          deen_no_points?: boolean
          id?: string
          is_minimum?: boolean
          key: string
          kind: Database["public"]["Enums"]["habit_kind_enum"]
          min_value?: number | null
          name: string
          pillar: Database["public"]["Enums"]["pillar_enum"]
          sort?: number
          target_from_week?: number | null
          target_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          active?: boolean
          checkpoint?: Database["public"]["Enums"]["checkpoint_enum"]
          created_at?: string
          days?: number[]
          deen_no_points?: boolean
          id?: string
          is_minimum?: boolean
          key?: string
          kind?: Database["public"]["Enums"]["habit_kind_enum"]
          min_value?: number | null
          name?: string
          pillar?: Database["public"]["Enums"]["pillar_enum"]
          sort?: number
          target_from_week?: number | null
          target_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          body: string
          dedupe_key: string
          error: string | null
          id: string
          kind: string
          logical_date: string
          opened_at: string | null
          send_at: string
          sent_at: string | null
          status: Database["public"]["Enums"]["notif_status_enum"]
          title: string
          url: string
          user_id: string
        }
        Insert: {
          body: string
          dedupe_key: string
          error?: string | null
          id?: string
          kind: string
          logical_date: string
          opened_at?: string | null
          send_at: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notif_status_enum"]
          title: string
          url?: string
          user_id?: string
        }
        Update: {
          body?: string
          dedupe_key?: string
          error?: string | null
          id?: string
          kind?: string
          logical_date?: string
          opened_at?: string | null
          send_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notif_status_enum"]
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      parked: {
        Row: {
          created_at: string
          id: string
          note: string | null
          project: string
          revisit_on: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          project: string
          revisit_on?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          project?: string
          revisit_on?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          best_streak: number
          calc_method: string
          coach_tone: string
          created_at: string
          display_name: string
          freezes: number
          identity_text: string
          jamaat: Json
          lat: number
          lng: number
          madhab: string
          niyyah: string
          notif_prefs: Json
          streak: number
          tahajjud_days: number[]
          tz: string
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          calc_method?: string
          coach_tone?: string
          created_at?: string
          display_name?: string
          freezes?: number
          identity_text?: string
          jamaat?: Json
          lat?: number
          lng?: number
          madhab?: string
          niyyah?: string
          notif_prefs?: Json
          streak?: number
          tahajjud_days?: number[]
          tz?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          best_streak?: number
          calc_method?: string
          coach_tone?: string
          created_at?: string
          display_name?: string
          freezes?: number
          identity_text?: string
          jamaat?: Json
          lat?: number
          lng?: number
          madhab?: string
          niyyah?: string
          notif_prefs?: Json
          streak?: number
          tahajjud_days?: number[]
          tz?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          device_label: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          device_label?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id?: string
        }
        Update: {
          auth?: string
          created_at?: string
          device_label?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      routine_blocks: {
        Row: {
          active: boolean
          anchor: Database["public"]["Enums"]["checkpoint_enum"] | null
          anchor_offset_min: number | null
          days: number[]
          end_time: string | null
          id: string
          key: string
          kind: Database["public"]["Enums"]["block_kind_enum"]
          label: string
          project: string | null
          sort: number
          start_time: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          anchor?: Database["public"]["Enums"]["checkpoint_enum"] | null
          anchor_offset_min?: number | null
          days?: number[]
          end_time?: string | null
          id?: string
          key: string
          kind: Database["public"]["Enums"]["block_kind_enum"]
          label: string
          project?: string | null
          sort?: number
          start_time?: string | null
          user_id?: string
        }
        Update: {
          active?: boolean
          anchor?: Database["public"]["Enums"]["checkpoint_enum"] | null
          anchor_offset_min?: number | null
          days?: number[]
          end_time?: string | null
          id?: string
          key?: string
          kind?: Database["public"]["Enums"]["block_kind_enum"]
          label?: string
          project?: string | null
          sort?: number
          start_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weeks: {
        Row: {
          cycle_week: number
          kept_days: number
          next_focus: string | null
          phone_rules: Json | null
          review: Json | null
          roles: Json | null
          score: number
          shared_at: string | null
          user_id: string
          week_start: string
          win: boolean
        }
        Insert: {
          cycle_week: number
          kept_days?: number
          next_focus?: string | null
          phone_rules?: Json | null
          review?: Json | null
          roles?: Json | null
          score?: number
          shared_at?: string | null
          user_id?: string
          week_start: string
          win?: boolean
        }
        Update: {
          cycle_week?: number
          kept_days?: number
          next_focus?: string | null
          phone_rules?: Json | null
          review?: Json | null
          roles?: Json | null
          score?: number
          shared_at?: string | null
          user_id?: string
          week_start?: string
          win?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      seed_user: { Args: { p_uid: string }; Returns: undefined }
    }
    Enums: {
      block_kind_enum:
        | "salah"
        | "deep"
        | "ops"
        | "meeting"
        | "maker"
        | "rest"
        | "personal"
      checkpoint_enum: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "anytime"
      day_state_enum:
        | "kept"
        | "at_risk"
        | "comeback"
        | "frozen"
        | "missed"
        | "open"
      energy_enum: "low" | "okay" | "high"
      focus_mode_enum: "block" | "sixty_ten"
      habit_kind_enum: "bool" | "count" | "minutes"
      notif_status_enum: "pending" | "sent" | "skipped" | "failed"
      pillar_enum: "deen" | "body" | "build" | "business" | "growth" | "social"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      block_kind_enum: [
        "salah",
        "deep",
        "ops",
        "meeting",
        "maker",
        "rest",
        "personal",
      ],
      checkpoint_enum: ["fajr", "dhuhr", "asr", "maghrib", "isha", "anytime"],
      day_state_enum: [
        "kept",
        "at_risk",
        "comeback",
        "frozen",
        "missed",
        "open",
      ],
      energy_enum: ["low", "okay", "high"],
      focus_mode_enum: ["block", "sixty_ten"],
      habit_kind_enum: ["bool", "count", "minutes"],
      notif_status_enum: ["pending", "sent", "skipped", "failed"],
      pillar_enum: ["deen", "body", "build", "business", "growth", "social"],
    },
  },
} as const

export type CheckpointEnum = Database['public']['Enums']['checkpoint_enum'];
export type PillarEnum = Database['public']['Enums']['pillar_enum'];
export type HabitKindEnum = Database['public']['Enums']['habit_kind_enum'];
export type DayStateEnum = Database['public']['Enums']['day_state_enum'];
export type FocusModeEnum = Database['public']['Enums']['focus_mode_enum'];
export type EnergyEnum = Database['public']['Enums']['energy_enum'];
export type BlockKindEnum = Database['public']['Enums']['block_kind_enum'];
export type NotifStatusEnum = Database['public']['Enums']['notif_status_enum'];

