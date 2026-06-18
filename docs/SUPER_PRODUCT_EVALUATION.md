# Super Product Evaluation — Pivoting TurboEd toward the LLM Messenger

*Evaluation prepared 2026-06-13. Inputs: the live `turbo-learning` codebase
(branch `feat/claude-design-merge` / `claude/great-hypatia-mcjape`) and the
uploaded `learning_platform` (LP) build-spec package.*

---

## 0. TL;DR — the one-paragraph answer

We already own two of the three hardest things to build (a polished cross-platform
app with 20 interactive step types + gamification, and 40+ days of high-quality
authored content). The LP package is the **third piece**: a cache-first,
chat-driven AI tutor architecture with bounded economics. They are not competing
designs — **they are the front-end and back-end of the same product, and they
target the same Supabase project.** The "super product" is:

> **A conversational AI tutor (a messenger thread of bot messages + tap buttons)
> that renders TurboEd's existing interactive step widgets as chat bubbles, served
> cache-first from a versioned content graph, with a single grounded "Ask anything"
> escape hatch — and with course content authored by an LLM but structured by a
> deterministic compiler.**

Think **Duolingo's daily habit loop × ChatGPT's conversational feel**, where the
AI *cost* is bounded by design (≈0 inference at play time) and the content *moat*
shifts from "we wrote good lessons" to "drop raw text, get a playable, adaptive,
conversational course — safely, by construction."

The pivot is real (content model, interaction model, economics, and moat all
change), but the migration is **low-risk because almost nothing is thrown away** —
our step components become the bubble renderers, and our authored content becomes
the seed graph and the generator's gold-standard eval set.

---

## 1. What we have today (the assets)

| Asset | State | Role in the super product |
|---|---|---|
| Expo app (iOS/Android/Web, one codebase) | ✅ shipping | **Keep** — the shell, routing, theme, auth |
| Step engine: 20 step types, discriminated union, `stepRegistry` → `LessonPlayer` | ✅ built | **Keep the components, replace the player** |
| Gamification: XP, streaks, badges, leaderboard, combos, celebrations | ✅ built | **Keep** — rewire to `lp_progress_events` |
| 40+ days authored content (AI Operator 28d, AI for Everyone, Duo 7d) | ✅ built | **Migrate** → seed graph + generator eval set |
| HD audio narration (TTS + pre-gen MP3) | ✅ built | **Keep** — narrate bot bubbles |
| Supabase auth + project `afgmlkduuapquqkcqdsk` | ✅ live | **Keep** — *the exact DB the LP schema targets* |
| Supabase Edge Functions (payments) | ✅ deployed | **Pattern to reuse** for ingest/serve/ask |
| Payments scaffolding (Stripe/PayPal) | ⚠️ partial | Keep for distribution layer |
| `chat` step + `ChatStep.tsx` + `ChatWidget.tsx` | ⚠️ stubbed (`callLLM`, registered as Fallback) | **Becomes** the Ask escape-hatch UI |
| Strategy: TurboEd **Create** (creators) + **School/ESA** (K-12) | 📄 documented | Becomes the **distribution**, not the product |

**The non-obvious gift:** `src/data/supabase.ts` points at project
`afgmlkduuapquqkcqdsk` — the **same shared DB** the LP package's `SCHEMA.md`
targets and namespaces with `lp_` tables. The two designs were always meant to
live together. There is no integration-of-strangers problem here.

---

## 2. What the LP package adds (the messenger)

The LP spec is a complete, opinionated build for an **AI tutor that turns static
content into a button-driven, gamified, guided chat experience**, on three time
horizons:

- **Ingest time** (once per lesson *version*, ≤3 LLM calls): hash content →
  chunk + embed → generate a *pool* of game items (quiz/scenario/flash/feedback)
  with answer keys and button structures → validate → insert, stamped with a
  `content_version`.
- **Serve time** (every tap, **0 LLM calls**): a 5-action state machine
  (`goto` / `answer` / `branch` / `mode` / `escape`) walks pre-generated rows from
  `lp_lesson_items`. Adaptivity ("harder after a streak", "re-drill a missed
  concept") is a **smart SQL query over the pool** — it *feels* like live AI but
  costs nothing.
- **Ask time** (the only live student-facing call): free-text → embed → pgvector
  retrieval over `lp_lesson_chunks` → threshold short-circuit ("not covered" with
  **no** model call) or one grounded answer.

Plus the authoring pipeline that makes it safe: **raw text → (LLM) authoring JSON
→ (deterministic) `compile.js` → validated playable graph.** The compiler — not
the model — assigns ids, wires every button pointer, builds menu/feedback/done
steps, and rejects dangling pointers / unreachable steps / multi-correct quizzes.

### The discipline we must not lose
> **LLM owns meaning. Code owns structure.** The model never emits the final
> playable JSON (it occasionally wires a button to a step that doesn't exist and
> breaks a lesson). It emits flat content-only JSON; the compiler builds and
> *validates* the graph. This already caught an unreachable-step bug during
> development of the LP example. This is the single most important rule in the
> whole pivot.

---

## 3. The core insight: these are two altitudes of the same engine

Our current engine is a **linear array** of typed steps rendered by a registry.
The LP engine is a **graph** of typed items connected by button `to` pointers,
served from a DB. They line up almost 1:1:

| TurboEd `Step.type` | LP `lp_lesson_items.item_type` | Merge action |
|---|---|---|
| `info` / `highlight` / `example` / `scenario_card` | `menu` / narrative `feedback` | render as bot bubble |
| `mc` / `scenario` / `tf` / `good_fit` | `quiz` | render widget, map answer → `answer` action |
| `fillblank` / `match` / `quiz` | `quiz` (multi) | render widget in-bubble |
| `reflection` / `builder` / `paste_capture` | assignment (LP Phase 3) | render widget, store artifact |
| `completion` | `done` | render + trigger celebration |
| `chat` (stubbed) | `escape` → Ask service | **this is the Ask hatch** |

So the pivot is not "rip out the engine." It is:

1. **Keep the step components** (they're already React Native, already polished).
2. **Replace the driver:** swap the linear `LessonPlayer` (a reducer over a static
   array) for a **`ChatPlayer`** that renders those same components *as bubbles in
   a thread*, driven by the LP serve/resolve state machine over DB rows.
3. **Change where content comes from:** hand-authored static JSON → LLM-generated,
   compiler-validated, **versioned graph** in Supabase.

The LP package ships a chat-bot reference UI (`lesson_game_bot.jsx`) but **no real
step widgets** (just text buttons). We ship 20 real widgets but **no conversation**.
Merging them yields a messenger with *rich interactive bubbles* — strictly better
than either alone.

---

## 4. Why this is the right "super product" (and the moat)

| Today | After the pivot |
|---|---|
| Static app, no inference, manual authoring | AI-native, but **cache-first** so margins stay healthy |
| Swipe through fixed steps | **Converse** with a tutor; tap buttons; ask anything |
| Moat = "we authored good content" | Moat = **"drop raw text → playable adaptive course, safe by construction"** |
| One-size content | **Adaptive** (difficulty + weak-concept) and **personalizable** (industry/goal) at ~0 marginal cost |
| Education is the product | Education is a **funnel** — assignment artifacts hand off to MightyMax ("want it built for you?") |

The economics are the strategic unlock: **a student can play an entire lesson —
quizzes, scenarios, flashcards, the full guided game — for zero model calls.** Cost
scales with *content volume* and *typed questions*, not with play volume. That is
the healthy shape for a course platform and what lets the Create/School/ESA
business models actually have margin.

This also resolves the two-strategy tension cleanly:
- **The messenger is the product.**
- **Create / School / ESA are the distribution** (who pays, how courses get in).
- **MightyMax is the funnel** (education → done-for-you build).

---

## 5. Reuse vs. build — the concrete map

**Keep as-is:** Expo shell, routing, theming, Supabase auth, gamification engine,
the 20 step components, narration, payments scaffolding.

**Adapt:**
- `LessonPlayer` → `ChatPlayer` (thread + button deck driven by serve/resolve).
- `stepRegistry` → also a **`itemType → bubble renderer`** map (same pattern, new caller).
- `ChatStep.tsx` / `ChatWidget.tsx` → the **Ask escape-hatch** UI (real RAG call).
- 40 days of content → run through `compile.js` → first live `lp_lesson_items`.

**Build new (mostly Supabase Edge Functions — we already deploy these):**
- `lp_` migrations + `pgvector` (preview only until approved).
- Ingest pipeline: chunk → embed → generate pool → validate → insert.
- Serve/resolve/ask endpoints (the 5-action state machine + RAG).
- Authoring pipeline: formatting prompt + `course_authoring.schema.json` + `compile.js`.
- `lp_concept_mastery` rollups + adaptive selection query.
- `lp_llm_usage` telemetry from day one.

**The de-risking move:** our 40 authored days are the **seed and the eval set**.
Compile them to populate real lesson graphs *without waiting on the generator*, and
keep them as the golden reference the generator is measured against. Nothing is
wasted — the content gets a better container.

---

## 6. Recommended phased plan

Merges LP's `BUILD_PLAN.md` with TurboEd's reality. Each phase ships something real.

- **Phase 0 — Decide & scaffold (needs CEO).** Approve applying `lp_` migrations +
  `pgvector` to the existing Supabase project. Confirm the **model split** (cheap
  model for generation + simple Ask; strong model for assignment feedback + complex
  Ask). Stand up the Edge Function skeletons. *This is the only true gate.*

- **Phase 1 — The messenger MVP (the whole point).** Build `ChatPlayer` that
  renders existing step components as chat bubbles, driven by serve/resolve over
  `lp_lesson_items`. Migrate **AI Operator Day 1** via `compile.js` as the first
  live graph. Wire the Ask hatch (RAG + similarity threshold).
  **Acceptance:** a full button-only playthrough = **0 LLM calls**; Ask stays
  grounded or honestly declines. No typing required to play.

- **Phase 2 — Generate + adapt.** Ingest pipeline (raw text → authoring JSON →
  compile → insert + embed). Adaptive serving (difficulty / weak-concept / no-repeat
  SQL). `lp_concept_mastery` rollups surfaced in progress.
  **Acceptance:** drop a transcript, get a playable conversational lesson; the bot
  serves harder items after a streak and re-drills a missed concept.

- **Phase 3 — Creator tools + funnel.** One-click "regenerate" for creators;
  assignment artifacts shaped to be machine-readable so they flow into MightyMax.
  This is where **Create** and **School** plug into the same engine.

- **Phase 4+ — Personalization, community, ESA compliance, notifications.** Last,
  on purpose. We already have gamification, so the temptation to start here is real
  — resist it. *A social/leaderboard shell without a working tutor is a hollow
  platform* (LP's words, and correct).

---

## 7. Risks & honest cautions

1. **Auto-publish + wrong answer keys (LP's own flagged risk).** A quiz with a
   wrong key actively teaches the wrong thing — a uniquely damaging failure. The
   review gate is one env flag away (`LP_REQUIRE_REVIEW`). **Recommendation:** turn
   it on for graded items at minimum, and use our authored content as a regression
   suite for the generator.
2. **Latency.** The serve/Ask path must be a **direct, low-latency** model call, not
   routed through any orchestrator. LP recorded this explicitly; honor it.
3. **Web reference UI ≠ our runtime.** `lesson_game_bot.jsx` is web React; our app
   is React Native. The thread must be rebuilt with RN primitives (e.g. a `FlatList`
   of bubbles) — but the *step widgets are already RN*, so that seam is natural.
4. **Scope discipline.** Tutor first. Don't polish community/leaderboard before the
   messenger works end-to-end on one real lesson.
5. **Cost visibility.** Log `{lesson_id, call_type, model, tokens, cost_est,
   latency_ms}` from the first ingest call, not later.
6. **Migrations are preview-only** until the CEO approves DDL on the shared DB
   (standing rule, 47 existing tables, `lp_`-namespaced to avoid collision).

---

## 8. The single decision needed to start

**Approve applying the `lp_` migrations + `pgvector` to the existing Supabase
project, and confirm the model split.** Everything in Phases 1–2 is buildable
behind that one gate — and Phase 1 reuses our app shell, our step components, our
gamification, and one already-authored lesson, so the first playable
"messenger" lesson is a *small* build, not a rewrite.

> Recommendation: **proceed.** The pivot multiplies the value of everything already
> built rather than replacing it, the backend is shared, and the economics finally
> give the Create/School/ESA business models real margin. Start with Phase 1 on AI
> Operator Day 1 to prove the loop, then turn on the generator.
