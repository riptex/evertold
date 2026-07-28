// Hand-authored to match the exact shape `supabase gen types typescript`
// produces, transcribed directly from supabase/migrations/0001_core_tables.sql
// (verified against a real Postgres instance — see supabase/tests/).
//
// This is a stand-in, not a permanent arrangement: `supabase gen types`
// requires Docker (confirmed against CLI 2.110.0 and 1.226.4, even with
// --db-url — it shells out to a container for introspection regardless),
// which wasn't available in the sandbox this was written in. Regenerate
// for real the first time this repo is touched somewhere with Docker:
//
//   supabase gen types typescript --local > lib/supabase/types.ts
//
// `Relationships` arrays are left empty here (real generated output
// populates them from foreign keys, used for `.select('*, table(*)')`
// embedding type inference) — everything else matches the real shape,
// so basic CRUD stays fully typed until the real generation happens.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      circles: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          circle_id: string;
          user_id: string;
          role: "organizer" | "member" | "viewer";
          created_at: string;
        };
        Insert: {
          id?: string;
          circle_id: string;
          user_id: string;
          role: "organizer" | "member" | "viewer";
          created_at?: string;
        };
        Update: {
          id?: string;
          circle_id?: string;
          user_id?: string;
          role?: "organizer" | "member" | "viewer";
          created_at?: string;
        };
        Relationships: [];
      };
      storytellers: {
        Row: {
          id: string;
          circle_id: string;
          user_id: string | null;
          display_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          circle_id: string;
          user_id?: string | null;
          display_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          circle_id?: string;
          user_id?: string | null;
          display_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      storyteller_device_sessions: {
        Row: {
          id: string;
          storyteller_id: string;
          device_id: string;
          created_by: string;
          created_at: string;
          last_seen_at: string | null;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          storyteller_id: string;
          device_id: string;
          created_by: string;
          created_at?: string;
          last_seen_at?: string | null;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          storyteller_id?: string;
          device_id?: string;
          created_by?: string;
          created_at?: string;
          last_seen_at?: string | null;
          revoked_at?: string | null;
        };
        Relationships: [];
      };
      prompt_packs: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          sort_order: number;
          is_free: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          sort_order?: number;
          is_free?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          sort_order?: number;
          is_free?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      prompts: {
        Row: {
          id: string;
          prompt_pack_id: string;
          text: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          prompt_pack_id: string;
          text: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          prompt_pack_id?: string;
          text?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      family_questions: {
        Row: {
          id: string;
          circle_id: string;
          submitted_by: string;
          text: string;
          status: "pending" | "answered" | "dismissed";
          answered_story_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          circle_id: string;
          submitted_by: string;
          text: string;
          status?: "pending" | "answered" | "dismissed";
          answered_story_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          circle_id?: string;
          submitted_by?: string;
          text?: string;
          status?: "pending" | "answered" | "dismissed";
          answered_story_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      stories: {
        Row: {
          id: string;
          circle_id: string;
          storyteller_id: string;
          title: string | null;
          transcript: string | null;
          chapter: string | null;
          audio_storage_path: string | null;
          duration_seconds: number | null;
          capture_mode: "voice" | "interview" | "photo_voice" | "typed";
          source_prompt_id: string | null;
          source_question_id: string | null;
          status: "recording" | "uploading" | "processing" | "ready" | "failed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          circle_id: string;
          storyteller_id: string;
          title?: string | null;
          transcript?: string | null;
          chapter?: string | null;
          audio_storage_path?: string | null;
          duration_seconds?: number | null;
          capture_mode: "voice" | "interview" | "photo_voice" | "typed";
          source_prompt_id?: string | null;
          source_question_id?: string | null;
          status?:
            "recording" | "uploading" | "processing" | "ready" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          circle_id?: string;
          storyteller_id?: string;
          title?: string | null;
          transcript?: string | null;
          chapter?: string | null;
          audio_storage_path?: string | null;
          duration_seconds?: number | null;
          capture_mode?: "voice" | "interview" | "photo_voice" | "typed";
          source_prompt_id?: string | null;
          source_question_id?: string | null;
          status?:
            "recording" | "uploading" | "processing" | "ready" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      story_media: {
        Row: {
          id: string;
          story_id: string;
          circle_id: string;
          media_type: "photo" | "video";
          storage_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          circle_id: string;
          media_type: "photo" | "video";
          storage_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          circle_id?: string;
          media_type?: "photo" | "video";
          storage_path?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reactions: {
        Row: {
          id: string;
          story_id: string;
          circle_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          circle_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          circle_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          story_id: string;
          circle_id: string;
          user_id: string;
          comment_type: "text" | "voice";
          body: string | null;
          audio_storage_path: string | null;
          duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          circle_id: string;
          user_id: string;
          comment_type: "text" | "voice";
          body?: string | null;
          audio_storage_path?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          circle_id?: string;
          user_id?: string;
          comment_type?: "text" | "voice";
          body?: string | null;
          audio_storage_path?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      time_capsules: {
        Row: {
          id: string;
          circle_id: string;
          storyteller_id: string;
          title: string;
          audio_storage_path: string;
          unlock_at: string;
          unlock_recipient_user_id: string | null;
          created_by: string;
          unlocked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          circle_id: string;
          storyteller_id: string;
          title: string;
          audio_storage_path: string;
          unlock_at: string;
          unlock_recipient_user_id?: string | null;
          created_by: string;
          unlocked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          circle_id?: string;
          storyteller_id?: string;
          title?: string;
          audio_storage_path?: string;
          unlock_at?: string;
          unlock_recipient_user_id?: string | null;
          created_by?: string;
          unlocked_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          circle_id: string;
          revenuecat_subscriber_id: string;
          status: "active" | "trialing" | "canceled" | "expired" | "gifted";
          plan: "monthly" | "annual" | null;
          current_period_end: string | null;
          purchasing_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          circle_id: string;
          revenuecat_subscriber_id: string;
          status: "active" | "trialing" | "canceled" | "expired" | "gifted";
          plan?: "monthly" | "annual" | null;
          current_period_end?: string | null;
          purchasing_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          circle_id?: string;
          revenuecat_subscriber_id?: string;
          status?: "active" | "trialing" | "canceled" | "expired" | "gifted";
          plan?: "monthly" | "annual" | null;
          current_period_end?: string | null;
          purchasing_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          circle_id: string;
          ordered_by_user_id: string;
          order_type: "book" | "qr_card" | "legacy_vault";
          status: "pending" | "processing" | "shipped" | "delivered" | "failed";
          external_order_id: string | null;
          amount_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          circle_id: string;
          ordered_by_user_id: string;
          order_type: "book" | "qr_card" | "legacy_vault";
          status?:
            "pending" | "processing" | "shipped" | "delivered" | "failed";
          external_order_id?: string | null;
          amount_cents: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          circle_id?: string;
          ordered_by_user_id?: string;
          order_type?: "book" | "qr_card" | "legacy_vault";
          status?:
            "pending" | "processing" | "shipped" | "delivered" | "failed";
          external_order_id?: string | null;
          amount_cents?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // Deferred to v3 — RLS is enabled with zero policies (deny-by-default),
      // so this table is inaccessible via the client SDK regardless of the
      // type shape. See docs/architecture/data-model.md §6.
      voice_consents: {
        Row: {
          id: string;
          storyteller_id: string;
          consented_by_user_id: string;
          consent_recording_storage_path: string;
          scope: string;
          created_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          storyteller_id: string;
          consented_by_user_id: string;
          consent_recording_storage_path: string;
          scope: string;
          created_at?: string;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          storyteller_id?: string;
          consented_by_user_id?: string;
          consent_recording_storage_path?: string;
          scope?: string;
          created_at?: string;
          revoked_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    // is_circle_member / circle_role / is_storyteller_session exist in the
    // database (see 0002_helper_functions.sql) but are RLS-policy helpers,
    // not part of the client-facing API surface — not typed here as
    // callable RPCs.
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
