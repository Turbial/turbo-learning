#!/usr/bin/env npx tsx
/**
 * generate-audio-v2.ts — Pre-generate high-quality MP3 narration
 *
 * Reads lesson JSON files from src/content/{program}/day{N}.json,
 * generates MP3 audio for each narratable step using OpenAI TTS,
 * and syncs them to Supabase Storage for CDN delivery.
 *
 * Usage:
 *   npx tsx tools/generate-audio-v2.ts --program ai_operator
 *   npx tsx tools/generate-audio-v2.ts --program ai_operator --day 1
 *   npx tsx tools/generate-audio-v2.ts --program ai_operator --dry-run
 *   npx tsx tools/generate-audio-v2.ts --all --dry-run
 *
 * Provider: OpenAI TTS (tts-1-hd, voice "nova")
 * Requires: OPENAI_API_KEY
 * Optional: SUPABASE_URL, SUPABASE_SERVICE_KEY (for CDN upload)
 */

import * as fs from "fs";
import * as path from "path";

// ═══ Config ═══

const CONTENT_DIR = path.resolve(__dirname, "../src/content");
const ASSETS_AUDIO_DIR = path.resolve(__dirname, "../assets/audio");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const TTS_MODEL = "tts-1-hd";
const TTS_VOICE = "nova";
const TTS_API = "https://api.openai.com/v1/audio/speech";

// Quality settings
const TTS_SPEED = 0.95;  // Slightly slower for education — better comprehension
const RATE_LIMIT_MS = 250; // Be respectful to the API

// Supabase storage config
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const STORAGE_BUCKET = "narration";

// ═══ Types ═══

interface Step {
  id: string;
  type: string;
  title?: string;
  body?: string;
  question?: string;
  prompt?: string;
  greeting?: string;
  audio_url?: string | null;
  [key: string]: unknown;
}

interface Lesson {
  version: number;
  unit: string;
  title: string;
  estMinutes: number;
  steps: Step[];
}

// ═══ Helpers ═══

/** Steps that benefit from audio narration */
const NARRATABLE_TYPES = new Set([
  "info",
  "highlight",
  "scenario_card",
  "example",
  "completion",
]);

/** Extract narration text from a step — prioritize body, then question for quiz steps, etc. */
function getNarrationText(step: Step): string | null {
  if (step.body && NARRATABLE_TYPES.has(step.type)) return step.body as string;
  // Also narrate the question + options for mc/tf steps (useful for accessibility)
  if (step.type === "mc" && step.question) {
    const options = (step.options as string[])?.map((o, i) => `${i + 1}. ${o}`).join(". ") || "";
    return `${step.question} Options: ${options}`;
  }
  if (step.type === "tf" && step.question) return step.question as string;
  if (step.type === "fillblank" && step.question) return step.question as string;
  return null;
}

/** Clean markdown for speech */
function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Format file size */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

/** Cost estimate for tts-1-hd: $30/M chars */
function estimateCost(chars: number): string {
  return `$${((chars / 1_000_000) * 30).toFixed(4)}`;
}

// ═══ TTS Generation ═══

async function generateSpeech(text: string, stepId: string): Promise<Buffer> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const cleanText = cleanForSpeech(text);

  const response = await fetch(TTS_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TTS_MODEL,
      input: cleanText,
      voice: TTS_VOICE,
      response_format: "mp3",
      speed: TTS_SPEED,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI TTS error (${response.status}): ${err.slice(0, 200)}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ═══ Supabase Upload ═══

async function uploadToSupabase(
  program: string,
  stepId: string,
  mp3Buffer: Buffer,
): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;

  const filePath = `${program}/${stepId}.mp3`;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "audio/mpeg",
          "x-upsert": "true",
        },
        body: mp3Buffer,
      },
    );

    if (!response.ok) {
      console.warn(`    ⚠️  Upload failed: ${response.status}`);
      return null;
    }

    // Return public URL
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath}`;
  } catch (err) {
    console.warn(`    ⚠️  Upload error: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

// ═══ Main ═══

async function main() {
  const args = process.argv.slice(2);
  const allFlag = args.includes("--all");
  const programIdx = args.indexOf("--program");
  const dayIdx = args.indexOf("--day");
  const dryRun = args.includes("--dry-run");
  const localOnly = args.includes("--local"); // Skip Supabase upload

  const programFilter = programIdx !== -1 ? args[programIdx + 1] : null;
  const dayFilter = dayIdx !== -1 ? args[dayIdx + 1] : null;

  if (!OPENAI_API_KEY && !dryRun) {
    console.log("⚠️  OPENAI_API_KEY not set. Running in dry-run mode.");
    console.log("   Set: export OPENAI_API_KEY=sk-...\n");
  }

  if (!SUPABASE_URL && !dryRun && !localOnly) {
    console.log("💡 SUPABASE_URL not set. Audio will be saved locally only.");
    console.log("   Set SUPABASE_URL + SUPABASE_SERVICE_KEY for CDN upload.\n");
  }

  // Discover lesson files
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`❌ Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  const programs = fs.readdirSync(CONTENT_DIR).filter((f) => {
    const fp = path.join(CONTENT_DIR, f);
    return fs.statSync(fp).isDirectory() && (allFlag || !programFilter || f === programFilter);
  });

  if (programs.length === 0) {
    console.log(`No programs found${programFilter ? ` matching "${programFilter}"` : ""}`);
    return;
  }

  let totalChars = 0;
  let totalSteps = 0;
  let totalBytes = 0;
  let generatedFiles = 0;
  let uploadedFiles = 0;

  for (const program of programs) {
    const programDir = path.join(CONTENT_DIR, program);
    const files = fs.readdirSync(programDir).filter((f) =>
      f.endsWith(".json") && (!dayFilter || f === `day${dayFilter}.json`),
    );

    if (files.length === 0) continue;

    console.log(`\n📚 Program: ${program} (${files.length} lesson${files.length !== 1 ? "s" : ""})`);

    for (const file of files) {
      const filePath = path.join(programDir, file);
      const lesson: Lesson = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      let lessonModified = false;

      console.log(`  📖 ${lesson.title} (${lesson.steps.length} steps)`);

      for (const step of lesson.steps) {
        const text = getNarrationText(step);
        if (!text) continue;

        // Skip if already has a Supabase audio_url
        if (step.audio_url && step.audio_url.startsWith("http")) {
          console.log(`    ✓ ${step.id}: already has CDN audio`);
          continue;
        }

        totalSteps++;
        totalChars += text.length;

        if (dryRun) {
          console.log(`    🔍 ${step.id}: would generate (${text.length} chars) [${step.type}]`);
          continue;
        }

        if (!OPENAI_API_KEY) {
          console.log(`    ⏭  ${step.id}: skipping (no API key)`);
          continue;
        }

        try {
          const preview = text.length > 70 ? text.slice(0, 70) + "..." : text;
          console.log(`    🎙️  ${step.id}: generating... "${preview}"`);

          const mp3Buffer = await generateSpeech(text, step.id);
          totalBytes += mp3Buffer.length;

          // Save locally
          const localDir = path.join(ASSETS_AUDIO_DIR, program);
          fs.mkdirSync(localDir, { recursive: true });
          const localPath = path.join(localDir, `${step.id}.mp3`);
          fs.writeFileSync(localPath, mp3Buffer);

          // Try Supabase upload
          let audioUrl: string | null = null;
          if (!localOnly) {
            audioUrl = await uploadToSupabase(program, step.id, mp3Buffer);
            if (audioUrl) uploadedFiles++;
          }

          // Update the JSON
          if (audioUrl) {
            step.audio_url = audioUrl;
            console.log(`    ✅ ${step.id}: CDN upload (${formatSize(mp3Buffer.length)})`);
          } else {
            step.audio_url = `assets/audio/${program}/${step.id}.mp3`;
            console.log(`    ✅ ${step.id}: local only (${formatSize(mp3Buffer.length)})`);
          }

          lessonModified = true;
          generatedFiles++;

          // Rate limit
          await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
        } catch (err) {
          console.error(`    ❌ ${step.id}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      // Write updated lesson JSON
      if (lessonModified) {
        fs.writeFileSync(filePath, JSON.stringify(lesson, null, 2) + "\n");
        console.log(`  💾 Updated ${file}`);
      }
    }
  }

  // Summary
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  Audio Generation Summary            ║`);
  console.log(`╠══════════════════════════════════════╣`);
  console.log(`║  Steps narrated:   ${String(totalSteps).padStart(4)}              ║`);
  console.log(`║  Total chars:      ${String(totalChars.toLocaleString()).padStart(8)}          ║`);
  console.log(`║  Est. cost:        ${estimateCost(totalChars).padStart(8)}           ║`);
  console.log(`║  Files generated:  ${String(generatedFiles).padStart(4)}              ║`);
  console.log(`║  CDN uploads:      ${String(uploadedFiles).padStart(4)}              ║`);
  console.log(`║  Total size:       ${formatSize(totalBytes).padStart(8)}           ║`);
  console.log(`╚══════════════════════════════════════╝`);

  if (dryRun) {
    console.log("\n🔍 Dry run complete. Run without --dry-run to generate audio.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
