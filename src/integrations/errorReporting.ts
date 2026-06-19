// src/integrations/errorReporting.ts — Sentry wrapper
// JS-only error tracking (no native symbolication without EAS build config plugin).
// Set EXPO_PUBLIC_SENTRY_DSN to enable. Silently no-ops when unset.

import * as Sentry from "@sentry/react-native";

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initErrorReporting() {
  if (!DSN) return;
  Sentry.init({
    dsn: DSN,
    environment: process.env.NODE_ENV ?? "production",
    tracesSampleRate: 0.1,
    enableNativeNagger: false,
    enableNativeCrashHandling: false,
  });
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!DSN) return;
  if (error instanceof Error) {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } else {
    Sentry.captureMessage(String(error), "error");
  }
}

export function setUserContext(userId: string, email?: string) {
  if (!DSN) return;
  Sentry.setUser({ id: userId, email });
}

export function clearUserContext() {
  if (!DSN) return;
  Sentry.setUser(null);
}
