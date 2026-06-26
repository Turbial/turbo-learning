-- 0025: step_responses table
-- Stores per-step user answers: builder prompts, pastes, reflections, MC answers.
-- Used by deliverable viewer, spaced repetition, and portfolio features.

create table if not exists step_responses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  lesson_id   uuid references lessons(id) on delete set null,
  step_id     text not null,
  response    jsonb,
  correct     boolean,
  created_at  timestamptz default now(),
  -- Prevent duplicate responses for the same step in the same lesson
  unique (user_id, lesson_id, step_id)
);

alter table step_responses enable row level security;

-- Users can only read/write their own responses (idempotent)
do $$ begin
  create policy "step_responses_select" on step_responses
    for select using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "step_responses_insert" on step_responses
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "step_responses_update" on step_responses
    for update using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- Index for fast lookups by user + lesson (deliverable viewer pattern)
create index if not exists step_responses_user_lesson_idx
  on step_responses (user_id, lesson_id);
