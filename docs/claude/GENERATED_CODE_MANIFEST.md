# Generated Code Manifest — Full Build-Out Batch

44 files generated, in repo paths, consistent with the existing contracts (tokens/`useTheme`, the engine + shell registries, the schema). Your Builder / Claude Code commits these — I can't push to the repo from here.

## Files by category

**Screens (9)** — `app/`
auth/login.tsx · auth/register.tsx · auth/forgot-password.tsx · profile/index.tsx · profile/settings.tsx · programs/index.tsx · pricing.tsx · checkout/[plan].tsx · (tabs)/dashboard.tsx

**Feedback / animation (7)** — `src/components/feedback/`
XpBurst · StreakFire · BadgeReveal · ConfettiOverlay · LevelUpModal · Toast (+ ToastProvider/useToast) · CompletionCelebration

**UI primitives (9)** — `src/components/ui/`
ProgressRing · Avatar · Modal · BottomSheet · EmptyState · LoadingSkeleton · SearchBar · Tooltip · TabBar
*(join the existing Button / Card / Field)*

**Data hooks (7)** — `src/data/`
useSubscription · useNotifications · useAnalytics · useLeaderboard · useStreakShield · useReviewQueue · useProgramCatalog

**Integration wrappers (4)** — `src/integrations/`
stripe · push · email · analytics

**Infrastructure (8)**
`supabase/edge-functions/`: stripe-webhook · send-reminder · streak-check
`infrastructure/`: push-server.js
`supabase/migrations/`: 0006_auth_tables · 0007_payments · 0008_shields · 0009_review_queue

## Before any of this runs — your inputs needed

**Migrations are PREVIEWS.** 0006–0009 are not applied. Review → approve → apply with the service key (your standing rule). Renumber if your repo is past 0009.

**External services need your keys / config (none are hardcoded):**
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs in `plans`; deploy `stripe-webhook` + a `create-checkout` edge fn.
- Push: install `expo-notifications`, finish `integrations/push.ts` (stubbed), set the Expo project ID.
- Email: a `send-email` edge fn + your provider key.
- Analytics: `EXPO_PUBLIC_ANALYTICS_URL` (or the provider snippet on web).

**Dependencies to add:** `react-native-svg` (ProgressRing), `@tanstack/react-query` (hooks), `expo-notifications`, `expo-server-sdk` (push-server), `stripe` (edge fn). `dashboard.tsx` imports `useProfile` from `src/data/queries` — wire that to your real profile query.

## Wiring notes
- Wrap the app in `ToastProvider` (in `app/_layout.tsx`) to use `useToast()`.
- Register `TabBar` via `tabBar={props => <TabBar {...props} />}` in `(tabs)/_layout.tsx`.
- `useReviewQueue`/`useStreakShield` rely on the 0008/0009 RPCs — apply those migrations first.

## Two honest flags (build-time, not blockers)
- **Leaderboard exposes other users' name + XP.** `useLeaderboard` reads a `leaderboard_view`; make that view opt-in and limited to non-sensitive fields before going live (privacy).
- **Day 1 is still the proof.** This is a lot of surface area on top of the core loop; if `ai_for_everyone` Day 1 isn't green yet, get it green first so this stack has a working foundation under it.

## Commit
```bash
# from your repo root, after copying these files into place:
git checkout -b feature/full-buildout
git add app src supabase infrastructure
git commit -m "Add screens, feedback, primitives, hooks, integrations, infra (preview migrations)"
git push origin feature/full-buildout
```
