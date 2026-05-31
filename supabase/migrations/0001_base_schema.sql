-- 0001_base_schema.sql — Core tables for Turbo Learning platform
-- Multi-program guided-experience engine (Turbo Academy, Duo, FilmAssist, etc.)
-- Applied to Supabase project. RLS enabled on all user-data tables.

-- ============================================================================
-- PROGRAMS / CONTENT (world-readable, admin-write only)
-- ============================================================================

create table programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  unit_label text default 'Day',
  artifact_label text default 'Artifact',
  level_names jsonb,
  journey_shape text default 'linear',
  created_at timestamptz default now()
);

create table units (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references programs(id) on delete cascade,
  order_num int not null,
  label text,
  title text not null,
  theme text,
  deliverable_id uuid,
  unique (program_id, order_num)
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references units(id) on delete cascade,
  order_num int not null,
  title text not null,
  description text,
  est_minutes int,
  xp_reward int default 0,
  steps jsonb not null default '[]'::jsonb,
  unique (unit_id, order_num)
);

-- ============================================================================
-- USERS / PROFILES (1:1 with auth.users)
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  goal text,
  daily_mins int,
  learn_time text,
  streak int default 0,
  shield_count int default 0,
  xp int default 0,
  level int default 1,
  avatar_url text,
  onboarded boolean default false,
  created_at timestamptz default now()
);

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  program_id uuid references programs(id),
  started_at timestamptz default now(),
  current_unit_id uuid references units(id)
);

-- ============================================================================
-- PROGRESS / RESPONSES
-- ============================================================================

create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id),
  completed_at timestamptz default now(),
  xp_earned int default 0,
  score numeric,
  unique (user_id, lesson_id)
);

create table step_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id),
  step_id text not null,
  response jsonb,
  correct boolean,
  created_at timestamptz default now()
);

create table streak_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  completed boolean default true,
  shield_used boolean default false,
  unique (user_id, date)
);

-- ============================================================================
-- DELIVERABLES
-- ============================================================================

create table deliverables (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references units(id) on delete cascade,
  title text,
  instructions text,
  template_url text
);

create table deliverable_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  deliverable_id uuid references deliverables(id),
  submitted_at timestamptz default now(),
  file_url text,
  text text,
  xp_awarded int default 0
);

-- ============================================================================
-- GAMIFICATION: BADGES
-- ============================================================================

create table badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text,
  icon text,
  unlock_condition text
);

create table user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  badge_id uuid references badges(id),
  earned_at timestamptz default now()
);

-- ============================================================================
-- SPACED REPETITION
-- ============================================================================

create table review_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  step_id text not null,
  lesson_id uuid references lessons(id),
  due_at timestamptz,
  interval_days int default 1,
  ease numeric default 2.5,
  last_result text
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Content tables: public read, no public write
alter table programs enable row level security;
alter table units enable row level security;
alter table lessons enable row level security;
alter table badges enable row level security;
alter table deliverables enable row level security;

create policy "public read programs" on programs for select using (true);
create policy "public read units" on units for select using (true);
create policy "public read lessons" on lessons for select using (true);
create policy "public read badges" on badges for select using (true);
create policy "public read deliverables" on deliverables for select using (true);

-- User-data tables: auth.uid() = user_id
alter table profiles enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;
alter table step_responses enable row level security;
alter table streak_log enable row level security;
alter table deliverable_submissions enable row level security;
alter table user_badges enable row level security;
alter table review_queue enable row level security;

create policy "own profile sel" on profiles for select using (auth.uid() = id);
create policy "own profile upd" on profiles for update using (auth.uid() = id);

create policy "own enrollment sel" on enrollments for select using (auth.uid() = user_id);
create policy "own enrollment ins" on enrollments for insert with check (auth.uid() = user_id);

create policy "own progress sel" on lesson_progress for select using (auth.uid() = user_id);
create policy "own progress ins" on lesson_progress for insert with check (auth.uid() = user_id);

create policy "own response sel" on step_responses for select using (auth.uid() = user_id);
create policy "own response ins" on step_responses for insert with check (auth.uid() = user_id);

create policy "own streak sel" on streak_log for select using (auth.uid() = user_id);
create policy "own streak ins" on streak_log for insert with check (auth.uid() = user_id);

create policy "own submission sel" on deliverable_submissions for select using (auth.uid() = user_id);
create policy "own submission ins" on deliverable_submissions for insert with check (auth.uid() = user_id);

create policy "own badge sel" on user_badges for select using (auth.uid() = user_id);
create policy "own badge ins" on user_badges for insert with check (auth.uid() = user_id);

create policy "own review sel" on review_queue for select using (auth.uid() = user_id);
create policy "own review ins" on review_queue for insert with check (auth.uid() = user_id);
create policy "own review upd" on review_queue for update using (auth.uid() = user_id);
