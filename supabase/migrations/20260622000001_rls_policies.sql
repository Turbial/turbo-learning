-- 20260622000001_rls_policies.sql — Row Level Security for user-data tables
--
-- Note: Several tables already have RLS enabled in prior migrations:
--   programs, units, lessons, badges   → 0012_anon_read_policies.sql
--   subscriptions, payment_history     → 0006_payments.sql
--   shield_purchases                   → 0007_shields.sql
--   step_responses                     → 0025_step_responses.sql
--   push_tokens                        → 0005_auth_tables.sql
--
-- This migration covers the remaining tables: profiles, lesson_progress,
-- user_badges, enrollments, and review_queue.

-- ─── profiles ────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- ─── lesson_progress ──────────────────────────────────────────────────────────

alter table public.lesson_progress enable row level security;

create policy "lesson_progress: select own" on public.lesson_progress
  for select using (auth.uid() = user_id);

create policy "lesson_progress: insert own" on public.lesson_progress
  for insert with check (auth.uid() = user_id);

-- ─── user_badges ──────────────────────────────────────────────────────────────

alter table public.user_badges enable row level security;

create policy "user_badges: select own" on public.user_badges
  for select using (auth.uid() = user_id);

-- Badges are inserted by DB triggers/RPCs (server-side), not directly by clients.
-- No insert policy for client.

-- ─── enrollments ─────────────────────────────────────────────────────────────

alter table public.enrollments enable row level security;

create policy "enrollments: select own" on public.enrollments
  for select using (auth.uid() = user_id);

create policy "enrollments: insert own" on public.enrollments
  for insert with check (auth.uid() = user_id);

-- ─── review_queue ─────────────────────────────────────────────────────────────
-- Note: review_queue rows are written via the schedule_review() RPC (0008).
-- Direct client insert/update is not needed, but select and update are exposed
-- so the client can read due items and track review state.

alter table public.review_queue enable row level security;

create policy "review_queue: select own" on public.review_queue
  for select using (auth.uid() = user_id);

create policy "review_queue: update own" on public.review_queue
  for update using (auth.uid() = user_id);

-- ─── Already-covered tables (for reference — not re-applied here) ─────────────
-- programs:         anon SELECT via 0012_anon_read_policies.sql
-- units:            anon SELECT via 0012_anon_read_policies.sql
-- lessons:          anon SELECT via 0012_anon_read_policies.sql
-- badges:           anon SELECT via 0012_anon_read_policies.sql
-- subscriptions:    own SELECT via 0006_payments.sql
-- payment_history:  own SELECT via 0006_payments.sql
-- shield_purchases: own SELECT via 0007_shields.sql
-- step_responses:   own SELECT/INSERT/UPDATE via 0025_step_responses.sql
-- push_tokens:      own SELECT/INSERT/DELETE via 0005_auth_tables.sql
