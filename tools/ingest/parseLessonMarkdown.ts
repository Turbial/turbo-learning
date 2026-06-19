/**
 * parseLessonMarkdown.ts — shared markdown→lesson parser
 *
 * Extracted from convert.ts so both the local-file CLI (convert.ts) and the
 * Google-Docs CLI (from-gdoc.ts) parse the same DSL the same way.
 *
 * The DSL itself is documented in tools/ingest/template.md.
 */

// ═══ Types ═══

export interface StepFields {
  id: string;
  type: string;
  [key: string]: unknown;
}

export interface LessonOutput {
  version: number;
  unit: string;
  title: string;
  estMinutes: number;
  steps: StepFields[];
}

export interface ParsedStep {
  type: string;
  fields: Record<string, unknown>;
}

// ═══ Parser ═══

/**
 * Parse a markdown file into an array of parsed steps.
 * Steps are separated by `---` on its own line.
 * Each step starts with `## STEP: <type>`.
 */
export function parseMarkdown(content: string): { meta: Record<string, string>; steps: ParsedStep[] } {
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

    // Auto-extract highlights from body for highlight steps
    if (stepType === "highlight" && fields.body && !fields.highlights) {
      const highlights = extractBoldPhrases(fields.body as string);
      if (highlights.length > 0) {
        fields.highlights = highlights;
      }
    }

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
export function parseStepFields(block: string): Record<string, unknown> {
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

  return fields;
}

/**
 * Extract **bold** phrases from body text for auto-highlighting.
 */
export function extractBoldPhrases(text: string): string[] {
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
export function parseObjectList(lines: string[], startIdx: number): Record<string, unknown>[] {
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

export function convertToLesson(meta: Record<string, string>, steps: ParsedStep[]): LessonOutput {
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
