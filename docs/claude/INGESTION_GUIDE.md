# Content Ingestion — Guide + Tools

How content gets *into* the platform. Mirrors the Phase 0 pipeline: structure first, content as JSON, **preview → approve → apply**. Two stdlib-only tools do the work: `tools/validate_lesson.py` and `tools/build_seed.py`.

## 1. What can we ingest?

| Thing | Where it lives | Format | Notes |
|---|---|---|---|
| **Program** | `programs` row | fields | slug, title, subtitle, `unit_label`, `artifact_label`, `level_names`, theme |
| **Unit** | `units` row | fields | one per "Day"/"Module"; order, label, title, theme |
| **Lesson** | `lessons` row | fields + **`steps` JSON** | the steps array is the bulk of the content |
| **Steps** | `lessons.steps` (JSONB) | typed JSON | the 18 step types — this is what you author most |
| **Deliverable** | `deliverables` row + file | fields + uploaded template | unit-level async task |
| **Badge** | `badges` row + icon | fields | slug, name, icon, unlock_condition |
| **Audio** *(V2)* | Cloudflare R2 + `audioUrl`/`cues` on a step | MP3 + sentence cues | **not needed for V1** — see §4 |
| **Images** | — | — | **not in the schema yet**; adding them is a contract extension (see Extensibility Guide) |
| **Video** | — | — | out of scope, all phases |

**Bottom line for the MVP: you ingest text only.** Audio is generated on-device at runtime (V1), so there's no media pipeline to run until the V2 audio upgrade.

## 2. The pipeline

```
author lesson.json  →  validate_lesson.py  →  build_seed.py  →  review .sql  →  approve  →  apply with service key
```
- **Validate** catches schema errors before anything reaches the DB.
- **Build seed** re-validates, then emits a reviewable `.sql` (idempotent upserts). It never touches Supabase.
- **You approve**, then the seed is applied with the service key (admin). Nothing lands unreviewed — your standing rule, enforced mechanically.

```bash
python3 tools/validate_lesson.py content/ai_for_everyone/day2.json
python3 tools/build_seed.py content/ai_for_everyone/day2.json \
  --program ai_for_everyone --unit-order 2 --unit-label "Day 2" \
  --unit-title "..." --lesson-order 1 --lesson-title "..." --minutes 12 \
  --out supabase/migrations/0003_seed_day2.sql
```

## 3. How to prepare TEXT

### Authoring format
A lesson is a JSON file: an ordered `steps` array (optionally wrapped with `meta`). Each step is one typed object. The exact required fields per type are enforced by `validate_lesson.py` — that script *is* the spec. Quick reference:

| Type | Required fields |
|---|---|
| `info` / `scenario_card` | `body` (+ optional `title`, `audioUrl`, `cues`) |
| `example` | `prompt` |
| `mc` / `scenario` | `question`, `options[≥2]`, `correct` (index), `feedback[]` (== options length) |
| `tf` | `question`, `correct` (bool), `feedback[2]` |
| `highlight` | `body`, `highlights[]` (each should appear in body) |
| `fillblank` | `question`, `answer`, `feedback[2]` (+ `aliases[]`) |
| `match` | `pairs[]` of `{left,right}` |
| `good_fit` | `question`, `correct` ('good'/'notideal'), `feedback[2]` |
| `quiz` | `questions[]` (mini mc/tf/fillblank) |
| `builder` | `fields[]` of `{id,label}`, `template` (must contain `{{id}}` per field) |
| `copy_action` | `body`, `sourceStepId` (an earlier `builder` step) |
| `paste_capture` | `body` (+ `minLength`) |
| `compare` | `question` |
| `reflection` | `questions[]` of `{id,type(single_choice/textarea),label,options?}` |
| `badge_unlock` | `badgeSlug` |
| `streak_commitment` | `commitOptions[]` (ints) |
| `reminder_setup` | `reminderOptions[]` |
| `completion` | `body` |
All steps may also carry `xp` (number) and `primaryButton` (string).

### Recommended authoring path (this is what "you present the content" looks like)
1. **Outline the unit** in plain prose — what's taught, the one real task, the takeaway.
2. **Map it to the step rhythm**: bite → interaction → bite → interaction → practice → reflection → completion.
3. **Draft the JSON** (a model can draft it from your outline; you review). The step schema is the contract it drafts against.
4. **Validate** → fix errors.
5. **Build seed → review → approve → apply.**

### Quality checklist (valid JSON ≠ good lesson)
- One idea per `info` card; 2–3 sentences.
- Match the program's tone — `ai_for_everyone` = **plain language, no jargon** (no "tokens", "workflow", "operator"); `ai_operator` = operator vocabulary welcome.
- Never two of the same interaction type in a row (the validator warns).
- ≤ ~30 seconds of reading before the next tap.
- A practice chain uses `builder → copy_action(sourceStepId) → paste_capture → reflection`.
- End every lesson with a `completion` step.

## 4. How to prepare MEDIA

### Audio
- **V1 (now): nothing to prepare.** The lesson player reads each `info`/`scenario_card` `body` aloud via device TTS at runtime. The transcript is the body text you already wrote.
- **V2 (premium audio):** for each `info`/`scenario_card` step —
  1. Generate an MP3 from the step `body` (ElevenLabs / OpenAI TTS).
  2. Produce **sentence cues** `[{ "t": seconds, "sentence": index }]` (alignment API, or estimate by sentence length) for highlight + tap-to-jump.
  3. Upload to R2 at `audio/{program}/{unit_order}/{lesson_order}/{step_id}.mp3`.
  4. Set the step's `audioUrl` (CDN URL) and `cues`. Both fields already exist in the schema — **no content rework**, just enrichment.

### Deliverable templates
Upload the template file to Supabase Storage under `deliverables/{unit}/...`, then set `deliverables.template_url`.

### Badge icons
`badges.icon` holds an icon name / asset key resolved by the app's icon set — no upload needed unless you use custom art (then store on R2 and reference the URL).

### Images in lessons
Not supported by the current step schema. If you want them, it's a **contract extension** (add an optional `imageUrl` to the relevant step types, store images on R2 by the same naming), done deliberately and backward-compatibly per the Extensibility Guide.

## 5. Validation = the gate
`validate_lesson.py` blocks on **errors** (missing/typed fields, out-of-range `correct`, mismatched `feedback` length, duplicate ids, a `copy_action` pointing at a non-existent or later builder step, unknown types) and advises on **warnings** (rhythm, missing `completion`, highlight phrase not found in body, template missing a field placeholder). `build_seed.py` refuses to emit a seed while errors exist. Exit code 1 = do not ingest.

## 6. Conventions
- Content files: `content/{program_slug}/day{N}.json` (or `unit{N}.json`).
- Seeds: `supabase/migrations/00NN_seed_{program}_{unit}.sql`, numbered after the schema.
- One lesson per file keeps validation and review focused.

## 7. Don't overbuild
For now, ingestion is **JSON files + these two scripts + a reviewed seed**. No CMS, no admin upload UI — that's a someday feature. This path already lets you (or a model) author, validate, and safely load any program's content without engine changes.
