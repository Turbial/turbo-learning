# Unified Guided Experience Platform — Phase 0: Architecture & Developer Handoff

**A reusable, mobile-first, JSON-driven guided-experience engine.**
Powers Turbo Academy, Duo, Turbo onboarding, FilmAssist, CreditSmith, and future guided programs from one codebase.
Version 1.0 — Phase 0 (architecture) — May 2026

---

## 0. Read this first

This is the **developer handoff** — the document a React Native engineer (or Claude working in Cursor/Claude Code) builds from. It assumes the *content* spec (the merged lesson engine + step catalog) is already agreed; this layer is the **technical architecture** that runs it.

Three things govern every decision below:

1. **Build the engine broad, the content narrow, the UI beautiful, the first demo complete.** The first shippable artifact is **one airtight Day 1**, not 28 days. Once Day 1 runs, the rest is mostly content JSON.
2. **The Step Renderer is the make-or-break component.** Every lesson is an ordered array of typed steps. Each step type is a self-contained component plugged into a registry. Adding a new step type must never require touching the lesson player.
3. **This is a guided-experience engine, not an AI course.** Nothing is AI-specific. The same engine carries Duo's relationship programs and FilmAssist's production training.

> **⚠️ Supabase note:** The schema in Section 5 is a **preview for approval**. Do not apply it to the live Supabase project until it's reviewed and signed off. Plan → approve → post.

---

## 1. Locked technology decisions

| Decision | Choice | Why (and what we rejected) |
|---|---|---|
| App framework | **Expo (React Native), standalone native** | Real iOS + Android apps **and** web from one codebase. We need mobile *soon*, so we are not wrapping a website (Capacitor) — wrapped apps feel like webviews, risk App Store rejection, and handle push/background/offline poorly. Rejected Next.js for the product because it can't ship a real native app without a wrapper or rebuild. |
| Web | **Expo web (React Native Web)** | Same codebase exports to browser. Validates "do people finish?" fast, with no app-store friction, without forking. |
| Marketing site | **Separate small Next/static site** | The only thing Next is genuinely better at (SEO, marketing pages). Built separately so the *product* is never built twice. |
| Routing | **Expo Router** (file-based) | Native + web routing from one tree. |
| Language | **TypeScript** everywhere | Step types are a discriminated union — types are the safety net for the renderer. |
| Backend | **Supabase** (Postgres + Auth + Storage + RLS) | No separate API server for V1. |
| Server state | **TanStack Query** | Caching, retries, offline-friendly fetching of programs/lessons/progress. |
| Session state | **Zustand** | Lightweight store for the live lesson player (current step, session XP, answer buffer). |
| Local persistence | **react-native-mmkv** (fallback to AsyncStorage on web) | Fast cache + offline queue. |
| Audio V1 | **Device-native TTS** — `expo-speech` (native) / Web Speech API (web) | Fastest working option: free, instant, zero pipeline. Get audio working now. |
| Audio V2 | **Pre-generated MP3** (ElevenLabs/OpenAI TTS) on **Cloudflare R2**, played via `expo-audio`/`expo-av` | Unlocks sentence-sync highlight, tap-to-jump, background/lock-screen, offline prefetch. |
| Push | **expo-notifications** (Expo Push) | Native push, one API. Phase 2. |
| Payments | **Stripe** | Deferred to the revenue phase. |

**Explicitly NOT in scope (do not overbuild):** payments, community/leaderboard, certificates, AI grading, video. The DB may reserve columns for later features, but no UI is built for them in early milestones.

---

## 2. Universal vocabulary (generic, branded per product)

The frontend and schema use **generic** terms so each product brands its own labels via config. Never hard-code "Course"/"Student"/"AI".

| Generic (engine) | Turbo Academy | Duo | Turbo onboarding | FilmAssist |
|---|---|---|---|---|
| **Program** | "AI Operator: 28 Days" | "28-Day Relationship Reset" | "Marketing Operator Setup" | "Production 101" |
| **Journey** | the 28-day path | the 28-day path | the setup path | the training path |
| **Unit** | Day 1 | Day 1 | "CRM Setup" | "Pre-Production" |
| **Lesson** | a lesson | a session | a step group | a module |
| **Step** | a step | a step | a step | a step |
| **Artifact** | a prompt/workflow | a reflection / communication script | a workflow/campaign | a shot list / script note |
| **User** | learner | partner | operator | crew member |

Labels live on the `programs` row (`unit_label`, `artifact_label`, etc.) and flow into the UI.

---

## 3. Expo project structure

```
app/                              # Expo Router routes (native + web)
  _layout.tsx                     # root: providers (Query, theme, auth gate)
  index.tsx                       # redirect → /onboard or /home
  onboard.tsx                     # single-scroll onboarding
  (tabs)/
    _layout.tsx                   # bottom tabs (mobile) / sidebar (web)
    home.tsx                      # Journey screen (the map)
    progress.tsx                  # XP, badges, streak calendar, review queue
  lesson/[id].tsx                 # Lesson Player
  complete/[unitId].tsx           # Unit Complete (XP tally, streak fire)
  deliverable/[id].tsx            # async Artifact submission (P1)

src/
  engine/                         # ← the heart; product-agnostic
    types.ts                      # Step discriminated union, Program/Unit/Lesson types
    stepRegistry.ts               # type → { component, validate, score, behavior }
    LessonPlayer.tsx              # drives progression, accumulates XP, persists
    lessonMachine.ts              # pure progression logic (advance/back/complete)
    scoring.ts                    # XP rules per step type
    narration/
      useNarration.ts             # audio abstraction (TTS now, MP3 later)
      nativeTts.ts                # expo-speech
      webTts.ts                   # Web Speech API
  components/
    steps/                        # ONE component per step type
      InfoStep.tsx
      ScenarioCardStep.tsx
      ExampleStep.tsx
      McStep.tsx
      TrueFalseStep.tsx
      HighlightStep.tsx
      GoodFitStep.tsx
      BuilderStep.tsx
      CopyActionStep.tsx
      PasteCaptureStep.tsx
      ReflectionStep.tsx
      CompletionStep.tsx
      # — added later, same pattern —
      MatchStep.tsx
      FillBlankStep.tsx
      QuizStep.tsx
      ScenarioJudgmentStep.tsx
      BadgeUnlockStep.tsx
      StreakCommitStep.tsx
      ReminderSetupStep.tsx
      CompareStep.tsx
      FallbackStep.tsx            # renders safely for unknown/not-yet-built types
    ui/                           # Button, Card, ProgressBar, XpPill, Chip, etc.
    journey/                      # JourneyMap, UnitStop, StreakBar, LevelBar
    gamification/                 # XpBurst, StreakFire, BadgeReveal
  data/
    supabase.ts                   # client
    queries.ts                    # TanStack Query hooks (programs, lesson, progress…)
    mutations.ts                  # writeStepResponse, completeLesson, updateStreak…
    types.gen.ts                  # supabase-generated DB types
  store/
    sessionStore.ts               # Zustand: current lesson session
    offlineQueue.ts               # queued writes when offline
  content/                        # local JSON during dev (Day 1 lives here first)
    ai_operator/day1.json
  theme/
    tokens.ts                     # colors, spacing, type scale (one source of truth)
  i18n/                           # label resolution (generic → branded)
  utils/
```

---

## 4. The Step Renderer architecture (core)

### 4.1 The step type model

Every step is a member of a TypeScript **discriminated union** keyed on `type`. This is what makes the renderer safe and extensible.

```ts
// src/engine/types.ts
type StepBase = { id: string; xp?: number; primaryButton?: string };

type InfoStep        = StepBase & { type: 'info' | 'scenario_card';
                                    title?: string; body: string;
                                    audioUrl?: string; cues?: Cue[] };
type ExampleStep     = StepBase & { type: 'example'; title?: string; prompt: string };
type McStep          = StepBase & { type: 'mc' | 'scenario';
                                    question: string; options: string[];
                                    correct: number; feedback: string[] };
type TrueFalseStep   = StepBase & { type: 'tf'; question: string;
                                    correct: boolean; feedback: string[] };
type HighlightStep   = StepBase & { type: 'highlight'; body: string; highlights: string[] };
type FillBlankStep   = StepBase & { type: 'fillblank'; question: string;
                                    answer: string; aliases?: string[]; feedback: string[] };
type MatchStep       = StepBase & { type: 'match'; pairs: { left: string; right: string }[] };
type GoodFitStep     = StepBase & { type: 'good_fit'; question: string;
                                    correct: 'good' | 'notideal'; feedback: string[] };
type QuizStep        = StepBase & { type: 'quiz'; questions: MiniQuestion[] };
type BuilderStep     = StepBase & { type: 'builder';
                                    fields: { id: string; label: string; placeholder?: string }[];
                                    template: string };
type CopyActionStep  = StepBase & { type: 'copy_action'; body: string; sourceStepId: string };
type PasteCaptureStep= StepBase & { type: 'paste_capture'; body: string; minLength?: number };
type CompareStep     = StepBase & { type: 'compare'; question: string };
type ReflectionStep  = StepBase & { type: 'reflection'; questions: ReflectionQuestion[] };
type BadgeUnlockStep = StepBase & { type: 'badge_unlock'; badgeSlug: string };
type StreakCommitStep= StepBase & { type: 'streak_commitment'; commitOptions: number[] };
type ReminderStep    = StepBase & { type: 'reminder_setup'; reminderOptions: string[] };
type CompletionStep  = StepBase & { type: 'completion'; title?: string; body: string };

export type Step =
  | InfoStep | ExampleStep | McStep | TrueFalseStep | HighlightStep
  | FillBlankStep | MatchStep | GoodFitStep | QuizStep | BuilderStep
  | CopyActionStep | PasteCaptureStep | CompareStep | ReflectionStep
  | BadgeUnlockStep | StreakCommitStep | ReminderStep | CompletionStep;
```

### 4.2 The registry (the plug-in point)

Each step type registers four things: its **component**, how to **validate** a response, how to **score** it, and its **behavior** (does it require an interaction, does it auto-advance). Adding a type = add a component + one registry entry. **The LessonPlayer never changes.**

```ts
// src/engine/stepRegistry.ts
type StepResponse = unknown; // per-type shape, stored as JSONB

interface StepHandler<S extends Step = Step> {
  component: React.FC<StepProps<S>>;
  validate?: (step: S, res: StepResponse) => boolean;   // correct?
  score?:    (step: S, res: StepResponse) => number;    // XP earned
  behavior:  { requiresInteraction: boolean; autoAdvanceMs?: number };
}

export interface StepProps<S extends Step> {
  step: S;
  onAnswer: (res: StepResponse) => void;   // step reports its result up
  onContinue: () => void;                   // for info/system steps
  narration: NarrationController;           // play/pause/speed/transcript
}

export const stepRegistry: Record<Step['type'], StepHandler> = {
  info:              { component: InfoStep,        behavior: { requiresInteraction: false } },
  scenario_card:     { component: ScenarioCardStep,behavior: { requiresInteraction: false } },
  example:           { component: ExampleStep,     behavior: { requiresInteraction: false } },
  mc:                { component: McStep,           validate: mcCorrect, score: mcScore,
                       behavior: { requiresInteraction: true, autoAdvanceMs: 1800 } },
  // …one entry per type…
  // Unknown/not-yet-built types fall through to FallbackStep (never crashes).
};
```

### 4.3 The LessonPlayer (generic driver)

```
LessonPlayer(lessonId):
  1. fetch lesson.steps (TanStack Query) → array of Step
  2. session state (Zustand): index=0, sessionXp=0, responses={}
  3. for current step:
       look up handler = stepRegistry[step.type]
       render <handler.component step onAnswer onContinue narration />
  4. on onAnswer(res):
       correct = handler.validate?.(step, res)
       xp      = handler.score?.(step, res) ?? step.xp ?? 0
       persist step_responses row (debounced, optimistic; queue if offline)
       add xp to sessionXp; show XpBurst
       if behavior.autoAdvanceMs → advance after delay, else wait for Continue
  5. on last step complete:
       write lesson_progress (xp_earned, score, completed_at)
       update streak_log + users.xp/level + maybe badge unlocks
       route → /complete/[unitId]
```

Key properties:
- **Content enforces the rhythm** ("never same interaction twice", "≤30s reading") — the engine does not. Authors order steps; the engine just plays them.
- **Audio is a layer, not a step.** `narration` is passed to every step. Info steps auto-play; interactions auto-pause and resume on answer.
- **Responses are the portfolio + review source.** Every `step_responses` row (built prompts, pasted results, reflections) feeds the "My Work" view and the spaced-repetition queue later.

---

## 5. Supabase schema (PREVIEW — for approval before applying)

Generalized to multi-program, with later-phase columns reserved now so no migration is needed when we turn those features on.

```sql
-- PROGRAMS / CONTENT (world-readable)
create table programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  unit_label text default 'Day',
  artifact_label text default 'Artifact',
  level_names jsonb,                 -- per-program level ladder
  journey_shape text default 'linear',
  created_at timestamptz default now()
);

create table units (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references programs(id) on delete cascade,
  order_num int not null,
  label text,                        -- "Day 1"
  title text not null,
  theme text,
  deliverable_id uuid
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references units(id) on delete cascade,
  order_num int not null,
  title text not null,
  est_minutes int,
  steps jsonb not null               -- the ordered Step[] array
);

-- USERS / PROGRESS (own-rows only)
create table profiles (               -- 1:1 with auth.users
  id uuid primary key references auth.users(id) on delete cascade,
  name text, email text,
  goal text, daily_mins int, learn_time text,
  streak int default 0,
  shield_count int default 0,         -- reserved (shields = later)
  xp int default 0,
  level int default 1,
  created_at timestamptz default now()
);

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  program_id uuid references programs(id),
  started_at timestamptz default now(),
  current_unit_id uuid references units(id)
);

create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id),
  completed_at timestamptz default now(),
  xp_earned int default 0,
  score numeric
);

create table step_responses (         -- answers, built prompts, pastes, reflections
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

create table deliverables (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references units(id) on delete cascade,
  title text, instructions text, template_url text
);

create table deliverable_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  deliverable_id uuid references deliverables(id),
  submitted_at timestamptz default now(),
  file_url text, text text, xp_awarded int default 0
);

create table badges (                  -- seeded, world-readable
  id uuid primary key default gen_random_uuid(),
  slug text unique, name text, icon text, unlock_condition text
);

create table user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  badge_id uuid references badges(id),
  earned_at timestamptz default now()
);

create table review_queue (            -- spaced repetition (logic = later phase)
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  step_id text not null,
  lesson_id uuid references lessons(id),
  due_at timestamptz,
  interval_days int default 1,
  ease numeric default 2.5,
  last_result text
);
```

**RLS policy summary**

- `programs`, `units`, `lessons`, `badges`, `deliverables` → **public read**, no public write (content managed by admin/service role).
- `profiles`, `enrollments`, `lesson_progress`, `step_responses`, `streak_log`, `deliverable_submissions`, `user_badges`, `review_queue` → **`auth.uid() = user_id`** for select/insert/update; no cross-user access.
- Storage bucket `deliverables/` → user can write/read only under their own `user_id/` prefix.

---

## 6. State management plan

**Server state — TanStack Query** (source of truth, cached):
`useProgram(slug)`, `useUnit(id)`, `useLesson(id)`, `useProfile()`, `useProgress()`, `useBadges()`.

**Session state — Zustand** (`sessionStore`), the live lesson only:
```
{ lessonId, stepIndex, sessionXp, responses: Record<stepId, res>,
  advance(), back(), recordAnswer(stepId, res, xp), reset() }
```

**Persistence rules**
- Write a `step_responses` row as each step is answered (debounced, optimistic UI). If offline, push to `offlineQueue` and flush on reconnect.
- Write `lesson_progress` + streak/XP/level updates **once** on lesson completion (single transaction via an RPC `complete_lesson` to keep it atomic).
- Profile XP/level is **derived and cached server-side** on completion, not recomputed on the client each render.

---

## 7. Audio & offline plan (two layers)

**Audio V1 (now) — `useNarration` abstraction**
- Native → `expo-speech`; Web → Web Speech API. Same interface either way.
- Controls: play / pause, speed (0.8–2×), transcript shown as **plain text** (no per-sentence highlight yet).
- Interactions auto-pause; resume on answer.
- *Limitation accepted for V1:* native TTS has no reliable background/lock-screen playback, so the "screen-off, audio keeps playing, streak still counts" feature **waits for V2.**

**Audio V2 (later)**
- Pre-generate one MP3 per `info`/`scenario_card` step (ElevenLabs/OpenAI TTS) + sentence-timestamp `cues`; store on R2.
- `expo-audio`/`expo-av` playback → sentence-level highlight, tap-to-jump, background/lock-screen, offline prefetch.
- The `audioUrl`/`cues` fields are already in the step schema, so no content rework — just swap the narration backend.

**Offline V1 (light)**
- Cache the active program's lesson JSON locally (MMKV).
- Queue `step_responses` + completion writes when offline; flush on reconnect.
- Full prefetch of audio/units is a V2 concern.

---

## 8. Component inventory

**Engine:** `LessonPlayer`, `StepRenderer` (via registry), `lessonMachine`, `scoring`, `useNarration`.
**Step components (Milestone 2 set, in bold):** **InfoStep, ScenarioCardStep, ExampleStep, McStep, TrueFalseStep, HighlightStep, GoodFitStep, BuilderStep, CopyActionStep, PasteCaptureStep, ReflectionStep, CompletionStep**, FallbackStep. *(Later: MatchStep, FillBlankStep, QuizStep, ScenarioJudgmentStep, BadgeUnlockStep, StreakCommitStep, ReminderSetupStep, CompareStep.)*
**UI primitives:** Button, GhostButton, Card, Chip/Pill, ProgressBar, TextField, Toast.
**Journey/gamification:** JourneyMap, UnitStop, StreakBar, LevelBar, XpPill, XpBurst, StreakFire, BadgeReveal.
**Screens:** Onboard, Home/Journey, LessonPlayer screen, UnitComplete, Progress, Deliverable (P1).

---

## 9. Build milestones (vertical slices)

Each milestone is shippable/testable on its own. **The make-or-break demo is the end of M2.**

| # | Milestone | Delivers | Done when… |
|---|---|---|---|
| **M0** | This doc + schema sign-off | Architecture locked; Supabase schema approved & applied | Schema live in Supabase; Expo app boots. |
| **M1** | App shell + auth + content loading | Expo app (native + web), Supabase auth, program/unit/lesson fetch, LessonPlayer **shell** that can step through a JSON lesson | A lesson loads from JSON and you can tap through placeholder steps. |
| **M2** | **Step renderer + core 12 types** | StepRenderer registry + the 12 bold components; full Day 1 loop | **Onboard → open Day 1 → info/highlight/mc/tf/good_fit → build → copy → paste → reflect → earn XP → complete → see progress.** Runs on your phone via dev build. |
| M3 | Gamification foundation | XP, basic levels, streak (no shields), badge table, completion screen, progress path | XP accrues, streak increments, badge unlocks, progress reflects it. |
| M4 | Full step catalog + onboarding polish | match, fillblank, quiz, scenario_judgment, badge_unlock, streak_commitment, reminder_setup, compare; polished onboarding | All 18 step types render and score correctly. |
| M5 | Audio V1 | `useNarration` (native TTS + web), play/pause/speed, text transcript | Every info card can be listened to on device and web. |
| M6 | Retention plumbing | Push/reminders, light offline queue, journey-map polish | Reminder fires at chosen time; responses survive offline. |
| M7 | Multi-program + later features | Second program (Duo) loaded; then audio V2, shields, spaced repetition, mastery, payments | Engine proven reusable across products. |

**First public-facing milestone for users = M2.** Everything after is depth, not the proof.

---

## 10. Content pipeline ("structure develops, then content gets populated")

The engine is content-agnostic; content is data. The workflow:

1. **Engine first.** Build M1–M2 against a single local `content/ai_operator/day1.json`. No CMS, no bulk content — just enough to prove the loop.
2. **You author / present the content.** Content is written and reviewed by you, not auto-generated in bulk. The step schema (Section 4.1) is the authoring contract.
3. **Preview → approve → load.** Before any content (or schema) goes into Supabase, it's presented as a plan/preview for your approval, then posted. Nothing lands in the database unreviewed.
4. **Scale by JSON, not by code.** Once Day 1 is validated, Days 2–28 — and entirely new programs (Duo, FilmAssist) — are added by writing `steps` JSON and inserting `units`/`lessons` rows. No engine changes.
5. **Optional later:** a Notion/Sheets → JSON authoring flow so non-developers can write steps. Not needed for the first programs.

---

## 11. Definition of done for Phase 0 → start of build

Phase 0 is complete and M1 can begin when:

- [ ] Stack confirmed (Section 1) — **done**.
- [ ] Schema (Section 5) reviewed, approved, and applied to Supabase (after your sign-off).
- [ ] Expo project initialized with the structure in Section 3.
- [ ] `Step` union + `stepRegistry` + `LessonPlayer` skeleton scaffolded (Section 4).
- [ ] One real `day1.json` authored to the schema (the reference content), approved by you.

After that, M1 → M2 produces the demo you can hold on your phone.

---

*Next deliverable after sign-off: scaffold the Expo project + `engine/` core (types, registry, LessonPlayer skeleton) and the Day 1 JSON — then build the 12 core step components to reach the M2 demo.*
