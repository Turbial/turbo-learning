// ─── Supabase client — configured for anon auth + TanStack Query ───

import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// EXPO_PUBLIC_ vars are inlined by EAS Build (native) and Metro (web).
// Fallbacks exist for local `npx expo export` where inlining may not apply.
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  "https://afgmlkduuapquqkcqdsk.supabase.co";

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZ21sa2R1dWFwcXVxa2NxZHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDA2NzYsImV4cCI6MjA5MzkxNjY3Nn0.-WQ34Jxy9CmI-SsQfcMNWPZi5AfZCzv9jZHDQ6ccEWc";

if (!supabaseUrl) throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL");
if (!supabaseAnonKey) throw new Error("Missing EXPO_PUBLIC_SUPABASE_ANON_KEY");

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

// Stripe publishable key — safe for client-side
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
  "pk_live_51PoJ6MKz6MSMiK7wYjNTYkcLxHkNdqUFNbj9jGJh0SbiSQY0aO4JAd2KfP0E7mJJ2eMIrI8QLJU2q3bTL5ApkUL5";
