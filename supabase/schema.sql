-- ============================================================================
-- Turbo Learning — Consolidated Schema (Generated from migrations 0001-0011)
-- ============================================================================
-- This file is a reference snapshot of the schema after applying migrations
-- 0001 through 0011. Seed data (0012-0018) is not included.
-- Source: Phase0_Architecture_Handoff.md Section 5 + all reviewed migrations.
-- ============================================================================

-- PROGRAMS / CONTENT (world-readable)
create table if not exists programs (
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

create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references programs(id) on delete cascade,
  order_num int not null,
  label text,
  title text not null,
  theme text,
  deliverable_id uuid,
  unique (program_id, order_num)
);

create table if not exists lessons (
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

-- USERS / PROFILES
create table if not exists profiles (
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

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  program_id uuid references programs(id),
  started_at timestamptz default now(),
  current_unit_id uuid references units(id)
);

-- PROGRESS / RESPONSES
create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id),
  completed_at timestamptz default now(),
  xp_earned int default 0,
  score numeric,
  unique (user_id, lesson_id)
);

create table if not exists step_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id),
  step_id text not null,
  response jsonb,
  correct boolean,
  created_at timestamptz default now()
);

create table if not exists streak_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  completed boolean default true,
  shield_used boolean default false,
  unique (user_id, date)
);

-- DELIVERABLES
create table if not exists deliverables (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references units(id) on delete cascade,
  title text,
  instructions text,
  template_url text
);

create table if not exists deliverable_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  deliverable_id uuid references deliverables(id),
  submitted_at timestamptz default now(),
  file_url text,
  text text,
  xp_awarded int default 0
);

-- BADGES
create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text,
  icon text,
  unlock_condition text
);

create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  badge_id uuid references badges(id),
  earned_at timestamptz default now()
);

-- SPACED REPETITION
create table if not exists review_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  step_id text not null,
  lesson_id uuid references lessons(id),
  due_at timestamptz,
  interval_days int default 1,
  ease numeric default 2.5,
  last_result text,
  unique (user_id, step_id)
);

-- AUTH EXTENSIONS (from 0005)
create table if not exists push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  token text not null,
  created_at timestamptz default now(),
  unique (user_id, token)
);

-- PAYMENTS (from 0006)
create table if not exists plans (
  id text primary key,
  name text not null,
  price_cents int default 0,
  interval text,
  stripe_price_id text
);

create table if not exists subscriptions (
  user_id uuid primary key references profiles(id) on delete cascade,
  tier text default 'free',
  status text default 'none',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz default now(),
  plan_id text
);

create table if not exists payment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  amount_cents int,
  currency text default 'usd',
  status text,
  stripe_payment_intent text,
  created_at timestamptz default now()
);

-- SHIELDS (from 0007)
create table if not exists shield_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  purchased_at timestamptz default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table programs enable row level security;
alter table units enable row level security;
alter table lessons enable row level security;
alter table badges enable row level security;
alter table deliverables enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'public read programs') then
    create policy "public read programs" on programs for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'public read units') then
    create policy "public read units" on units for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'public read lessons') then
    create policy "public read lessons" on lessons for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'public read badges') then
    create policy "public read badges" on badges for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'public read deliverables') then
    create policy "public read deliverables" on deliverables for select using (true);
  end if;
end; $$;

alter table profiles enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;
alter table step_responses enable row level security;
alter table streak_log enable row level security;
alter table deliverable_submissions enable row level security;
alter table user_badges enable row level security;
alter table review_queue enable row level security;
alter table push_tokens enable row level security;
alter table subscriptions enable row level security;
alter table payment_history enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'own profile sel') then
    create policy "own profile sel" on profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own profile upd') then
    create policy "own profile upd" on profiles for update using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own enrollment sel') then
    create policy "own enrollment sel" on enrollments for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own enrollment ins') then
    create policy "own enrollment ins" on enrollments for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own progress sel') then
    create policy "own progress sel" on lesson_progress for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own progress ins') then
    create policy "own progress ins" on lesson_progress for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own response sel') then
    create policy "own response sel" on step_responses for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own response ins') then
    create policy "own response ins" on step_responses for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own streak sel') then
    create policy "own streak sel" on streak_log for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own streak ins') then
    create policy "own streak ins" on streak_log for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own submission sel') then
    create policy "own submission sel" on deliverable_submissions for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own submission ins') then
    create policy "own submission ins" on deliverable_submissions for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own badge sel') then
    create policy "own badge sel" on user_badges for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own badge ins') then
    create policy "own badge ins" on user_badges for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own review sel') then
    create policy "own review sel" on review_queue for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own review ins') then
    create policy "own review ins" on review_queue for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own review upd') then
    create policy "own review upd" on review_queue for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own push sel') then
    create policy "own push sel" on push_tokens for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own push ins') then
    create policy "own push ins" on push_tokens for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own push del') then
    create policy "own push del" on push_tokens for delete using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own sub sel') then
    create policy "own sub sel" on subscriptions for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own pay sel') then
    create policy "own pay sel" on payment_history for select using (auth.uid() = user_id);
  end if;
end; $$;

alter table plans enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'plans read') then
    create policy "plans read" on plans for select using (true);
  end if;
end; $$;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Handle new user signup (from 0010)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Complete a lesson atomically (from 0004)
create or replace function complete_lesson(
  p_user_id uuid,
  p_lesson_id uuid,
  p_xp_earned int,
  p_score numeric
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_total_xp int;
  v_new_level int;
  v_streak int;
  v_today date := current_date;
  v_yesterday date := current_date - interval '1 day';
  v_had_streak_yesterday boolean;
  v_lesson_completed boolean;
  v_result jsonb;
begin
  insert into lesson_progress (user_id, lesson_id, xp_earned, score)
  values (p_user_id, p_lesson_id, p_xp_earned, p_score)
  on conflict (user_id, lesson_id) do nothing;

  select exists(select 1 from lesson_progress
    where user_id = p_user_id and lesson_id = p_lesson_id
  ) into v_lesson_completed;

  update profiles set xp = xp + p_xp_earned where id = p_user_id returning xp into v_total_xp;

  v_new_level := floor(sqrt(v_total_xp::numeric / 100)) + 1;
  update profiles set level = v_new_level where id = p_user_id and level != v_new_level;

  select exists(select 1 from streak_log
    where user_id = p_user_id and date = v_yesterday and completed = true
  ) into v_had_streak_yesterday;

  if not exists(select 1 from streak_log where user_id = p_user_id and date = v_today) then
    if v_had_streak_yesterday then
      update profiles set streak = streak + 1 where id = p_user_id;
    else
      update profiles set streak = 1 where id = p_user_id;
    end if;
    insert into streak_log (user_id, date, completed) values (p_user_id, v_today, true);
  end if;

  select streak into v_streak from profiles where id = p_user_id;

  if not exists(select 1 from user_badges ub join badges b on b.id = ub.badge_id
    where ub.user_id = p_user_id and b.slug = 'first_day') then
    insert into user_badges (user_id, badge_id) select p_user_id, id from badges where slug = 'first_day';
  end if;

  if v_streak >= 7 and not exists(select 1 from user_badges ub join badges b on b.id = ub.badge_id
    where ub.user_id = p_user_id and b.slug = 'week_streak') then
    insert into user_badges (user_id, badge_id) select p_user_id, id from badges where slug = 'week_streak';
  end if;

  if v_streak >= 14 and not exists(select 1 from user_badges ub join badges b on b.id = ub.badge_id
    where ub.user_id = p_user_id and b.slug = 'two_week_streak') then
    insert into user_badges (user_id, badge_id) select p_user_id, id from badges where slug = 'two_week_streak';
  end if;

  select jsonb_build_object(
    'total_xp', v_total_xp,
    'level', v_new_level,
    'streak', v_streak,
    'lesson_completed', v_lesson_completed
  ) into v_result;

  return v_result;
end;
$$;

-- Schedule a spaced repetition review (from 0008)
create or replace function public.schedule_review(p_step_id text, p_lesson_id uuid, p_correct boolean)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid := auth.uid(); v_interval int; v_ease numeric;
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  select interval_days, ease into v_interval, v_ease from review_queue
    where user_id = v_user and step_id = p_step_id;
  if not found then v_interval := 1; v_ease := 2.5; end if;
  if p_correct then v_interval := greatest(1, round(v_interval * v_ease)); else v_interval := 1; end if;
  insert into review_queue (user_id, step_id, lesson_id, due_at, interval_days, ease, last_result)
  values (v_user, p_step_id, p_lesson_id, now() + (v_interval || ' days')::interval, v_interval, v_ease,
          case when p_correct then 'pass' else 'fail' end)
  on conflict (user_id, step_id) do update set
    lesson_id = excluded.lesson_id, due_at = excluded.due_at,
    interval_days = excluded.interval_days, ease = excluded.ease, last_result = excluded.last_result;
end; $$;

-- Streak-at-risk helper (from 0008)
create or replace function public.users_without_completion_today(p_date date)
returns table(user_id uuid) language sql security definer set search_path = public, pg_temp as $$
  select p.id from profiles p
  where p.streak > 0
    and not exists (select 1 from streak_log s where s.user_id = p.id and s.date = p_date);
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- GRANTS
-- ============================================================================

grant execute on function public.complete_lesson(uuid, uuid, int, numeric) to authenticated;
grant execute on function public.schedule_review(text, uuid, boolean) to authenticated;
grant execute on function public.users_without_completion_today(date) to authenticated, service_role;
