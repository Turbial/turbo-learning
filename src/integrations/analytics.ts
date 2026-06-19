// integrations/analytics.ts — Plausible/PostHog wrapper (set keys via env).
// Web uses the provider snippet; native posts events to your analytics endpoint.
const ENDPOINT = process.env.EXPO_PUBLIC_ANALYTICS_URL;

export function track(event: string, props?: Record<string, unknown>) {
  if (!ENDPOINT) { if (__DEV__) console.log('[analytics]', event, props ?? {}); return; }
  fetch(ENDPOINT, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, props, ts: Date.now() }),
  }).catch(() => {});
}
export function identify(userId: string, traits?: Record<string, unknown>) {
  track('$identify', { userId, ...traits });
}

export type TrackEvent =
  | { name: 'onboarding_started' }
  | { name: 'onboarding_completed'; goal: string; dailyMins: number; learnTime: string }
  | { name: 'lesson_started'; programSlug: string; unitOrder: number; lessonId: string }
  | { name: 'step_completed'; stepType: string; correct?: boolean; xpEarned: number; comboStreak: number }
  | { name: 'lesson_completed'; programSlug: string; unitOrder: number; sessionXp: number; score: number; durationMs: number }
  | { name: 'lesson_abandoned'; stepIndex: number; stepsTotal: number }
  | { name: 'streak_extended'; streakDays: number }
  | { name: 'streak_broken'; streakDays: number; hadShield: boolean }
  | { name: 'subscription_started'; plan: string; provider: 'stripe' | 'paypal' }
  | { name: 'subscription_cancelled'; plan: string }
  | { name: 'program_enrolled'; programSlug: string }
  | { name: 'program_completed'; programSlug: string; totalDays: number }
  | { name: 'push_permission_granted' }
  | { name: 'push_permission_denied' };

export function trackEvent(event: TrackEvent): void {
  track(event.name, event);
}
