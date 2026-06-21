#!/usr/bin/env npx tsx
/**
 * convert.ts — Convert markdown lesson template to Turbo Academy JSON format
 *
 * Usage:
 *   npx tsx tools/ingest/convert.ts --input my-lesson.md --program ai_operator --day 15
 *   npx tsx tools/ingest/convert.ts --input my-lesson.md --program duo --day 3 --output /tmp/out.json
 *
 * The input file follows the template at tools/ingest/template.md
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMarkdown, convertToLesson } from "./parseLessonMarkdown.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══ Main ═══

function main() {
  const args = process.argv.slice(2);

  const inputIdx = args.indexOf("--input");
  const programIdx = args.indexOf("--program");
  const dayIdx = args.indexOf("--day");
  const outputIdx = args.indexOf("--output");

  if (inputIdx === -1) {
    console.error("Usage: npx tsx tools/ingest/convert.ts --input <file.md> --program <slug> --day <N> [--output <path>]");
    console.error("  --input    Path to markdown template file");
    console.error("  --program  Program slug (ai_operator, duo, ai_for_everyone, filmassist)");
    console.error("  --day      Day number in the program");
    console.error("  --output   Optional custom output path");
    process.exit(1);
  }

  const inputPath = args[inputIdx + 1];
  const program = args[programIdx + 1] || "ai_operator";
  const day = args[dayIdx + 1] || "1";
  const customOutput = outputIdx !== -1 ? args[outputIdx + 1] : null;

  // Resolve input path
  const resolvedInput = path.resolve(inputPath);
  if (!fs.existsSync(resolvedInput)) {
    console.error(`❌ Input file not found: ${resolvedInput}`);
    process.exit(1);
  }

  console.log(`📖 Reading: ${resolvedInput}`);
  const content = fs.readFileSync(resolvedInput, "utf-8");

  console.log("🔍 Parsing markdown...");
  const { meta, steps } = parseMarkdown(content);

  // Apply CLI overrides
  if (program) meta.program = program;
  if (day) meta.day = day;

  console.log(`   Program: ${meta.program || "unknown"}`);
  console.log(`   Day: ${meta.day || "?"}`);
  console.log(`   Title: ${meta.title || "untitled"}`);
  console.log(`   Steps: ${steps.length}`);

  if (steps.length === 0) {
    console.error("❌ No steps found. Check your markdown format against tools/ingest/template.md");
    process.exit(1);
  }

  // Validate steps
  for (const step of steps) {
    if (!step.fields.id) {
      console.error(`❌ Step of type "${step.type}" is missing an "id" field. Every step needs a unique ID.`);
      process.exit(1);
    }
  }

  // Convert to lesson JSON
  const lesson = convertToLesson(meta, steps);

  // Determine output path
  let outputPath: string;
  if (customOutput) {
    outputPath = path.resolve(customOutput);
  } else {
    const programDir = path.resolve(__dirname, "../../src/content", program);
    fs.mkdirSync(programDir, { recursive: true });
    outputPath = path.join(programDir, `day${day}.json`);
  }

  // Write output
  const json = JSON.stringify(lesson, null, 2) + "\n";
  fs.writeFileSync(outputPath, json);

  console.log(`✅ Written: ${outputPath}`);
  console.log(`   Size: ${(json.length / 1024).toFixed(1)} KB`);
  console.log(`   Step types: ${[...new Set(steps.map((s) => s.type))].join(", ")}`);

  // Print summary
  console.log("\n📋 Step Summary:");
  for (const step of steps) {
    const type = step.type.padEnd(14);
    const id = (step.fields.id as string).padEnd(20);
    const title = typeof step.fields.title === "string"
      ? step.fields.title.slice(0, 40)
      : typeof step.fields.question === "string"
        ? step.fields.question.slice(0, 40)
        : typeof step.fields.body === "string"
          ? (step.fields.body as string).slice(0, 40)
          : "";
    console.log(`   ${type} ${id} ${title}`);
  }
}

main();
