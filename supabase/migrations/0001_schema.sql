-- 0001_schema.sql — Turbo Learning Platform
-- Phase 0 Section 5: Supabase schema
-- PREVIEW — for approval before applying to live Supabase

-- ═══ PROGRAMS / CONTENT (public read) ═══

create table programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  unit_label text default 'Day',
  artifact_label text default 'Artifact',
  level_names jsonb default '["Beginner","Learner","Builder","Operator","Master"]',
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
  est_minutes int,
  steps jsonb not null,
  unique (unit_id, order_num)
);

create table deliverables (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references units(id) on delete cascade,
  title text,
  instructions text,
  template_url text
);

-- add FK from units → deliverables (circular-safe via alter)
alter table units add constraint fk_units_deliverable
  foreign key (deliverable_id) references deliverables(id) on delete set null;

-- ═══ USERS / PROGRESS (own-rows only) ═══

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  goal text,
  daily_mins int default 15,
  learn_time text default 'Morning',
  streak int default 0,
  shield_count int default 0,
  xp int default 0,
  level int default 1,
  created_at timestamptz default now()
);

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  program_id uuid references programs(id) on delete cascade,
  started_at timestamptz default now(),
  current_unit_id uuid references units(id),
  unique (user_id, program_id)
);

create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed_at timestamptz default now(),
  xp_earned int default 0,
  score numeric,
  unique (user_id, lesson_id)
);

create table step_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  step_id text not null,
  response jsonb,
  correct boolean,
  created_at timestamptz default now()
);

create table streak_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  date date not null default current_date,
  completed boolean default true,
  shield_used boolean default false,
  unique (user_id, date)
);

create table deliverable_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  deliverable_id uuid references deliverables(id) on delete cascade,
  submitted_at timestamptz default now(),
  file_url text,
  text text,
  xp_awarded int default 0
);

create table badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text,
  unlock_condition text
);

create table user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  badge_id uuid references badges(id) on delete cascade,
  earned_at timestamptz default now(),
  unique (user_id, badge_id)
);

create table review_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  step_id text not null,
  lesson_id uuid references lessons(id) on delete cascade,
  due_at timestamptz,
  interval_days int default 1,
  ease numeric default 2.5,
  last_result text
);

-- ═══ INDEXES ═══

create index idx_units_program on units(program_id, order_num);
create index idx_lessons_unit on lessons(unit_id, order_num);
create index idx_enrollments_user on enrollments(user_id);
create index idx_lesson_progress_user on lesson_progress(user_id);
create index idx_step_responses_lesson on step_responses(user_id, lesson_id);
create index idx_streak_log_user_date on streak_log(user_id, date);
create index idx_review_queue_due on review_queue(user_id, due_at);

-- ═══ RLS (Row-Level Security) ═══

-- Public read for content tables
alter table programs enable row level security;
create policy "Programs are publicly readable" on programs
  for select using (true);

alter table units enable row level security;
create policy "Units are publicly readable" on units
  for select using (true);

alter table lessons enable row level security;
create policy "Lessons are publicly readable" on lessons
  for select using (true);

alter table badges enable row level security;
create policy "Badges are publicly readable" on badges
  for select using (true);

alter table deliverables enable row level security;
create policy "Deliverables are publicly readable" on deliverables
  for select using (true);

-- User-own-rows for progress tables
alter table profiles enable row level security;
create policy "Users can read own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can upsert own profile" on profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

alter table enrollments enable row level security;
create policy "Users can read own enrollments" on enrollments
  for select using (auth.uid() = user_id);
create policy "Users can insert own enrollments" on enrollments
  for insert with check (auth.uid() = user_id);

alter table lesson_progress enable row level security;
create policy "Users can read own progress" on lesson_progress
  for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on lesson_progress
  for insert with check (auth.uid() = user_id);

alter table step_responses enable row level security;
create policy "Users can read own responses" on step_responses
  for select using (auth.uid() = user_id);
create policy "Users can insert own responses" on step_responses
  for insert with check (auth.uid() = user_id);

alter table streak_log enable row level security;
create policy "Users can read own streaks" on streak_log
  for select using (auth.uid() = user_id);
create policy "Users can insert own streaks" on streak_log
  for insert with check (auth.uid() = user_id);

alter table deliverable_submissions enable row level security;
create policy "Users can read own submissions" on deliverable_submissions
  for select using (auth.uid() = user_id);
create policy "Users can insert own submissions" on deliverable_submissions
  for insert with check (auth.uid() = user_id);

alter table user_badges enable row level security;
create policy "Users can read own badges" on user_badges
  for select using (auth.uid() = user_id);
create policy "Users can insert own badges" on user_badges
  for insert with check (auth.uid() = user_id);

alter table review_queue enable row level security;
create policy "Users can read own review queue" on review_queue
  for select using (auth.uid() = user_id);
create policy "Users can insert own review items" on review_queue
  for insert with check (auth.uid() = user_id);

-- ═══ FUNCTIONS ═══

-- Auto-create profile on signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
