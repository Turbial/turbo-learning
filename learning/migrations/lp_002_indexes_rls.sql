-- ============================================================================
-- Migration: lp_002_indexes_rls
-- STATUS: PREVIEW ONLY — apply after lp_001 and after Marcus approves.
-- ============================================================================

-- ---- serve-time + adaptive selection indexes -------------------------------
create index if not exists lp_items_serve_idx
  on lp_lesson_items (lesson_id, content_version, status);

create index if not exists lp_items_adaptive_idx
  on lp_lesson_items (lesson_id, concept_tag, difficulty);

create index if not exists lp_items_entry_idx
  on lp_lesson_items (lesson_id, is_entry) where is_entry = true;

-- ---- no-repeat served-tracking + weak-area rollups -------------------------
create index if not exists lp_events_user_item_idx
  on lp_progress_events (user_id, item_id);

create index if not exists lp_events_user_concept_idx
  on lp_progress_events (user_id, concept_tag);

-- ---- Ask retrieval (pgvector ivfflat) --------------------------------------
-- Note: build after some rows exist for a good centroid; lists tunable.
create index if not exists lp_chunks_embedding_idx
  on lp_lesson_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create index if not exists lp_chunks_lesson_idx
  on lp_lesson_chunks (lesson_id, content_version);

-- ---- progress lookups ------------------------------------------------------
create index if not exists lp_progress_user_idx
  on lp_progress (user_id, course_id);

-- ============================================================================
-- ROW LEVEL SECURITY (shared DB — enable, then wire policies to your auth).
-- Policies are STUBBED/COMMENTED. Uncomment + adapt to your auth.uid() scheme
-- before going live. Left commented so this migration is safe to preview.
-- ============================================================================

-- alter table lp_courses        enable row level security;
-- alter table lp_lessons        enable row level security;
-- alter table lp_lesson_items   enable row level security;
-- alter table lp_progress       enable row level security;
-- alter table lp_progress_events enable row level security;
-- alter table lp_concept_mastery enable row level security;
-- alter table lp_conversations  enable row level security;
-- alter table lp_messages       enable row level security;

-- Example student-owns-their-progress policy (adapt auth mapping):
-- create policy lp_progress_owner on lp_progress
--   for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Example creator-owns-their-course-content policy:
-- create policy lp_lessons_creator on lp_lessons
--   for all using (
--     module_id in (
--       select m.id from lp_modules m
--       join lp_courses c on c.id = m.course_id
--       where c.creator_id = auth.uid()
--     )
--   );
