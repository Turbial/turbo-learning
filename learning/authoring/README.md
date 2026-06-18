# Authoring pipeline — raw text → playable chat lesson

**LLM owns meaning. Code owns structure.** The model produces flat, content-only
JSON (concepts + quiz/scenario/flashcard seeds — no ids, no pointers, no menus).
The deterministic compiler wires the graph, builds menu/feedback/done steps,
stamps a content version, and **validates** — rejecting dead ends, unreachable
steps, and multi-correct quizzes. A broken lesson fails at compile time, never in
front of a student.

```
raw text ──[FORMATTING_PROMPT.md → LLM]──► authoring JSON ──[compile.mjs]──► compiled graph ──► ChatPlayer
              (content + arc only)          (hand-editable)     (code wires + validates)   (chat + buttons)
```

## Files

| File | Role |
|------|------|
| `FORMATTING_PROMPT.md` | The prompt that turns raw text → authoring JSON (LLM step) |
| `course_authoring.schema.json` | The simple, content-only format you author/generate |
| `compile.mjs` | Deterministic compiler: authoring JSON → validated playable items |
| `../courses/<program>/<lesson>.authoring.json` | Authored input |
| `../courses/<program>/<lesson>.compiled.json` | Compiler output (the runtime feeds on this) |

## Usage

```bash
# Compile an authored lesson into a validated, playable graph:
node learning/authoring/compile.mjs learning/courses/ai_operator/day1.authoring.json
#   → writes day1.authoring.compiled.json   (rename to <lesson>.compiled.json for the runtime)
```

The compiler throws loudly with a list of structural problems if the content
can't form a playable graph. (During this build it caught two orphaned flashcard
steps — proof the gate works.)

## What the compiler guarantees

- exactly one entry (menu) step per lesson
- every non-final step has ≥1 button
- every quiz has exactly one correct answer
- every button points to a step that exists (no dead ends)
- every step is reachable from the entry
- every concept tag is declared
- a `content_version` hash per lesson (regenerate-on-change)

## Notes vs. the original learning_platform package

- **Deterministic ids.** Items get readable per-lesson ids (`L1-001`, …) instead of
  random UUIDs, so the committed compiled artifact is reproducible. At Supabase
  ingest time the loader can map these to `gen_random_uuid()`.
- **One guided chain.** Feedback advances through quizzes → scenarios → flashcards
  → done so every generated item is reachable (the source only wired the first of
  each type). The menu still offers jump-in points per mode.

Phase 2 swaps the manual `compile.mjs` step for an ingest Edge Function (chunk +
embed `source_text` for Ask, generate the seeds with an LLM, then run this exact
compiler before inserting into `lp_lesson_items`). The format and compiler do not
change — the creator UI just becomes a nicer front door.
