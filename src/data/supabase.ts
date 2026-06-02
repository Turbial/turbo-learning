// ─── Supabase client — configured for anon auth + TanStack Query ───

import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// EXPO_PUBLIC_ vars are inlined by EAS Build (native) and Metro (web).
// Copy .env.example → .env.local and fill in your project values.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL — copy .env.example to .env.local");
if (!supabaseAnonKey) throw new Error("Missing EXPO_PUBLIC_SUPABASE_ANON_KEY — copy .env.example to .env.local");

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

// Stripe publishable key — safe for client-side, but must not be hardcoded.
// Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local.
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
