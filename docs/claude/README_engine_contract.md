# Guided Platform — Engine Contract Drop (for the build team / DeepSeek)

This is the **frozen contract** for M1 → M2A. Build against these files; do not re-invent the interfaces. Two halves: the **Supabase gate** (approve first) and the **engine contract** (build against).

## ⚠️ Approval gate — do this before any code touches Supabase
`supabase/migrations/0001_schema.sql` and `0002_seed_ai_for_everyone.sql` are a **PREVIEW**. They are not applied yet. Review → approve → then apply with the **service key** (admin), never from the client. Nothing lands in the live database unreviewed.

```
supabase/migrations/
  0001_schema.sql                 tables + constraints + RLS + complete_lesson() RPC + calc_level() + new-user trigger
  0002_seed_ai_for_everyone.sql   Program 1 (beginner) + Day 1 unit/lesson (13 steps) + badges
```

Key schema guarantees the engine relies on:
- `unique` constraints on unit/lesson ordering, one progress row per `(user,lesson)`, one response per `(user,lesson,step)`, one streak row per `(user,date)`, one award per `(user,badge)`.
- **`complete_lesson(p_lesson_id, p_session_xp, p_local_date)` is idempotent** — a second call (double-tap) adds **no** XP. Pass the user's **local** date for correct streaks.
- RLS: content is public-read / admin-write; all user tables are own-rows-only.

## Engine contract — build against these
```
src/engine/
  types.ts            ← THE CONTRACT. Step discriminated union (all 18 types) + Lesson/Unit/Program + CompleteLessonResult.
  stepRegistry.ts     ← StepProps (component contract) + StepHandler + Partial registry + getHandler() fallback. NarrationController.
  scoring.ts          ← centralized validate() + score() per type. The player never hard-codes XP.
  lessonMachine.ts    ← pure progression logic (testable, no React).
  LessonPlayer.tsx    ← generic driver SKELETON. Contains NO per-step logic (non-negotiable).
  narration/useNarration.ts  ← audio abstraction (V1 stub; M2B fills native/web TTS).
src/store/sessionStore.ts     ← Zustand: live lesson session only.
src/data/
  supabase.ts         ← shared client (wire env vars in M1).
  mutations.ts        ← upsertStepResponse() + completeLesson() (calls the RPC).
src/components/steps/
  FallbackStep.tsx    ← safety net for unknown/unbuilt types (never crashes).
  InfoStep.tsx        ← REFERENCE non-interactive component (info / scenario_card).
  McStep.tsx          ← REFERENCE interactive component (mc / scenario): tap → feedback → onAnswer → player auto-advances.
```

## How to add a step type (the whole point)
1. Add the variant to the `Step` union in `types.ts` (already done for all 18).
2. Write `components/steps/XStep.tsx` implementing `StepProps<XStep>` — clone `InfoStep` (non-interactive) or `McStep` (interactive).
3. Add one entry to `stepRegistry` ( component + optional validate/score + behavior ).
4. Done. **`LessonPlayer.tsx` never changes.**

## The contract in one paragraph
A lesson is `Step[]`. `LessonPlayer` reads the current step, calls `getHandler(step.type)` (always returns — unknown types fall back), and renders `handler.component` with `{ step, onAnswer, onContinue, narration }`. Interactive steps call `onAnswer(res)`; the player runs `handler.validate`/`handler.score`, upserts the response, adds XP to the session, and auto-advances per `behavior.autoAdvanceMs`. Non-interactive steps call `onContinue`. On the last step the player calls the idempotent `completeLesson` RPC and routes to the Unit Complete screen.

## M2A definition of done (the make-or-break demo, NO audio)
Onboard → open AI-For-Everyone Day 1 → info → mc → scenario_card → example → builder → copy → paste → reflection → good_fit ×2 → completion → XP/streak written → Unit Complete screen — running on a real phone via an Expo dev build.

Core types to implement for M2A: **info, scenario_card, example, mc, good_fit, builder, copy_action, paste_capture, reflection, completion** (tf + highlight optional for the demo; rest are M4). info/scenario_card/mc are already wired in the registry as reference.

## Dependencies (M1)
`expo`, `expo-router`, `react-native-web`, `@supabase/supabase-js`, `@tanstack/react-query`, `zustand`, `react-native-mmkv`. Audio (`expo-speech`) lands in M2B.
