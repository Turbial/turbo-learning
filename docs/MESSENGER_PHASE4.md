# Messenger — Phase 4 (personalization)

Same lesson, framed to the learner. A student sets their **industry**, **skill
level**, and **goal**, and the tutor frames its **Ask** answers to that context —
a contractor and a church leader get the same Day 1, explained in their terms.

**Crucially this adds ZERO LLM calls:** personalization rides the one Ask call that
already happens. The cached button content (quizzes, scenarios, feedback) is never
re-generated per student — so the cost shape from Phases 1–3 is unchanged.

## Live in the app today (local)

- `src/messenger/profile.ts` — a persisted learner profile (`industry` /
  `skillLevel` / `goal`) + helpers (`profileSummary`, `profilePrompt`). Mirrors the
  `lp_users.industry/skill_level/goal` columns for Phase 2.
- `src/messenger/PersonalizeSheet.tsx` — a bottom sheet to set it (industry chips,
  skill chips, goal field).
- `ChatPlayer`: a **⚙ gear** in the header opens the sheet; the sub-line shows
  **"Tailored for \<industry\> · \<level\>"** once set. The profile is passed into
  every Ask. Local retrieval can't rewrite content, so it frames the citation
  ("relevant to your work in \<industry\>"); the real reframing arrives with the
  backend LLM Ask below.

## Behind the gate (Phase 2 backend extension)

- `lp-ask` accepts a `profile_prompt` in the request body (sent by `ask.ts`).
- `lp_llm.answerGrounded` appends it to the system prompt, so DeepSeek frames the
  grounded answer to the student's field — **on the same call**, no extra request.

## What this delivers

> A contractor asks "how do I start?" and the tutor answers with a missed-call /
> estimate example; a church leader asks the same and gets a volunteer-scheduling
> example — from the *same* lesson, the *same* cached buttons, and the *same* single
> Ask call.

New code typechecks clean (errors unchanged at 43, all pre-existing).

## Roadmap status

- ✅ Phase 1 — messenger MVP (Days 1–3, chained)
- ✅ Phase 2 — generate backend (DeepSeek ingest/serve/ask, behind the gate)
- ✅ Phase 3 — adaptive + weak-area detection (client live, backend gated)
- ✅ Phase 4 — personalization (client live, backend gated)
- ⏭️ Phase 5 — creator tools (one-click author→ingest) + MightyMax funnel handoff;
  wire `ChatPlayer` to the async backend serve path to flip the §8 switch fully.
