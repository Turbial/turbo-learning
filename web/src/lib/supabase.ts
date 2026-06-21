import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://afgmlkduuapquqkcqdsk.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZ21sa2R1dWFwcXVxa2NxZHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDA2NzYsImV4cCI6MjA5MzkxNjY3Nn0.-WQ34Jxy9CmI-SsQfcMNWPZi5AfZCzv9jZHDQ6ccEWc'

// Web version — uses localStorage by default (no AsyncStorage needed)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type { Session, User } from '@supabase/supabase-js'

export const STRIPE_PUBLISHABLE_KEY =
  'pk_live_51PoJ6MKz6MSMiK7wYjNTYkcLxHkNdqUFNbj9jGJh0SbiSQY0aO4JAd2KfP0E7mJJ2eMIrI8QLJU2q3bTL5ApkUL5'
