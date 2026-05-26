// ─── Supabase client — configured from environment ───

import { createClient } from "@supabase/supabase-js";

// These will be set via environment variables in production.
// For local dev (M1–M2), we load from local JSON — no Supabase dependency yet.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: undefined, // Use MMKV on native, localStorage on web
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Type-safe database types (will be regenerated from supabase after schema is applied) ───

export type Database = {
  public: {
    Tables: {
      programs: { Row: ProgramRow };
      units: { Row: UnitRow };
      lessons: { Row: LessonRow };
      profiles: { Row: ProfileRow };
      enrollments: { Row: EnrollmentRow };
      lesson_progress: { Row: LessonProgressRow };
      step_responses: { Row: StepResponseRow };
      streak_log: { Row: StreakLogRow };
    };
  };
};

export type ProgramRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  unit_label: string;
  artifact_label: string;
  level_names: unknown;
  journey_shape: string;
  created_at: string;
};

export type UnitRow = {
  id: string;
  program_id: string;
  order_num: number;
  label: string | null;
  title: string;
  theme: string | null;
  deliverable_id: string | null;
};

export type LessonRow = {
  id: string;
  unit_id: string;
  order_num: number;
  title: string;
  est_minutes: number | null;
  steps: unknown;
};

export type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
  goal: string | null;
  daily_mins: number | null;
  learn_time: string | null;
  streak: number;
  shield_count: number;
  xp: number;
  level: number;
  created_at: string;
};

export type EnrollmentRow = {
  id: string;
  user_id: string;
  program_id: string;
  started_at: string;
  current_unit_id: string | null;
};

export type LessonProgressRow = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
  xp_earned: number;
  score: number;
};

export type StepResponseRow = {
  id: string;
  user_id: string;
  lesson_id: string;
  step_id: string;
  response: unknown;
  correct: boolean | null;
  created_at: string;
};

export type StreakLogRow = {
  id: string;
  user_id: string;
  date: string;
  completed: boolean;
  shield_used: boolean;
};
