# How to Add a Functionality — Extensibility Guide

One page. Read it before building anything new. The platform is built so most additions are isolated plug-ins; this guide tells you which path you're on and how to stay in the cheap lane.

---

## Step 1 — Triage: what kind of thing is this?

Answer the first question that fits, top to bottom.

| If the new functionality… | …it's a | Cost | Touches |
|---|---|---|---|
| happens **inside a lesson**, as part of the step sequence (the learner does it mid-lesson) | **Step** | easy | `engine/` |
| is a **panel/feature on a dashboard page**, outside a lesson | **Widget** | easy | `shell/` |
| is just a **new arrangement of existing widgets** | **Page** | trivial | config only |
| is **new teaching content** | **Program** | content only | JSON + DB rows |
| has its **own backend logic, money, real-time, new core data, its own permissions, external messaging, or spans many screens at once** | **Subsystem** | real build | new design |

The first four are the plug-in lane. The fifth is a real project — see Step 4.

---

## Step 2 — The easy-path recipes

**Add a Step type** (new in-lesson interaction — e.g. audio-record, image-upload, ranking)
1. Add the variant to the `Step` union in `engine/types.ts`.
2. Write `components/steps/XStep.tsx` implementing `StepProps<XStep>` (clone `InfoStep` if non-interactive, `McStep`/`ReflectionStep` if interactive).
3. Add one entry to `stepRegistry` (`component` + optional `validate`/`score` + `behavior`).
→ `LessonPlayer` is **not** touched. Unknown types fall back automatically.

**Add a Widget** (new dashboard feature — e.g. notes, certificate, AI helper)
1. Add the key to the `WidgetKey` union in `shell/types.ts`.
2. Write `shell/widgets/XWidget.tsx` implementing `WidgetProps` (clone `ContinueLessonWidget`).
3. Add one entry to `widgetRegistry`, then drop its key into any page's `widgets` (or it auto-appears on the everything page).
→ `DashboardShell` and other widgets are **not** touched.

**Add a Page** — write a new `PageConfig` object in `shell/pages.ts` selecting existing widget keys + add its route file. Done.

**Add a Program** — author the lessons as `steps` JSON, insert `programs`/`units`/`lessons` rows via a seed script (preview → approve → apply). No code.

---

## Step 3 — Contract checklists (what makes a plug-in correct)

**A Step component MUST:**
- [ ] implement `StepProps<S>` = `{ step, onAnswer, onContinue, narration }`
- [ ] call `onAnswer(res)` exactly once when interactive; call `onContinue()` when not
- [ ] own only its UI + local state — **fetch nothing global, share no mutable state**
- [ ] if it has a text field: `KeyboardAvoidingView` + `ScrollView keyboardShouldPersistTaps="handled"`, submit reachable, validation **visible** (never a silent disabled button)
- [ ] keep XP out of the component — scoring lives in `scoring.ts`
- [ ] declare `behavior` in the registry (`requiresInteraction`, and `autoAdvanceMs` only for tap-answer steps, never text steps)

**A Widget component MUST:**
- [ ] implement `WidgetProps` = `{ config, navigate }`
- [ ] fetch its **own** data (TanStack Query) — no shared shell state
- [ ] resolve which program/lesson from `config` or the enrollment — **never hard-code** "first incomplete lesson" or a specific program
- [ ] navigate into routes via `navigate('/lesson/[id]', { id })` — **never embed the lesson** (the lesson stays a linear route)
- [ ] render a graceful empty state when there's no data (e.g. not enrolled)
- [ ] declare `meta` in the registry (`defaultSize`, `requiresEnrollment`)

---

## Step 4 — "It's a subsystem, not a widget" test

It's a **subsystem** (real design + build, not a registry entry) if it does any of these:
- handles money / subscriptions
- needs real-time / websockets / live presence
- introduces a **new core entity** (a new table that other features depend on)
- has its own permission/role model
- sends external messages (email or push **campaigns**)
- needs an admin UI or server-side jobs
- must appear/behave across many screens at once

**What to do:** design it properly first — data model + RLS + backend + security — then **expose it through the patterns**. The architecture makes the *integration* cheap even when the subsystem isn't: once payments exists, a `PaywallWidget` or a `subscription_required` step behavior drops in trivially. Build the engine of the subsystem; surface it as a widget/step/page.

---

## Step 5 — Two rules that always apply

**New data → migration + approval.** Any new column or table is a Supabase migration + RLS, presented as a preview, approved, then applied with the service role. Reuse the reserved columns (`shield_count`, `review_queue`) where they already exist.

**Extending a contract (the seam).** If a step/widget needs something the props don't expose (e.g. a step reading a prior step's response, a widget firing a global event), **extend** `StepProps`/`WidgetProps` — but keep the new field **optional and backward-compatible** so the existing steps/widgets don't break. Extend deliberately; never mutate the shape out from under existing implementations.

---

## Worked examples (triage in action)

| I want to add… | It's a… | Do this |
|---|---|---|
| Drag-to-rank interaction in a lesson | Step | union + component + registry |
| "Certificate of completion" panel | Widget (+ maybe a generation subsystem later) | widget now; PDF generation is a subsystem if/when needed |
| AI Q&A helper on the dashboard | Widget | widget that calls the Anthropic API; fetches its own data |
| Duo "daily reflection journal" | Step (in a lesson) and/or Widget (on home) | reuse `reflection` step; add a `journal` widget if it needs a home surface |
| CreditSmith underwriting checklist | Step type (`checklist`) or Widget | new step type if it's part of a guided unit |
| Leaderboard | Subsystem (new shared data + ranking) + Widget surface | design the data/ranking; expose via a `leaderboard` widget |
| Payments / paywall | Subsystem + Widget/step surface | Stripe + tables + RLS, then `PaywallWidget` / `subscription_required` behavior |

---

## The one-sentence version
If it fits a **step** or a **widget**, it's a component + one registry line + a config reference — and it can't break what already works. If it has its own data, money, real-time, or permissions, it's a **subsystem**: build it, then surface it through the same patterns. Keep every plug-in **self-contained** and keep the **contracts stable**, and "easy to extend" stays true.
