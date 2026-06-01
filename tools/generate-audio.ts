#!/usr/bin/env npx tsx
/**
 * generate-audio.ts — Pre-generate MP3 narration files from content JSON
 *
 * Usage: npx tsx tools/generate-audio.ts [--program ai_for_everyone] [--dry-run]
 *
 * Reads content JSON files, calls TTS API for each step body, saves MP3 to
 * assets/audio/{program}/{stepId}.mp3, and updates the JSON with audioUrl.
 *
 * Provider: OpenAI TTS (tts-1-hd, voice "nova")
 * Set OPENAI_API_KEY in env or .env file.
 */

import * as fs from "fs";
import * as path from "path";

// ═══ Config ═══

const CONTENT_DIR = path.resolve(__dirname, "../content");
const ASSETS_DIR = path.resolve(__dirname, "../assets/audio");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const TTS_MODEL = "tts-1-hd";
const TTS_VOICE = "nova"; // warm, natural female — excellent for education
const TTS_API = "https://api.openai.com/v1/audio/speech";

// ═══ Types ═══

interface ContentStep {
  id: string;
  type: string;
  title?: string;
  body?: string;
  question?: string;
  prompt?: string;
  greeting?: string;
  audioUrl?: string | null;
  options?: string[];
  feedback?: string[];
  [key: string]: unknown;
}

interface LessonFile {
  meta: { program: string; unitOrder: number; unitLabel: string; lessonTitle: string };
  steps: ContentStep[];
}

// ═══ Helpers ═══

/** Extract the best narration text from a step */
function getStepNarrationText(step: ContentStep): string | null {
  // Priority: body > question > prompt > greeting > title
  if (step.body) return step.body;
  if (step.question) return step.question;
  if (step.prompt) return step.prompt;
  if (step.greeting) return step.greeting;
  if (step.title) return step.title;
  return null;
}

/** Clean text for TTS — remove markdown, make speakable */
function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")     // bold → plain
    .replace(/\*(.+?)\*/g, "$1")          // italic → plain
    .replace(/`(.+?)`/g, "$1")            // inline code → plain
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")   // links → label only
    .replace(/\n{2,}/g, ". ")             // double newline → sentence break
    .replace(/\n/g, " ")                  // single newline → space
    .replace(/\s+/g, " ")                 // collapse whitespace
    .trim();
}

/** Cost estimate: $30/M chars for tts-1-hd */
function estimateCost(chars: number): string {
  return `$${((chars / 1_000_000) * 30).toFixed(4)}`;
}

// ═══ TTS API ═══

async function generateSpeech(text: string, stepId: string): Promise<Buffer> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set. Set it in env or .env file.");
  }

  const cleanText = cleanForSpeech(text);
  console.log(`  📝 Text (${cleanText.length} chars): "${cleanText.slice(0, 80)}..."`);

  const response = await fetch(TTS_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TTS_MODEL,
      input: cleanText,
      voice: TTS_VOICE,
      response_format: "mp3",
      speed: 1.0,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI TTS API error (${response.status}): ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ═══ Main ═══

async function main() {
  const args = process.argv.slice(2);
  const programFilter = args.includes("--program")
    ? args[args.indexOf("--program") + 1]
    : null;
  const dryRun = args.includes("--dry-run");

  if (!OPENAI_API_KEY) {
    console.log("⚠️  OPENAI_API_KEY not set. Running in dry-run mode only.");
    console.log("   Set it via: export OPENAI_API_KEY=sk-...\n");
  }

  // Discover content files
  const programs = fs.readdirSync(CONTENT_DIR).filter((f) => {
    const fullPath = path.join(CONTENT_DIR, f);
    return fs.statSync(fullPath).isDirectory() && (!programFilter || f === programFilter);
  });

  if (programs.length === 0) {
    console.log(`No programs found${programFilter ? ` matching "${programFilter}"` : ""}`);
    return;
  }

  let totalChars = 0;
  let totalSteps = 0;
  let generatedFiles = 0;

  for (const program of programs) {
    const programDir = path.join(CONTENT_DIR, program);
    const lessons = fs.readdirSync(programDir).filter((f) => f.endsWith(".json"));

    console.log(`\n📚 Program: ${program} (${lessons.length} lessons)`);

    for (const lessonFile of lessons) {
      const lessonPath = path.join(programDir, lessonFile);
      const lesson: LessonFile = JSON.parse(fs.readFileSync(lessonPath, "utf-8"));
      let lessonModified = false;

      console.log(`  📖 ${lesson.meta.lessonTitle}`);

      for (const step of lesson.steps) {
        const text = getStepNarrationText(step);
        if (!text) continue;

        // Skip if already has audioUrl
        if (step.audioUrl && step.audioUrl !== null) {
          console.log(`    ✓ ${step.id}: already has audio`);
          continue;
        }

        totalSteps++;
        totalChars += text.length;

        const mp3RelativePath = `assets/audio/${program}/${step.id}.mp3`;
        const mp3AbsolutePath = path.join(ASSETS_DIR, program, `${step.id}.mp3`);

        if (dryRun) {
          console.log(`    🔍 ${step.id}: would generate (${text.length} chars) → ${mp3RelativePath}`);
          continue;
        }

        if (!OPENAI_API_KEY) {
          console.log(`    ⏭  ${step.id}: skipping (no API key)`);
          continue;
        }

        try {
          console.log(`    🎙️  ${step.id}: generating...`);
          const mp3Buffer = await generateSpeech(text, step.id);

          // Write MP3
          fs.mkdirSync(path.dirname(mp3AbsolutePath), { recursive: true });
          fs.writeFileSync(mp3AbsolutePath, mp3Buffer);
          console.log(`    ✅ ${step.id}: saved (${(mp3Buffer.length / 1024).toFixed(1)} KB) → ${mp3RelativePath}`);

          // Update step audioUrl
          step.audioUrl = mp3RelativePath;
          lessonModified = true;
          generatedFiles++;

          // Rate limit: OpenAI is fast but be respectful
          await new Promise((r) => setTimeout(r, 200));
        } catch (err) {
          console.error(`    ❌ ${step.id}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      // Write updated lesson JSON if modified
      if (lessonModified) {
        fs.writeFileSync(lessonPath, JSON.stringify(lesson, null, 2) + "\n");
        console.log(`  💾 Updated ${lessonFile}`);
      }
    }
  }

  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  Summary                             ║`);
  console.log(`╠══════════════════════════════════════╣`);
  console.log(`║  Steps with narration: ${totalSteps}            ║`);
  console.log(`║  Total characters:     ${totalChars.toLocaleString()}        ║`);
  console.log(`║  Estimated cost:       ${estimateCost(totalChars)}           ║`);
  console.log(`║  Files generated:      ${generatedFiles}                    ║`);
  console.log(`╚══════════════════════════════════════╝`);

  if (dryRun) {
    console.log("\n🔍 Dry run complete. Remove --dry-run to generate actual audio files.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
