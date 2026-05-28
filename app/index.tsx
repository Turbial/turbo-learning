// ─── Index — redirect based on auth + onboarding state ───

import { Redirect } from "expo-router";
import { useAuth } from "../src/data/useAuth";

export default function Index() {
  const { user, isLoading } = useAuth();

  // While loading, stay here (AuthGate shows the spinner)
  if (isLoading) return null;

  // Authenticated → go to onboard (which handles first-time vs returning)
  // Unauthenticated users never reach here (AuthGate redirects to /auth/login)
  if (user) {
    return <Redirect href="/onboard" />;
  }

  // Fallback (shouldn't normally be reached since AuthGate handles this)
  return <Redirect href="/auth/login" />;
}
