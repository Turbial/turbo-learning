-- ============================================================================
-- Migration: lp_001_core_schema (APPLIED — unified-messenger merge)
-- Target: Supabase afgmlkduuapquqkcqdsk (SHARED operational DB)
-- All tables namespaced lp_ to coexist with the existing 398 public tables.
--
-- Changes from PREVIEW:
--   - Removed lp_users table. App already uses profiles (FKey to auth.users).
--     Phase 4 personalization columns (skill_level, industry, goal) added to
--     profiles instead. lp_progress etc. reference profiles.id (which is auth.uid()).
-- ============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid (already exists)
create extension if not exists "vector";       -- pgvector for Ask retrieval

-- ---- Phase 4 personalization columns on existing profiles ------------------
alter table profiles add column if not exists skill_level text
  check (skill_level in ('beginner','intermediate','advanced'));
alter table profiles add column if not exists industry text;
-- goal already exists on profiles (used for onboarding)

-- ---- courses / modules / lessons -------------------------------------------
create table if not exists lp_courses (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  creator_id  uuid references profiles(id) on delete set null,
  status      text not null default 'draft'
              check (status in ('draft','published','archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists lp_modules (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references lp_courses(id) on delete cascade,
  title       text not null,
  sort_order  int not null default 0
);

create table if not exists lp_lessons (
  id                 uuid primary key default gen_random_uuid(),
  module_id          uuid not null references lp_modules(id) on delete cascade,
  title              text not null,
  video_url          text,
  content            text,                 -- ingest source (transcript/body)
  summary            text,                 -- generated, cached
  key_concepts       jsonb default '[]',   -- [{tag,label}]
  content_version    text,                 -- sha256 of normalized content
  items_generated_at timestamptz,
  sort_order         int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---- chunks (Ask retrieval) ------------------------------------------------
create table if not exists lp_lesson_chunks (
  id              uuid primary key default gen_random_uuid(),
  lesson_id       uuid not null references lp_lessons(id) on delete cascade,
  content_version text not null,
  chunk_index     int not null,
  chunk_text      text not null,
  embedding       vector(1536)
);

-- ---- item pool (the button games) ------------------------------------------
create table if not exists lp_lesson_items (
  id              uuid primary key default gen_random_uuid(),
  lesson_id       uuid not null references lp_lessons(id) on delete cascade,
  content_version text not null,
  item_type       text not null
                  check (item_type in ('menu','quiz','scenario','flash','feedback','done')),
  concept_tag     text,
  difficulty      int not null default 1 check (difficulty between 1 and 5),
  bot_text        text not null,
  buttons         jsonb not null default '[]',   -- [{label,action,to,correct?}]
  is_entry        boolean not null default false,
  status          text not null default 'live'
                  check (status in ('live','draft','retired')),
  review_state    text not null default 'approved'
                  check (review_state in ('approved','pending','rejected')),
  times_served    int not null default 0,
  times_correct   int not null default 0,
  created_at      timestamptz not null default now()
);

-- ---- progress --------------------------------------------------------------
-- user_id references profiles(id) — which is auth.uid(). The existing app
-- creates a profile row for every authenticated user on sign-up.
create table if not exists lp_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  course_id    uuid references lp_courses(id) on delete cascade,
  lesson_id    uuid references lp_lessons(id) on delete cascade,
  current_step uuid,
  status       text not null default 'not_started'
               check (status in ('not_started','in_progress','completed')),
  quiz_score   numeric,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

create table if not exists lp_progress_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  lesson_id   uuid not null references lp_lessons(id) on delete cascade,
  item_id     uuid not null references lp_lesson_items(id) on delete cascade,
  concept_tag text,
  was_correct boolean,
  created_at  timestamptz not null default now()
);

create table if not exists lp_concept_mastery (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  lesson_id   uuid not null references lp_lessons(id) on delete cascade,
  concept_tag text not null,
  correct     int not null default 0,
  attempts    int not null default 0,
  mastery_pct numeric generated always as
              (case when attempts > 0 then correct::numeric / attempts else 0 end) stored,
  unique (user_id, lesson_id, concept_tag)
);

-- ---- free-text Ask history -------------------------------------------------
create table if not exists lp_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  lesson_id  uuid not null references lp_lessons(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists lp_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references lp_conversations(id) on delete cascade,
  role            text not null check (role in ('user','assistant')),
  content         text not null,
  tokens          int,
  created_at      timestamptz not null default now()
);
