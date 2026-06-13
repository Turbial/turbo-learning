-- ============================================================================
-- Migration: lp_003_rls_and_functions
-- STATUS: PREVIEW ONLY — apply after lp_001 + lp_002, and after §8 approval.
--
-- RLS ON FROM DAY ONE (the deliberate contrast with the shared public schema,
-- where 65 tables sit RLS-disabled). Plus the two RPCs the Edge Functions call:
--   lp_match_chunks  — pgvector retrieval for lp-ask
--   lp_bump_mastery  — per-concept mastery upsert for lp-serve
--
-- Auth model: lp_progress/events/mastery/conversations/messages are owned by the
-- end user (auth.uid() = user_id). Course CONTENT (courses/modules/lessons/items/
-- chunks) is readable by any authenticated user. The Edge Functions use the
-- service role, which BYPASSES RLS — so ingest/serve writes work regardless.
-- ============================================================================

-- ---- Retrieval RPC (lp-ask) ------------------------------------------------
create or replace function lp_match_chunks(
  query_embedding vector(1536),
  match_version   text,
  match_count     int default 5
)
returns table (chunk_text text, similarity float)
language sql stable as $$
  select chunk_text, 1 - (embedding <=> query_embedding) as similarity
  from lp_lesson_chunks
  where content_version = match_version
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- ---- Mastery upsert RPC (lp-serve) -----------------------------------------
create or replace function lp_bump_mastery(
  p_user uuid, p_lesson uuid, p_concept text, p_correct boolean
)
returns void language sql as $$
  insert into lp_concept_mastery (user_id, lesson_id, concept_tag, correct, attempts)
  values (p_user, p_lesson, p_concept, case when p_correct then 1 else 0 end, 1)
  on conflict (user_id, lesson_id, concept_tag) do update
    set correct  = lp_concept_mastery.correct  + (case when p_correct then 1 else 0 end),
        attempts = lp_concept_mastery.attempts + 1;
$$;

-- ---- Weak-area detection (lp-serve "progress" / "next-adaptive") -----------
create or replace function lp_weak_concept(p_user uuid, p_lesson uuid)
returns text language sql stable as $$
  select concept_tag from lp_concept_mastery
  where user_id = p_user and lesson_id = p_lesson and attempts > 0
  order by mastery_pct asc, attempts desc
  limit 1;
$$;

-- Adaptive serving (still no LLM): pick the next quiz by weak concept + target
-- difficulty + no-repeat. Mirrors the client pickAdaptiveItem.
create or replace function lp_next_adaptive(
  p_user uuid, p_lesson uuid, p_version text, p_difficulty int, p_concept text default null
)
returns setof lp_lesson_items language sql stable as $$
  select * from lp_lesson_items
  where lesson_id = p_lesson and content_version = p_version
    and status = 'live' and item_type = 'quiz'
    and id not in (select item_id from lp_progress_events where user_id = p_user)
    and (p_concept is null or concept_tag = p_concept)
  order by abs(difficulty - p_difficulty), random()
  limit 1;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table lp_courses         enable row level security;
alter table lp_modules         enable row level security;
alter table lp_lessons         enable row level security;
alter table lp_lesson_chunks   enable row level security;
alter table lp_lesson_items    enable row level security;
alter table lp_users           enable row level security;
alter table lp_progress        enable row level security;
alter table lp_progress_events enable row level security;
alter table lp_concept_mastery enable row level security;
alter table lp_conversations   enable row level security;
alter table lp_messages        enable row level security;

-- ---- Content: readable by any authenticated user ---------------------------
create policy lp_courses_read on lp_courses
  for select to authenticated using (true);
create policy lp_modules_read on lp_modules
  for select to authenticated using (true);
create policy lp_lessons_read on lp_lessons
  for select to authenticated using (true);
create policy lp_items_read on lp_lesson_items
  for select to authenticated using (status = 'live');
-- Chunks are the Ask source; readable so RPC works under invoker too (service role bypasses RLS anyway).
create policy lp_chunks_read on lp_lesson_chunks
  for select to authenticated using (true);

-- ---- Student-owned rows: a user sees and writes only their own -------------
create policy lp_users_self on lp_users
  for select to authenticated using (id = auth.uid());

create policy lp_progress_owner on lp_progress
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy lp_events_owner on lp_progress_events
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy lp_mastery_owner on lp_concept_mastery
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy lp_conversations_owner on lp_conversations
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy lp_messages_owner on lp_messages
  for all to authenticated using (
    conversation_id in (select id from lp_conversations where user_id = auth.uid())
  );

-- NOTE: creator/admin write policies for content are intentionally omitted here —
-- ingest/serve run as the service role (RLS-exempt). Add creator policies when the
-- creator UI (Phase 3) lets non-service callers edit content.
