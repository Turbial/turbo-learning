# Scripts

## seed-content.ts

Seeds the 28-day lesson curriculum from `src/content/` into Supabase.

Reads all `dayN.json` files from each program directory (`ai_operator/`, `ai_for_everyone/`) and upserts programs, units, and lessons into Supabase. Handles both the old (`ai_operator`) and new (`ai_for_everyone`) JSON schemas automatically.

### Requirements

- `SUPABASE_URL` env var (or set in `.env`; falls back to `EXPO_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY` env var (from Supabase dashboard → Settings → API → service_role key)

### Run

```bash
SUPABASE_SERVICE_ROLE_KEY=your_key npx tsx scripts/seed-content.ts
```

Idempotent — safe to run multiple times. Units are looked up before insert; lessons are upserted on `(unit_id, order_num)`.

### What it does

1. Reads all `src/content/<program>/dayN.json` files
2. Looks up the program row by slug (`ai-operator`, `ai-for-everyone`)
3. Creates a unit row per day if one doesn't already exist
4. Upserts a lesson row with the full `steps` JSON array

---

## validate-content.js

Validates the JSON structure of all content files without hitting Supabase.

```bash
node scripts/validate-content.js
```

---

## build-inventory.js

Builds a content inventory report from the local JSON files.

```bash
node scripts/build-inventory.js
```
