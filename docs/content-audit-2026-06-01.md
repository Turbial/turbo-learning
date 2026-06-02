# Turbo Learning — Content Audit

**Date:** 2026-06-01
**Scope:** `content/`, `src/content/`, and program metadata in source code
**Programs:** AI Operator, AI for Everyone, Duo (Marriage Platform)

---

## 1. AI Operator — Days 1–28

**Status:** 11 of 28 days have real content; 17 days are missing step data.

### Days WITH real content (in `src/content/ai_operator/`)

| Day | File Size | Notes |
|-----|-----------|-------|
| Day 1 | 5,806 B | Full lesson |
| Day 2 | 12,472 B | Full lesson |
| Day 3 | 12,711 B | Full lesson (19+ step types) |
| Day 4 | 4,708 B | Full lesson |
| Day 5 | 4,791 B | Full lesson |
| Day 6 | 5,472 B | Full lesson |
| Day 7 | 5,865 B | Full lesson |
| Day 8 | 13,097 B | Full lesson (Week 2 start) |
| Day 9 | 13,807 B | Full lesson |
| Day 10 | 14,264 B | Full lesson |
| Day 11 | 15,224 B | Full lesson |

### Missing content

Days **12–28** have **no JSON files**. The fallback `src/data/useLocalUnits.ts` defines metadata-only unit stubs (title, theme) for all 28 days, but no step/lesson content exists for days 12–28.

**Gap:** 17 of 28 days (60% incomplete).

---

## 2. AI for Everyone — Days 1–28

**Status:** 8 of 28 days have real content; 20 days missing.

### Days WITH real content (in `src/content/ai_for_everyone/`)

| Day | File Size | Notes |
|-----|-----------|-------|
| Day 1 | 9,656 B | Full lesson |
| Day 8 | 7,412 B | Full lesson (Week 2 start) |
| Day 9 | 7,959 B | Full lesson |
| Day 10 | 7,618 B | Full lesson |
| Day 11 | 8,679 B | Full lesson |
| Day 12 | 8,343 B | Full lesson |
| Day 13 | 8,436 B | Full lesson |
| Day 14 | 7,564 B | Full lesson |

### Missing content

**Days 2–7** (6-day gap in the middle) — no JSON files exist.  
**Days 15–28** (14 days) — no JSON files exist.

**Gap:** 20 of 28 days (71% incomplete).

The code's `LOCAL_UNITS` in `src/data/useLocalUnits.ts` has an **empty array** for `"ai_for_everyone"` — meaning even fallback metadata stubs are absent.

---

## 3. Duo (Marriage Platform) — Days 1–28

**Status:** 7 of 28 days have real content; 21 days missing.

### Days WITH real content (in `src/content/duo/`)

| Day | File Size | Notes |
|-----|-----------|-------|
| Day 1 | 4,642 B | Full lesson |
| Day 2 | 5,474 B | Full lesson |
| Day 3 | 4,674 B | Full lesson |
| Day 4 | 5,036 B | Full lesson |
| Day 5 | 5,149 B | Full lesson |
| Day 6 | 6,118 B | Full lesson |
| Day 7 | 5,570 B | Full lesson |

### Missing content

Days **8–28** have **no JSON files**. The fallback `LOCAL_UNITS` defines metadata-only stubs (titles) for all 28 duo days, but no step/lesson content exists beyond day 7.

**Gap:** 21 of 28 days (75% incomplete).

---

## 4. Dual Content Paths: `content/` vs `src/content/`

### Paths found

| Path | Description |
|------|-------------|
| `content/` (top-level) | Stale path — 2 files using OLD schema |
| `src/content/` | Active path — 26 files using NEW schema |

### Detail

**`content/` (top-level):**
- `content/ai_for_everyone/day1.json` (9,656 B) — **identical** copy of `src/content/ai_for_everyone/day1.json`
- `content/ai_operator/day3.json` (6,666 B) — **different/older version** than `src/content/ai_operator/day3.json` (12,711 B)

**Schema differences:**

| Feature | `content/` (OLD) | `src/content/` (NEW) |
|---------|------------------|----------------------|
| `version` field | absent | `"version": 1` |
| Unit identifier | `meta.unitOrder` | `unit: "day3"` |
| Top-level title | `meta.lessonTitle` | `title` |
| Step IDs | `d3_s1`, `d3_s2` | `d3-info-1`, `d3-highlight-1` |
| Step types used | info, highlight, mc, builder, copy_action, paste_capture, good_fit, tf, scenario_card, reflection, completion | All 19+ step types |
| XP system | Lower (`xp: 3-15`) | Higher (`xp: 5-20`) |

The old `content/` path versions have **no lesson content** — they were early prototypes before the full engine was built. The file in `content/ai_operator/day3.json` is a completely different, much simpler lesson (Prompt Engineering Basics, ~13 steps) compared to the new one (The Operator's Toolkit, 19+ steps).

### No code imports these files directly

The source code does **not** `import` or `require` any JSON files from either `content/` or `src/content/`. Content is loaded from **Supabase** (`programs`, `units`, `lessons` tables) via TanStack Query hooks, with `LOCAL_UNITS` as a fallback defined in `src/data/useLocalUnits.ts`.

### Recommendation

- The `content/` top-level directory is **stale** and can be removed.
- Keep `src/content/` as the content authoring directory for seeding Supabase data.
- Add a seed script if one is needed.

---

## 5. Content Quality Check

All existing JSON files were inspected. **No empty shells found.** Every file contains real step content (ranging from 4.6 KB for basic lessons to 15.2 KB for comprehensive ones). All use the new schema (`version: 1`, step-type-prefixed IDs, full step arrays).

Files in `content/` also contain real content (just older/less comprehensive).

---

## 6. Summary Table

| Program | Total Days | Days with Content | Days Missing | Completion |
|---------|-----------|-------------------|-------------|------------|
| AI Operator | 28 | 11 (days 1–11) | 17 (days 12–28) | **39%** |
| AI for Everyone | 28 | 8 (days 1, 8–14) | 20 (days 2–7, 15–28) | **29%** |
| Duo | 28 | 7 (days 1–7) | 21 (days 8–28) | **25%** |
| **Total** | **84** | **26** | **58** | **31%** |

---

## 7. Quick Wins

1. **Remove `content/` directory** — it's stale, uses old schema, and has no consumers. Its 2 files are either identical to (or superseded by) `src/content/` versions.

2. **Add `ai_for_everyone` metadata to `LOCAL_UNITS`** in `src/data/useLocalUnits.ts` — currently has an empty array, unlike the other two programs which have 28 stubs each.

3. **Create seed script** — No seed script exists to load JSON content from `src/content/` into Supabase. The JSON files are authored but never deployed.
