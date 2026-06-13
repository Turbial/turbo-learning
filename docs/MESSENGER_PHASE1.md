# Messenger — Phase 1 (the chat + buttons AI tutor MVP)

Implements Phase 1 of `docs/SUPER_PRODUCT_EVALUATION.md`: the pivot toward an
**LLM messenger**. A lesson now plays as a **chat thread** — the bot sends a
message, the student taps a button, the next message arrives — with a free-text
**"Ask my own question"** escape hatch. Built **against local compiled content
first** (per CLAUDE.md), so it runs with **no backend and no DDL applied**.

> **Standing rule honored:** no `lp_` migrations are applied to Supabase. The DDL
> lives under `learning/migrations/` as **preview only**, pending CEO approval
> (see `docs/SUPER_PRODUCT_EVALUATION.md §8`).

## How to see it

- **In the app:** Home → **"Try the AI Tutor (beta)"** → plays AI Operator Day 1,
  then chains to Day 2 and Day 3 via a "Next lesson →" button on completion.
- **Direct routes:** `/messenger/ai-operator-day1` · `…day2` · `…day3`.

## What's in this phase

| Piece | Path | Notes |
|------|------|------|
| Authoring format + prompt | `learning/authoring/` | LLM owns meaning; content-only JSON |
| Deterministic compiler | `learning/authoring/compile.mjs` | wires + **validates** the graph |
| Authored Days 1–3 | `learning/courses/ai_operator/day{1,2,3}.authoring.json` | from the existing AI Operator content |
| Compiled graphs | `learning/courses/ai_operator/day{1,2,3}.compiled.json` | 20 / 24 / 21 items — the runtime input |
| Types (mirror `lp_` tables) | `src/messenger/types.ts` | `CompiledItem`, `ItemButton`, mastery, events |
| Serve/resolve state machine | `src/messenger/resolve.ts` | **LLM-free**; the 5 actions |
| Ask escape hatch | `src/messenger/ask.ts` | grounded local retrieval + threshold; backend-ready |
| Mastery meter | `src/messenger/MasteryBar.tsx` | client mirror of `lp_concept_mastery` |
| Chat runtime UI | `src/messenger/ChatPlayer.tsx` | thread + button deck + Ask + XP |
| Route | `app/messenger/[lessonId].tsx` | registered in `app/_layout.tsx` |
| Preview DDL (NOT applied) | `learning/migrations/lp_00{1,2}_*.sql` | for Phase 2 |

## The three time horizons (only the middle one is in Phase 1)

- **Ingest** (Phase 2): chunk + embed `source_text`, LLM generates seeds, compile, insert.
  In Phase 1 this is the manual `compile.mjs` step + the committed compiled JSON.
- **Serve** (Phase 1, done): every tap is `resolveTap` over the local graph — **0 LLM calls**.
- **Ask** (Phase 1, grounded-or-declines): local retrieval over `source_text` with a
  similarity threshold; if `EXPO_PUBLIC_LP_ASK_URL` is set it POSTs to the real RAG
  endpoint instead. Either way it answers from the lesson or honestly declines.

## Acceptance — verified

- ✅ **A full button-only playthrough makes 0 LLM calls.** Proven by graph
  traversal across all three days: Day 1 20/20, Day 2 24/24, Day 3 21/21 items
  reachable, 0 dead ends, 1 escape hatch each (the only path that could call a
  model). Guided path: `menu → quiz → feedback → … → done`.
- ✅ **Ask stays grounded or honestly declines** (threshold short-circuit; no guessing).
- ✅ **No typing required to play** — buttons drive the whole lesson.
- ✅ New code typechecks clean (the only `tsc` errors are pre-existing in
  `HomeDesktop.tsx` / `tools/`, untouched here).

## How it maps to the existing engine

The compiled `item_type`s line up with TurboEd's step types (quiz ≈ mc/tf,
scenario, flash, feedback ≈ info). Phase 1 renders them as chat bubbles + a button
deck (the chat-native form of the compiled model). A future enhancement can slot
the richer step widgets (fillblank / match / builder) into bubbles via an
`itemType → widget` registry — the same registry discipline as `stepRegistry`.

## Deferred to Phase 2 (needs the §8 decision)

- Apply `lp_` migrations + `pgvector`; ingest pipeline as an Edge Function.
- Serve/resolve + Ask move behind Edge Functions reading `lp_lesson_items` /
  `lp_lesson_chunks`. **`ChatPlayer` does not change** — only the data source does.
- Flush `ProgressEvent`/mastery/XP to `lp_progress_events` + the existing gamification.
- Adaptive serving (difficulty / weak-concept SQL) and the real RAG Ask answer.
