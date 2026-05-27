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
