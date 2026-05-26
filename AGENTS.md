# AGENTS.md — Turbo Learning

## Project Identity

- **Name:** Turbo Learning — Unified Guided Experience Platform
- **Repo:** `Turbial/turbo-learning`
- **Stack:** Expo (React Native) + Supabase + TypeScript
- **Owner:** Turbile CEO (Builder)
- **Phase:** M0–M1 complete; M2 step renderer complete; M3 gamification in progress

## Architecture (Non-Negotiables)

1. **Engine is product-agnostic.** The `src/engine/` directory runs all programs (Turbo Academy, Duo, FilmAssist) from the same codebase. Never hard-code program-specific labels in engine files.

2. **The Step Renderer is the contract.** Adding a step type = add a component in `src/engine/components/steps/` + one registry entry in `stepRegistry.ts`. The LessonPlayer never changes. FallbackStep catches unknown types safely.

3. **Content is JSON.** Lessons are arrays of Step objects. No hard-coded lesson content in components. Local JSON during dev (M1–M2), Supabase in M3+.

4. **Schema changes go through review.** `supabase/migrations/` files are for approval before applying. Never apply migrations to the live project without sign-off.

5. **Theme tokens are the single source of truth.** `src/theme/tokens.ts` — all colors, spacing, typography reference this file.

## Commands

```bash
npm install              # install deps
npm run web              # start web dev server
npx expo start           # start Expo dev server (all platforms)
npx expo build:web       # production web build
```

## Current State

| Milestone | Status |
|-----------|--------|
| M0: Architecture + schema | ✅ Architecture doc approved; schema pending review |
| M1: App shell + routing | ✅ Built — needs smoke test |
| M2: Step renderer + 12 core types | ✅ All 12 M2 components built |
| M3: Gamification (XP/streak/badges) | 🔜 |
| M4: Full step catalog + polish | 🔜 |
| M5: Audio V1 | 🔜 |
| M6: Retention (push/offline) | 🔜 |
| M7: Multi-program | 🔜 |

## Step Types — Implementation Status

**Built (12):** info, scenario_card, example, mc, tf, highlight, good_fit, builder, copy_action, paste_capture, reflection, completion

**M4 (6):** fillblank, match, quiz, compare, badge_unlock, streak_commitment, reminder_setup — currently render FallbackStep

## Key Files

```
src/engine/types.ts              # Step union + all content/progress types
src/engine/stepRegistry.ts        # Type → component/validate/score mapping
src/engine/LessonPlayer.tsx       # Generic progression driver
src/engine/lessonMachine.ts       # Pure state transitions
src/engine/scoring.ts             # XP + level math
src/engine/narration/useNarration.ts  # TTS abstraction
src/engine/components/steps/      # 12 step components
src/theme/tokens.ts               # Design tokens
src/content/ai_operator/day1.json # Day 1 reference content
supabase/migrations/              # SQL migrations (pending review)
```

## Rules

- Read `CLAUDE.md` before coding
- Build against local JSON first; Supabase integration comes after smoke test passes
- No AI-specific hard-coding — this engine serves all programs
- Test changes on web before native
- Commit atomic changes with descriptive messages
