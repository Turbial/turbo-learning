# Turbo Learning — Status Handoff (2026-05-30)

**Deployed:** http://178.105.166.126:3092
**Repo:** github.com/Turbial/turbo-learning
**Stack:** Expo (React Native Web) + Supabase + Stripe + PayPal

---

## What's Complete

### Core Engine
- 21 step types registered (info, scenario_card, example, mc, tf, highlight, good_fit, fillblank, match, quiz, builder, copy_action, paste_capture, compare, reflection, chat, prompt_generator, badge_unlock, streak_commitment, reminder_setup, completion)
- LessonPlayer state machine — generic progression driver
- Scoring engine (XP formula: floor(sqrt(xp/100))+1)
- Error boundary on every step — crashes show "Skip this step"

### Auth
- Email/password registration + login + forgot password
- Auto profile creation via DB trigger (migration 0010)
- Onboarding flow: name → goal → daily commitment
- AuthGate: unauth → login, auth → onboard, onboard done → home

### Content
- AI Operator: 28 units in Supabase (days 1-28 with full step data)
- DUO: 28 units in Supabase
- Local JSON fallback (days 1-7 for both programs)
- Anon read policies on programs/units/lessons (migration 0012)

### UI
- 4 tabs: Journey (28-day weeks view), Progress (XP/streak/badges), Ranks (leaderboard), Dashboard (stats grid)
- Profile page (edit name, goal, badges display, streak shields)
- Settings (sign-out, notification prefs)
- Programs catalog (browse + enroll)
- Pricing page (free + pro plans)

### Gamification
- XP tracking + level calculation
- Streak system with daily log
- Badges: first_day, week_streak, two_week_streak (auto-awarded in complete_lesson RPC)
- Leaderboard (XP ranked)
- Streak shield purchases
- Streak-at-risk detection + warning banner
- Completion celebration with XP burst + level-up modal + badge reveal

### Payments
- Stripe: product `prod_UbxCqRSvYS16tK`, monthly price `price_1TcjI7Kz6MSMiK7w1NQOcXqI`, annual price `price_1TcjI8Kz6MSMiK7wbjfZnI11`
- Stripe edge functions: create-checkout (v6), stripe-webhook (v4) — both deployed and active
- PayPal edge functions: paypal-checkout (v1), paypal-webhook (v1) — deployed, need credentials
- Plans table aligned: slug, price_monthly_usd, stripe_price_id
- Checkout flow: dual payment method (card via Stripe, PayPal when keys set)

### Supabase Edge Functions (16 active)
create-checkout, stripe-webhook, paypal-checkout, paypal-webhook,
emailjs-webhook, track, track-open, mailgun-webhook, unsubscribe,
notify-handoff, script-review, duo-checkout, analyze-food,
search-food, lookup-barcode, test-ping

---

## To Activate PayPal
1. Go to https://developer.paypal.com/dashboard/applications
2. Create REST API app "Turbo Learning"
3. Set secrets:
   ```
   supabase secrets set PAYPAL_CLIENT_ID=<live_client_id>
   supabase secrets set PAYPAL_CLIENT_SECRET=<live_secret>
   ```
4. Register webhook URL in PayPal dashboard:
   `https://afgmlkduuapquqkcqdsk.supabase.co/functions/v1/paypal-webhook`
5. Set webhook ID secret:
   ```
   supabase secrets set PAYPAL_WEBHOOK_ID=<webhook_id>
   ```

## To Configure Supabase Auth Emails
1. Dashboard → Authentication → URL Configuration
   - Site URL: http://178.105.166.126:3092
2. Dashboard → Authentication → Email Templates
   - Update confirm signup + reset password templates

---

## Architecture Rules (Non-Negotiables)
1. Engine is product-agnostic — no hard-coded program labels
2. Adding step type = component + registry entry; LessonPlayer never changes
3. Content is JSON — local files during dev, Supabase in production
4. Theme tokens are single source of truth: src/theme/tokens.ts
5. Credentials in .gitignore; keys in Turbial/turbial-keys

## Key Files
```
src/engine/
  types.ts           — Step discriminated union + all types
  stepRegistry.ts     — 23 type → component/validate/score mappings
  LessonPlayer.tsx    — Generic progression driver (never changes)
  lessonMachine.ts    — Pure state transitions
  scoring.ts          — XP + level math
  components/steps/   — 21 step components

src/data/
  supabase.ts         — Client initialization
  queries.ts          — TanStack Query hooks (lessons, profile, progress)
  mutations.ts        — Complete lesson + save step responses

supabase/
  migrations/         — 14 migrations (all applied)
  functions/          — 4 edge functions (create-checkout, stripe-webhook, paypal-checkout, paypal-webhook)
```
