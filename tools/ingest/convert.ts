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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══ Types ═══

interface StepFields {
  id: string;
  type: string;
  [key: string]: unknown;
}

interface LessonOutput {
  version: number;
  unit: string;
  title: string;
  estMinutes: number;
  steps: StepFields[];
}

// ═══ Parser ═══

interface ParsedStep {
  type: string;
  fields: Record<string, unknown>;
}

/**
 * Parse a markdown file into an array of parsed steps.
 * Steps are separated by `---` on its own line.
 * Each step starts with `## STEP: <type>`.
 */
function parseMarkdown(content: string): { meta: Record<string, string>; steps: ParsedStep[] } {
  const blocks = content.split(/\n---\n/);
  const meta: Record<string, string> = {};
  const steps: ParsedStep[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Check if this is the META block
    if (trimmed.startsWith("## META")) {
      const lines = trimmed.split("\n").slice(1);
      for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          meta[match[1]] = match[2].trim();
        }
      }
      continue;
    }

    // Check if this is a STEP block
    const stepMatch = trimmed.match(/^## STEP:\s*(\w+)/);
    if (!stepMatch) continue;

    const stepType = stepMatch[1].toLowerCase();
    const fields = parseStepFields(trimmed);
    steps.push({ type: stepType, fields });
  }

  return { meta, steps };
}

/**
 * Parse key-value fields from a step block.
 *
 * Supports:
 *   key: value                     — simple string
 *   key: >                         — multiline: subsequent indented lines
 *       line 1
 *       line 2
 *   key: true / key: false         — booleans
 *   key: 5                         — numbers
 *   key:                           — empty key followed by a "- " list on next line
 *     - item 1
 *     - item 2
 *   Complex nested objects (questions, fields, pairs):
 *     - id: r1
 *       prompt: What did you learn?
 *       placeholder: Write here...
 */
function parseStepFields(block: string): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  const lines = block.split("\n").slice(1); // skip the ## STEP line

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith("//")) {
      i++;
      continue;
    }

    // Match key: value or key: >
    const simpleMatch = line.match(/^(\w+):\s*(.*)$/);
    if (!simpleMatch) {
      i++;
      continue;
    }

    const key = simpleMatch[1];
    const rest = simpleMatch[2].trim();

    // Boolean values
    if (rest === "true") {
      fields[key] = true;
      i++;
      continue;
    }
    if (rest === "false") {
      fields[key] = false;
      i++;
      continue;
    }

    // Numeric values
    if (/^-?\d+$/.test(rest) && rest !== "") {
      fields[key] = parseInt(rest, 10);
      i++;
      continue;
    }

    // Multiline value with >  (paragraphs separated by blank indented lines)
    if (rest === ">" || rest === "|") {
      const valueLines: string[] = [];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        // A blank line inside a multiline block continues the block
        if (nextLine.trim() === "") {
          valueLines.push("");
          i++;
          continue;
        }
        // Any non-blank, non-key line is part of the value
        // Stop if we hit a new key: pattern
        if (/^\w+:\s/.test(nextLine)) break;
        // Stop if we hit a new separator or step header
        if (nextLine.trim().startsWith("---")) break;
        if (nextLine.trim().startsWith("## ")) { i--; break; }
        valueLines.push(nextLine.trim());
        i++;
      }
      fields[key] = valueLines.join("\n");
      continue;
    }

    // Empty value — could be: list on next lines, or complex object list
    if (rest === "") {
      // Check if next non-empty line starts a "- " list
      let nextIdx = i + 1;
      while (nextIdx < lines.length && !lines[nextIdx].trim()) nextIdx++;

      if (nextIdx < lines.length && lines[nextIdx].trim().startsWith("- ")) {
        // Check if list items are simple values or complex objects
        const peekLine = lines[nextIdx].trim().slice(2);
        const peekColon = peekLine.indexOf(":");
        const peekAfterColon = peekColon > 0 ? peekLine.slice(peekColon + 1).trim() : "";

        // If first item has key: value format (like "id: r1"), it's an object list
        if (peekColon > 0 && peekAfterColon.length > 0) {
          fields[key] = parseObjectList(lines, nextIdx);
          break; // parseObjectList handles the rest
        }

        // Simple string list
        const list: unknown[] = [];
        i = nextIdx;
        while (i < lines.length && lines[i].trim().startsWith("- ")) {
          const item = lines[i].trim().slice(2);
          if (/^\d+$/.test(item)) {
            list.push(parseInt(item, 10));
          } else if (item === "true") {
            list.push(true);
          } else if (item === "false") {
            list.push(false);
          } else {
            list.push(item);
          }
          i++;
        }
        fields[key] = list;
        continue;
      }
      i++;
      continue;
    }

    // Simple string value
    fields[key] = rest;
    i++;
  }

  // Auto-extract highlights from body for highlight steps
  if (fields.type === "highlight" && fields.body && !fields.highlights) {
    const body = fields.body as string;
    const highlights = extractBoldPhrases(body);
    if (highlights.length > 0) {
      fields.highlights = highlights;
    }
  }

  return fields;
}

/**
 * Extract **bold** phrases from body text for auto-highlighting.
 */
function extractBoldPhrases(text: string): string[] {
  const matches = text.match(/\*\*(.+?)\*\*/g);
  if (!matches) return [];
  return matches.map((m) => m.replace(/\*\*/g, ""));
}

/**
 * Parse a list of objects where sub-fields are indented under each "- " item.
 *
 * Example:
 *   - id: r1
 *     prompt: What did you learn?
 *     placeholder: Write here...
 *   - id: r2
 *     prompt: How will you apply this?
 *
 * Returns: [{id:"r1", prompt:"...", placeholder:"..."}, {id:"r2", prompt:"..."}]
 */
function parseObjectList(lines: string[], startIdx: number): Record<string, unknown>[] {
  const objects: Record<string, unknown>[] = [];
  let current: Record<string, unknown> | null = null;
  let i = startIdx;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Stop conditions
    if (!trimmed) {
      i++;
      continue;
    }
    if (trimmed.startsWith("## ") || trimmed === "---") {
      if (current) objects.push(current);
      break;
    }

    // New list item: starts with "- "
    if (trimmed.startsWith("- ")) {
      if (current) objects.push(current);
      current = {};

      const itemContent = trimmed.slice(2);
      const colonIdx = itemContent.indexOf(":");
      if (colonIdx > 0) {
        const k = itemContent.slice(0, colonIdx).trim();
        const v = itemContent.slice(colonIdx + 1).trim();
        // Parse value type
        if (v === "true") current[k] = true;
        else if (v === "false") current[k] = false;
        else if (/^\d+$/.test(v)) current[k] = parseInt(v, 10);
        else current[k] = v;
      }
      i++;
      continue;
    }

    // Continuation: starts with whitespace (sub-field of current object)
    if (line.startsWith("  ") || line.startsWith("\t")) {
      if (current) {
        const colonIdx = trimmed.indexOf(":");
        if (colonIdx > 0) {
          const k = trimmed.slice(0, colonIdx).trim();
          const v = trimmed.slice(colonIdx + 1).trim();
          if (v === "true") current[k] = true;
          else if (v === "false") current[k] = false;
          else if (/^\d+$/.test(v)) current[k] = parseInt(v, 10);
          else current[k] = v;
        }
      }
      i++;
      continue;
    }

    // Otherwise: another key at root level or unrecognized — break
    if (/^\w+:\s/.test(trimmed)) break;
    i++;
  }

  if (current) objects.push(current);

  return objects;
}

// ═══ Converter ═══

function convertToLesson(meta: Record<string, string>, steps: ParsedStep[]): LessonOutput {
  const title = meta.title || `Day ${meta.day || "?"}`;
  const estMinutes = parseInt(meta.estMinutes || "15", 10);
  const day = meta.day || "1";

  const outputSteps: StepFields[] = steps.map((step) => {
    const fields = { ...step.fields };
    fields.type = step.type;

    // Normalize boolean correct to number for mc steps
    if (step.type === "mc" && typeof fields.correct === "boolean") {
      fields.correct = fields.correct ? 1 : 0;
    }

    // Ensure correct is boolean for tf steps
    if (step.type === "tf" && typeof fields.correct === "number") {
      fields.correct = fields.correct === 1;
    }

    return fields as StepFields;
  });

  return {
    version: 1,
    unit: `day${day}`,
    title,
    estMinutes,
    steps: outputSteps,
  };
}

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
