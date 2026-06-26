#!/usr/bin/env npx tsx
/**
 * from-gdoc.ts — Convert a Google Doc lesson into Turbo Academy JSON format
 *
 * Usage:
 *   npx tsx tools/ingest/from-gdoc.ts --doc <id-or-url> --program ai_operator --day 15
 *   npx tsx tools/ingest/from-gdoc.ts --doc <id-or-url> --program duo --day 3 --dry-run
 *   npx tsx tools/ingest/from-gdoc.ts --doc <id-or-url> --program ai_operator --day 13 --force
 *
 * The doc must use the SAME plain-text DSL as tools/ingest/template.md (the
 * "## STEP: type" / "key: value" / "---" syntax), typed literally — including
 * literal "**bold**" markers for highlight phrases. This script does not read
 * Google Docs rich-text formatting (bold/italic), only the exported text.
 *
 * The doc must be shared as "Anyone with the link can view" — this script
 * fetches Google's public export endpoint directly and does not authenticate.
 * For private docs, export manually (File > Download > Plain text) and run
 * convert.ts on the resulting .txt/.md file instead.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseMarkdown, convertToLesson } from "./parseLessonMarkdown.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractDocId(input: string): string {
  const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]+$/.test(input)) return input;
  console.error(`❌ Could not extract a Google Doc ID from: ${input}`);
  console.error("   Pass either the doc URL or the bare document ID.");
  process.exit(1);
}

async function fetchDocText(docId: string): Promise<string> {
  const url = `https://docs.google.com/document/d/${docId}/export?format=txt`;
  const res = await fetch(url, { redirect: "follow" });

  const isSignIn = res.url.includes("accounts.google.com");
  if (!res.ok || isSignIn) {
    console.error(`❌ Could not fetch doc ${docId} (status ${res.status}).`);
    console.error('   Make sure the doc is shared as "Anyone with the link can view".');
    console.error("   For private docs, export manually (File > Download > Plain text)");
    console.error("   and run tools/ingest/convert.ts on the resulting file instead.");
    process.exit(1);
  }

  const text = await res.text();
  if (/^\s*<(!doctype html|html)/i.test(text)) {
    console.error(`❌ Got an HTML page instead of plain text for doc ${docId}.`);
    console.error('   Make sure the doc is shared as "Anyone with the link can view".');
    process.exit(1);
  }

  return text;
}

function runValidator(lessonPath: string): boolean {
  const validatorPath = path.resolve(__dirname, "../../tools/validate_lesson.py");
  try {
    const output = execFileSync("python3", [validatorPath, lessonPath], { encoding: "utf-8" });
    console.log(output.trim());
    return true;
  } catch (err: any) {
    if (err.stdout) console.log(String(err.stdout).trim());
    if (err.stderr) console.error(String(err.stderr).trim());
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  const docIdx = args.indexOf("--doc");
  const programIdx = args.indexOf("--program");
  const dayIdx = args.indexOf("--day");
  const outputIdx = args.indexOf("--output");
  const force = args.includes("--force");
  const dryRun = args.includes("--dry-run");

  if (docIdx === -1) {
    console.error("Usage: npx tsx tools/ingest/from-gdoc.ts --doc <id-or-url> --program <slug> --day <N> [--output <path>] [--force] [--dry-run]");
    console.error("  --doc      Google Doc URL or document ID (must be link-shareable)");
    console.error("  --program  Program slug (ai_operator, duo, ai_for_everyone, filmassist)");
    console.error("  --day      Day number in the program");
    console.error("  --output   Optional custom output path");
    console.error("  --force    Overwrite an existing day file");
    console.error("  --dry-run  Parse and validate only, do not write any file");
    process.exit(1);
  }

  const docId = extractDocId(args[docIdx + 1]);
  const program = args[programIdx + 1] || "ai_operator";
  const day = args[dayIdx + 1] || "1";
  const customOutput = outputIdx !== -1 ? args[outputIdx + 1] : null;

  console.log(`📖 Fetching Google Doc: ${docId}`);
  const content = await fetchDocText(docId);

  console.log("🔍 Parsing markdown...");
  const { meta, steps } = parseMarkdown(content);

  if (program) meta.program = program;
  if (day) meta.day = day;

  console.log(`   Program: ${meta.program || "unknown"}`);
  console.log(`   Day: ${meta.day || "?"}`);
  console.log(`   Title: ${meta.title || "untitled"}`);
  console.log(`   Steps: ${steps.length}`);

  if (steps.length === 0) {
    console.error("❌ No steps found. Check the doc's formatting against tools/ingest/template.md");
    process.exit(1);
  }

  for (const step of steps) {
    if (!step.fields.id) {
      console.error(`❌ Step of type "${step.type}" is missing an "id" field. Every step needs a unique ID.`);
      process.exit(1);
    }
  }

  const lesson = convertToLesson(meta, steps);
  const json = JSON.stringify(lesson, null, 2) + "\n";

  // Validate against the platform step schema before writing anywhere real
  const tmpPath = path.join(__dirname, `.tmp-${docId}.json`);
  fs.writeFileSync(tmpPath, json);
  console.log("\n🧪 Validating against platform step schema...");
  const valid = runValidator(tmpPath);
  fs.rmSync(tmpPath, { force: true });

  if (!valid) {
    console.error("\n❌ Validation failed. Fix the doc and re-run.");
    process.exit(1);
  }

  if (dryRun) {
    console.log("\n✅ Dry run complete — valid lesson, no file written.");
    return;
  }

  let outputPath: string;
  if (customOutput) {
    outputPath = path.resolve(customOutput);
  } else {
    const programDir = path.resolve(__dirname, "../../src/content", program);
    fs.mkdirSync(programDir, { recursive: true });
    outputPath = path.join(programDir, `day${day}.json`);
  }

  if (fs.existsSync(outputPath) && !force) {
    const existing = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
    console.error(`❌ ${outputPath} already exists.`);
    console.error(`   Existing title: ${existing.title}`);
    console.error(`   New title:      ${lesson.title}`);
    console.error("   Re-run with --force to overwrite.");
    process.exit(1);
  }

  fs.writeFileSync(outputPath, json);
  console.log(`\n✅ Written: ${outputPath}`);
  console.log(`   Size: ${(json.length / 1024).toFixed(1)} KB`);
  console.log(`   Step types: ${[...new Set(steps.map((s) => s.type))].join(", ")}`);
}

main();
