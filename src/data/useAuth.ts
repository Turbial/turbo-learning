// ─── Auth hook — anonymous sign-in + session management ───

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAnonymous: boolean;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAnonymously = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("Anonymous sign-in failed:", error.message);
      setIsLoading(false);
      return;
    }
    // Session will be updated via onAuthStateChange
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const user = session?.user ?? null;
  const isAnonymous = user?.is_anonymous ?? false;

  return {
    session,
    user,
    isLoading,
    isAnonymous,
    signInAnonymously,
    signOut,
  };
}
