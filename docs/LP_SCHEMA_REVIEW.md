# Schema Review: `lp_` Migrations

**DB:** Supabase `afgmlkduuapquqkcqdsk` (shared project)
**Status of target:** 398 tables, no `lp_` namespace collisions, no pgvector installed yet
**Migration files:** `lp_001_core_schema`, `lp_002_indexes_rls`, `lp_003_rls_and_functions`

---

## ✅ Clear to Apply

| Check | Result |
|-------|--------|
| Namespace conflict | None — `lp_` prefix doesn't collide with any of the 398 existing tables |
| FK target exists | `lp_modules` → `lp_courses`, `lp_lessons` → `lp_modules`, etc. — all within the same migration, created in dependency order |
| Extension availability | `pgcrypto` already installed. `vector` 0.8.0 available but needs enabling |
| User auth integration | `lp_users` is a separate table, not replacing the existing `profiles` table — that's the right call since the existing app authenticates through Supabase Auth (auth.users) + `profiles` |
| RLS strategy | Sensible: RLS enabled from day one on all `lp_` tables, with student-owns-their-data policies. Service role bypasses RLS for Edge Functions |
| Reversibility | `DROP TABLE ... CASCADE` removes cleanly with no impact on existing tables |

## ⚠️ Design Notes (not blocking)

### 1. `lp_users` vs existing `profiles`
You already have a `profiles` table (19 columns, including `id` which links to `auth.users`). The `lp_users` table duplicates this. The messenger code in `src/messenger/profile.ts` reads/writes `lp_users`, but the app's auth flow creates rows in `profiles`, not `lp_users`. 

**Recommendation:** Either:
- Remove `lp_users` and add the `skill_level`, `industry`, `goal` columns to the existing `profiles` table (Phase 4 personalization data). This keeps a single user table.
- Or keep `lp_users` as a thin extension, synced via a Supabase trigger on `profiles` insert. But that's complexity you don't need yet.

### 2. `lp_courses` / `lp_modules` — double mapping
The existing app has its own course/module structure (the `useLocalUnits` data + `src/content/` JSON files). The `lp_` equivalent creates a parallel content hierarchy. This is fine for Phase 1-2 coexistence, but eventually the old structure should be deprecated.

### 3. RLS policy naming
The policies use short names like `lp_courses_read` and `lp_progress_owner`. Supabase auto-generates policy names, but explicit names help with debugging. These are fine — just not the Supabase-migration convention (which would be something like `Students can select courses`).

### 4. `lp_match_chunks` RPC — schema-based return
It returns `table (chunk_text text, similarity float)` — which requires PostgREST 12+. Supabase supports this, but if you ever proxy through something older, it'll break. Minor concern.

### 5. No index on `lp_progress_events.created_at`
Phase 3-4 adaptive queries that sort by recency might want this. Not urgent.

---

## Schema Application Order

```
1. CREATE EXTENSION vector;           -- enable pgvector
2. lp_001_core_schema.sql             -- all tables
3. lp_002_indexes_rls.sql             -- indexes (indexes after data)
4. lp_003_rls_and_functions.sql       -- RLS + RPCs
```

**Note re order:** lp_002 has `create index` statements that are safe to run before any data exists (they'll just create empty indexes). Could be merged into lp_001, but keeping them separate follows the Supabase convention of structural SQL first, indexes second, policies/functions third.

## pgvector Sizing Note

The migration creates a single `ivfflat` index with `lists = 100`. For the initial dataset (AI Operator 28 days → maybe 500-1000 chunks), this is overkill but harmless. As you scale, you'd want to rebuild the index with `lists = sqrt(numRows)` after ingestion. The default also assumes 1536-dim embeddings (OpenAI `text-embedding-ada-002` / `text-embedding-3-small`), which matches the Edge Function code.

---

## Verdict

**Safe to apply.** No risk to existing operations. The `lp_` namespace is completely clean. `pgvector` needs to be enabled first (one-line `CREATE EXTENSION`). The one design decision worth making now is `lp_users` vs extending `profiles`.

Want me to:
1. Apply them now (in order: extension → 001 → 002 → 003, with the `lp_users` change if you want it)
2. First adjust `lp_users` to be a view on `profiles` instead
3. Something else
