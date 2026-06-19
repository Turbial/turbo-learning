# Messenger — Phase 3 (adaptive + weak-area detection)

Completes the "adapt" half of generate-and-adapt: the tutor now tracks per-concept
mastery and **adapts what it serves** — surfacing the student's weakest concept and
drilling it at a difficulty tuned to their recent streak. Still **LLM-free** —
adaptivity is selection over the pool, not a model call ("feels like live AI, is a
smart query"). Unlike Phase 2, the client half is **live in the Phase 1 app now**;
the backend half is deploy-ready behind the §8 gate.

## Live in the app today (local, no backend)

- `src/messenger/adaptive.ts` — pure selection: `weakestConcept(mastery)`,
  `targetDifficulty(streak)`, `pickAdaptiveItem(...)` (weakest concept → nearest
  target difficulty → prefer not-yet-served, re-drill if exhausted).
- `ChatPlayer` tracks served items + an answer streak, and once there's mastery
  data it offers **"🎯 Drill your weak spot: <concept>"** on the menu and the
  completion step. Tapping jumps to a quiz on the weakest concept.
- The `MasteryBar` already shows per-concept progress; the drill closes the loop.

Verified against the real Day 1 graph: with `prediction_engine` answered wrong and
the others right, the drill selects the `prediction_engine` quiz.

## Deploy-ready behind the gate (Phase 2 backend extension)

- `learning/migrations/lp_003_rls_and_functions.sql` (PREVIEW) adds:
  - `lp_weak_concept(user, lesson)` → the lowest-mastery concept.
  - `lp_next_adaptive(user, lesson, version, difficulty, concept)` → next quiz by
    weak concept + target difficulty + no-repeat (the SQL mirror of `pickAdaptiveItem`).
- `lp-serve` gains two ops: `progress` (mastery + weak concept) and `next-adaptive`.
- `src/messenger/backend.ts` gains `backendProgress` / `backendNextAdaptive`
  (feature-flagged; off until `EXPO_PUBLIC_LP_SERVE_URL` is set).

Cost shape is unchanged: adaptive serving makes **0 LLM calls** — it's a DB select.

## Still ahead (Phase 4+)

- Personalization: inject `industry` / `skill_level` / `goal` into Ask + feedback.
- Creator tools: one-click author→ingest from raw text (wraps `lp-ingest`).
- MightyMax funnel: machine-readable assignment artifacts + handoff.
- Wire `ChatPlayer` to the async backend serve path to flip the §8 switch fully.
