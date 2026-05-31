// ─── Auth hook — email/password sign-in + session management ───

import { useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import { supabase } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

// Resolve the app origin for email redirect links (verification, reset, etc.)
function getAppOrigin(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }
  // Native mobile — use the scheme defined in app.json
  return "turbo-learning://";
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>;
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      // Session will be updated via onAuthStateChange
      return {};
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, name: string) => {
      // Resolve app origin at call time so the redirect works from any
      // deployment (dev, staging, production) without the stale SITE_URL.
      const emailRedirectTo = getAppOrigin();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo,
        },
      });
      if (error) {
        // Map raw Supabase errors to user-friendly messages.
        const friendly: Record<string, string> = {
          "email rate limit exceeded":
            "Too many signup attempts. Please wait a minute before trying again.",
          "over_email_send_rate_limit":
            "Too many signup attempts. Please wait a minute before trying again.",
          "User already registered":
            "An account with this email already exists. Sign in instead.",
        };
        const msg = error.message.toLowerCase();
        for (const [key, replacement] of Object.entries(friendly)) {
          if (msg.includes(key)) return { error: replacement };
        }
        return { error: error.message };
      }

      // Detect duplicate signup: Supabase returns a fake/obfuscated user with
      // empty identities when the email is already registered (to prevent email
      // enumeration). Show a clear message instead of the misleading
      // "check your email" screen.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { error: "An account with this email already exists. Sign in instead." };
      }

      // Create profile row so complete_lesson RPC works
      if (data.user) {
        const { error: profileErr } = await supabase.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email,
          name: name || "",
        }, { onConflict: "id" });
        if (profileErr) console.warn("Profile creation warning:", profileErr.message);
      }

      // If mailer_autoconfirm is on, session is created immediately.
      // If not, user exists but session is null — they need to confirm email.
      const needsConfirmation = !data.session && !!data.user;
      return { needsConfirmation };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const user = session?.user ?? null;

  return {
    session,
    user,
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
}
