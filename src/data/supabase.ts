// ─── Supabase client — configured for anon auth + TanStack Query ───

import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://afgmlkduuapquqkcqdsk.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZ21sa2R1dWFwcXVxa2NxZHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDA2NzYsImV4cCI6MjA5MzkxNjY3Nn0.-WQ34Jxy9CmI-SsQfcMNWPZi5AfZCzv9jZHDQ6ccEWc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Re-export for convenience
export type { Session, User } from "@supabase/supabase-js";
