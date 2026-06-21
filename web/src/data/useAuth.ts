import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthState {
  session: Session | null
  user: User | null
  isLoading: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string) => {
    const emailRedirectTo = window.location.origin
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, onboarded: false },
        emailRedirectTo,
      },
    })

    if (error) {
      const friendly: Record<string, string> = {
        'email rate limit exceeded': 'Too many signup attempts. Please wait a minute.',
        over_email_send_rate_limit: 'Too many signup attempts. Please wait a minute.',
        'user already registered': 'An account with this email already exists. Sign in instead.',
      }
      const msg = error.message.toLowerCase()
      for (const [key, replacement] of Object.entries(friendly)) {
        if (msg.includes(key)) return { error: replacement }
      }
      return { error: error.message }
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: 'An account with this email already exists. Sign in instead.' }
    }

    if (data.user) {
      await supabase.from('profiles').upsert(
        { id: data.user.id, email: data.user.email, name: name || '' },
        { onConflict: 'id' },
      )
    }

    const needsConfirmation = !data.session && !!data.user
    return { needsConfirmation }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) return { error: error.message }
    return {}
  }, [])

  const user = session?.user ?? null

  return { session, user, isLoading, signInWithEmail, signUpWithEmail, signOut, resetPassword }
}
