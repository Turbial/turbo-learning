// ─── Content Seed Script — reads all JSON files from src/content/ and upserts into Supabase ───
//
// Usage: npx ts-node scripts/seed-content.ts
//
// Env vars required:
//   SUPABASE_URL          — service URL (or falls back to EXPO_PUBLIC_SUPABASE_URL)
//   SUPABASE_SERVICE_KEY  — service role key (bypasses RLS)

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client setup ───────────────────────────────────────────────────

const supabaseUrl =
  process.env.SUPABASE_URL ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  "https://afgmlkduuapquqkcqdsk.supabase.co";

const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error("✗ SUPABASE_SERVICE_KEY env var is required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Program slug mapping ─────────────────────────────────────────────────────

const PROGRAM_SLUG_MAP: Record<string, string> = {
  ai_operator: "ai-operator",
  ai_for_everyone: "ai-for-everyone",
  duo: "duo",
};

// ─── Schema helpers ──────────────────────────────────────────────────────────

interface OldSchema {
  version: number;
  unit: string;
  title: string;
  estMinutes: number;
  steps: any[];
}

interface NewSchema {
  meta: {
    program: string;
    unitOrder: number;
    unitLabel?: string;
    unitTitle: string;
    lessonOrder?: number;
    lessonTitle: string;
    minutes: number;
  };
  steps: any[];
}

function isNewSchema(json: any): json is NewSchema {
  return json.meta !== undefined && json.meta.program !== undefined;
}

interface ParsedLesson {
  unitOrder: number;
  unitTitle: string;
  lessonTitle: string;
  estMinutes: number;
  steps: any[];
}

function parseJsonFile(json: any, dayNum: number): ParsedLesson {
  if (isNewSchema(json)) {
    return {
      unitOrder: json.meta.unitOrder ?? dayNum,
      unitTitle: json.meta.unitTitle,
      lessonTitle: json.meta.lessonTitle,
      estMinutes: json.meta.minutes,
      steps: json.steps,
    };
  }
  // Old schema
  const old = json as OldSchema;
  return {
    unitOrder: dayNum,
    unitTitle: old.title,
    lessonTitle: old.title,
    estMinutes: old.estMinutes ?? 20,
    steps: old.steps,
  };
}

// ─── Main seed logic ─────────────────────────────────────────────────────────

async function main() {
  const contentDir = path.join(__dirname, "../src/content");
  const programDirs = fs
    .readdirSync(contentDir)
    .filter((d) => fs.statSync(path.join(contentDir, d)).isDirectory());

  let totalLessons = 0;
  let totalSteps = 0;
  const failures: string[] = [];

  // Cache program UUIDs to avoid repeated lookups
  const programIdCache: Record<string, string> = {};

  async function getProgramId(programDir: string): Promise<string | null> {
    if (programIdCache[programDir]) return programIdCache[programDir];

    const slug = PROGRAM_SLUG_MAP[programDir];
    if (!slug) {
      console.warn(`  ! No slug mapping for directory "${programDir}" — skipping`);
      return null;
    }

    const { data, error } = await supabase
      .from("programs")
      .select("id")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      console.warn(`  ! Could not find program with slug "${slug}": ${error?.message}`);
      return null;
    }

    programIdCache[programDir] = data.id;
    return data.id;
  }

  for (const programDir of programDirs) {
    const programPath = path.join(contentDir, programDir);
    const slug = PROGRAM_SLUG_MAP[programDir] ?? programDir;

    // Get all dayN.json files sorted by day number
    const dayFiles = fs
      .readdirSync(programPath)
      .filter((f) => /^day\d+\.json$/.test(f))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ""), 10);
        const numB = parseInt(b.replace(/\D/g, ""), 10);
        return numA - numB;
      });

    if (dayFiles.length === 0) {
      console.log(`  (no day files found in ${programDir})`);
      continue;
    }

    const programId = await getProgramId(programDir);
    if (!programId) continue;

    for (const fileName of dayFiles) {
      const dayNum = parseInt(fileName.replace(/\D/g, ""), 10);
      const filePath = path.join(programPath, fileName);

      let json: any;
      try {
        json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (err: any) {
        const msg = `${slug} day ${dayNum}: failed to parse JSON — ${err.message}`;
        console.error(`  ✗ ${msg}`);
        failures.push(msg);
        continue;
      }

      let parsed: ParsedLesson;
      try {
        parsed = parseJsonFile(json, dayNum);
      } catch (err: any) {
        const msg = `${slug} day ${dayNum}: failed to parse schema — ${err.message}`;
        console.error(`  ✗ ${msg}`);
        failures.push(msg);
        continue;
      }

      // ── Look up or create the unit ──────────────────────────────────────────
      let unitId: string;
      {
        const { data: existingUnit, error: unitErr } = await supabase
          .from("units")
          .select("id")
          .eq("program_id", programId)
          .eq("order_num", parsed.unitOrder)
          .maybeSingle();

        if (unitErr) {
          const msg = `${slug} day ${dayNum}: unit lookup failed — ${unitErr.message}`;
          console.error(`  ✗ ${msg}`);
          failures.push(msg);
          continue;
        }

        if (existingUnit) {
          unitId = existingUnit.id;
        } else {
          const { data: newUnit, error: createErr } = await supabase
            .from("units")
            .insert({
              program_id: programId,
              order_num: parsed.unitOrder,
              label: `Day ${parsed.unitOrder}`,
              title: parsed.unitTitle,
            })
            .select("id")
            .single();

          if (createErr || !newUnit) {
            const msg = `${slug} day ${dayNum}: unit insert failed — ${createErr?.message}`;
            console.error(`  ✗ ${msg}`);
            failures.push(msg);
            continue;
          }

          unitId = newUnit.id;
        }
      }

      // ── Upsert the lesson ───────────────────────────────────────────────────
      {
        const { error: upsertErr } = await supabase
          .from("lessons")
          .upsert(
            {
              unit_id: unitId,
              title: parsed.lessonTitle,
              est_minutes: parsed.estMinutes,
              steps: parsed.steps,
              order_num: 1,
            },
            { onConflict: "unit_id,order_num" },
          );

        if (upsertErr) {
          const msg = `${slug} day ${dayNum}: lesson upsert failed — ${upsertErr.message}`;
          console.error(`  ✗ ${msg}`);
          failures.push(msg);
          continue;
        }
      }

      const stepCount = parsed.steps.length;
      console.log(`  ✓ ${slug} day ${dayNum} (${stepCount} steps)`);
      totalLessons++;
      totalSteps += stepCount;
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`Seeded ${totalLessons} lessons, ${totalSteps} steps`);
  if (failures.length > 0) {
    console.log(`Failures (${failures.length}):`);
    failures.forEach((f) => console.log(`  ✗ ${f}`));
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
