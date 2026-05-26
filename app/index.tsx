// ─── Index — redirect to onboarding (first-time) or home ───

import { Redirect } from "expo-router";

export default function Index() {
  // For now, always go to onboarding. When auth is wired, check if profile exists.
  return <Redirect href="/onboard" />;
}
