#!/usr/bin/env node
/**
 * TurboEd Content Validator v3
 * Validates all day JSON files across all programs.
 * Matches actual app code schema.
 */

const fs = require('fs');
const path = require('path');

const PROGRAMS = [
  { name: 'AI Operator', dir: 'ai_operator', expected: 28 },
  { name: 'AI for Everyone', dir: 'ai_for_everyone', expected: 14 },
  { name: 'Duo', dir: 'duo', expected: 7 },
];

const VALID_STEP_TYPES = [
  'info', 'mc', 'tf', 'scenario_card', 'scenario', 'example', 'highlight',
  'good_fit', 'builder', 'copy_action', 'paste_capture',
  'reflection', 'completion', 'prompt_generator', 'fillblank',
  'match', 'quiz', 'badge_unlock', 'streak_commitment', 'compare',
  'chat', 'before_after', 'tool_grid', 'confidence', 'intro',
  'reminder_setup',
];

// These step types are "thin" - they only need id + type
const THIN_TYPES = new Set(['intro', 'reminder_setup']);

// Step type schemas matching the actual component implementations
const SCHEMA_BY_TYPE = {
  info:               { required: ['id', 'type', 'title', 'body'] },
  highlight:          { required: ['id', 'type', 'body'] },
  mc:                 { required: ['id', 'type', 'question', 'options', 'correct', 'feedback'] },
  tf:                 { required: ['id', 'type', 'question', 'correct', 'feedback'] },
  good_fit:           { required: ['id', 'type', 'question', 'correct', 'feedback'] },
  builder:            { required: ['id', 'type', 'fields', 'template'] },
  reflection:         { required: ['id', 'type'], optional: ['prompt', 'questions', 'minChars'] },
  scenario_card:      { required: ['id', 'type', 'title', 'body'] },
  scenario:           { required: ['id', 'type', 'question', 'options', 'correct', 'feedback'] },
  // example: supports 'body' OR 'prompt'
  example:            { required: ['id', 'type'] },
  copy_action:        { required: ['id', 'type'] },
  paste_capture:      { required: ['id', 'type', 'body'] },
  completion:         { required: ['id', 'type', 'title', 'body'] },
  fillblank:          { required: ['id', 'type', 'question', 'answer'] },
  match:              { required: ['id', 'type', 'pairs'] },
  quiz:               { required: ['id', 'type', 'questions'] },
  badge_unlock:       { required: ['id', 'type'] },
  streak_commitment:  { required: ['id', 'type'] },
  compare:            { required: ['id', 'type', 'question'] },
  chat:               { required: ['id', 'type'] },
  before_after:       { required: ['id', 'type', 'title', 'before', 'after'] },
  tool_grid:          { required: ['id', 'type', 'tools'] },
  confidence:         { required: ['id', 'type', 'before', 'after', 'question'] },
  prompt_generator:   { required: ['id', 'type', 'title', 'body'] },
};

function validateDay(filePath, programName) {
  const base = path.basename(filePath);
  const results = { file: base, errors: [], warnings: [], valid: true, total_steps: 0, step_types: {} };

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    results.errors.push(`Invalid JSON: ${e.message}`);
    results.valid = false;
    return results;
  }

  // Top-level checks
  if (!data.title) results.warnings.push('Missing top-level "title"');
  if (!data.unit) results.warnings.push('Missing top-level "unit"');
  if (!data.steps) results.errors.push('Missing steps array');
  if (!Array.isArray(data.steps)) {
    results.valid = false;
    return results;
  }

  const steps = data.steps;
  results.total_steps = steps.length;
  results.total_duration = (data.estMinutes || 0) * 60;
  const seenIds = new Set();

  steps.forEach((step, i) => {
    const label = step.title || step.id || `step_${i}`;
    const type = step.type || 'unknown';
    results.step_types[type] = (results.step_types[type] || 0) + 1;

    // Must have id and type
    if (!step.type) results.errors.push(`Step ${i} missing "type"`);
    if (!step.id) results.warnings.push(`Step ${i} (${type}) missing "id"`);

    // Known type check
    if (!VALID_STEP_TYPES.includes(type)) {
      results.warnings.push(`Step "${label}" unknown type: "${type}"`);
    }

    // Schema validation
    if (!THIN_TYPES.has(type)) {
      const schema = SCHEMA_BY_TYPE[type];
      if (schema) {
        for (const field of schema.required) {
          if (step[field] === undefined || step[field] === null) {
            results.errors.push(`Step "${label}" (${type}) missing: "${field}"`);
            results.valid = false;
          }
        }
      }
    }

    // Duplicate IDs
    if (step.id) {
      if (seenIds.has(step.id)) {
        results.errors.push(`Duplicate step id: "${step.id}"`);
        results.valid = false;
      }
      seenIds.add(step.id);
    }
  });

  // Diversity check
  if (Object.keys(results.step_types).length < 2 && results.total_steps >= 5) {
    results.warnings.push(`Only ${Object.keys(results.step_types).length} step types`);
  }

  return results;
}

// Run
const basePath = process.argv[2] || path.join(__dirname, '..', 'src', 'content');
if (!fs.existsSync(basePath)) {
  console.error(`Not found: ${basePath}`);
  process.exit(1);
}

const mode = process.argv[3] || 'report';
let grand = { errors: 0, warnings: 0, valid: 0, files: 0 };

for (const prog of PROGRAMS) {
  const dir = path.join(basePath, prog.dir);
  if (!fs.existsSync(dir)) {
    console.log(`  📁 ${prog.name}: NOT FOUND`);
    continue;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  let pe = 0, pw = 0, pv = 0;

  if (mode === 'report') {
    console.log(`\n  📁 ${prog.name} (${files.length}/${prog.expected})`);
    console.log(`  ${'─'.repeat(50)}`);
  }

  for (const file of files) {
    const r = validateDay(path.join(dir, file), prog.name);
    if (mode === 'report') {
      const icon = r.errors.length > 0 ? '❌' : r.warnings.length > 0 ? '⚠️' : '✅';
      const types = Object.keys(r.step_types).length;
      const dur = Math.round(r.total_duration / 60);
      console.log(`  ${icon} ${r.file} — ${r.total_steps} steps, ${dur}min (${types} types)`);
      for (const e of r.errors) console.log(`     🛑 ${e}`);
      for (const w of r.warnings) console.log(`     ⚠️ ${w}`);
    }
    if (r.errors.length === 0) pv++;
    pe += r.errors.length;
    pw += r.warnings.length;
  }

  if (mode === 'report') {
    console.log(`  → ${pv}/${files.length} clean | ${pe} errors | ${pw} warnings`);
  }
  grand.errors += pe;
  grand.warnings += pw;
  grand.valid += pv;
  grand.files += files.length;
}

console.log(`\n${'='.repeat(54)}`);
console.log(`  TOTAL: ${grand.valid}/${grand.files} ✅ | ${grand.errors} errors | ${grand.warnings} warnings`);
console.log(`${'='.repeat(54)}`);
