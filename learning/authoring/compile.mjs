/**
 * compile.js — deterministic compiler (LLM owns meaning, code owns structure).
 *
 *   authoring JSON (simple, content-only)  →  lp_lesson_items rows (wired + validated)
 *
 * This is where STRUCTURE is owned by CODE, not the LLM. It assigns ids, wires
 * every button "to" pointer, builds the menu + feedback + done steps, and
 * VALIDATES the graph. No model call happens here. If the authoring JSON is valid
 * content, the output is a guaranteed-playable state machine.
 *
 *   node learning/authoring/compile.js learning/courses/ai_operator/day1.authoring.json
 *     → writes <name>.compiled.json
 *
 * Adapted from the uploaded learning_platform package. One change vs. the source:
 * item ids are DETERMINISTIC (per-lesson counter, e.g. "L1-003") instead of random
 * UUIDs, so the committed compiled artifact is reproducible and the graph is
 * readable when debugging. Pointers stay stable across re-compiles of unchanged
 * content. At Supabase ingest time the loader can swap these for gen_random_uuid().
 */
import crypto from "node:crypto";
import fs from "node:fs";

const versionOf = (s) =>
  crypto.createHash("sha256").update((s || "").replace(/\s+/g, " ").trim().toLowerCase()).digest("hex");

export function compileCourse(authoring) {
  assert(authoring?.course?.title, "course.title required");
  assert(Array.isArray(authoring.lessons) && authoring.lessons.length, "lessons[] required");

  const out = { course: authoring.course, lessons: [] };

  authoring.lessons.forEach((lesson, lessonIdx) => {
    // Deterministic, readable, per-lesson id factory: L1-001, L1-002, ...
    let seq = 0;
    const prefix = `L${lessonIdx + 1}`;
    const uid = () => `${prefix}-${String(++seq).padStart(3, "0")}`;

    const items = [];
    const content_version = versionOf(lesson.source_text || JSON.stringify(lesson));
    const conceptTags = new Set((lesson.concepts || []).map((c) => c.tag));

    // collect the "playable" step ids in order so the menu + chaining can point at them
    const quizIds = [];
    const scenarioIds = [];
    const flashIds = [];

    // ---- QUIZZES → quiz step + one feedback step per option -----------------
    for (const q of lesson.quizzes || []) {
      assert(conceptTags.has(q.concept), `quiz concept '${q.concept}' not in lesson concepts`);
      const correctCount = (q.options || []).filter((o) => o.correct).length;
      assert(correctCount === 1, `quiz "${q.question}" must have exactly one correct option`);

      const quizId = uid();
      const buttons = q.options.map((o) => {
        const fbId = uid();
        items.push({
          id: fbId, item_type: "feedback", concept_tag: q.concept,
          difficulty: q.difficulty ?? 2,
          bot_text: o.feedback || (o.correct ? "Correct." : "Not quite."),
          buttons: [], // chained later to the next playable step
          _role: "feedback", _parent: quizId,
        });
        return { label: o.text, action: "answer", correct: !!o.correct, to: fbId };
      });
      items.push({
        id: quizId, item_type: "quiz", concept_tag: q.concept,
        difficulty: q.difficulty ?? 2, bot_text: q.question, buttons,
        _role: "quiz",
      });
      quizIds.push(quizId);
    }

    // ---- SCENARIOS → scenario step + one feedback per choice ----------------
    for (const s of lesson.scenarios || []) {
      assert(conceptTags.has(s.concept), `scenario concept '${s.concept}' not in lesson concepts`);
      const scId = uid();
      const buttons = (s.choices || []).map((c) => {
        const fbId = uid();
        items.push({
          id: fbId, item_type: "feedback", concept_tag: s.concept, difficulty: 3,
          bot_text: c.outcome, buttons: [], _role: "feedback", _parent: scId,
        });
        return { label: c.text, action: "branch", to: fbId };
      });
      items.push({
        id: scId, item_type: "scenario", concept_tag: s.concept, difficulty: 3,
        bot_text: s.setup, buttons, _role: "scenario",
      });
      scenarioIds.push(scId);
    }

    // ---- FLASHCARDS → front step + back feedback ----------------------------
    for (const f of lesson.flashcards || []) {
      assert(conceptTags.has(f.concept), `flashcard concept '${f.concept}' not in lesson concepts`);
      const frontId = uid(), backId = uid();
      items.push({
        id: backId, item_type: "feedback", concept_tag: f.concept, difficulty: 1,
        bot_text: f.back, buttons: [], _role: "feedback", _parent: frontId,
      });
      items.push({
        id: frontId, item_type: "flash", concept_tag: f.concept, difficulty: 1,
        bot_text: f.front, buttons: [{ label: "Flip card", action: "goto", to: backId }],
        _role: "flash",
      });
      flashIds.push(frontId);
    }

    // ---- MENU (entry) -------------------------------------------------------
    const menuId = uid();
    const menuButtons = [];
    if (quizIds.length) menuButtons.push({ label: "🎯 Quiz me", action: "goto", to: quizIds[0] });
    if (scenarioIds.length) menuButtons.push({ label: "🎭 Play a scenario", action: "goto", to: scenarioIds[0] });
    if (flashIds.length) menuButtons.push({ label: "🃏 Flashcards", action: "goto", to: flashIds[0] });
    menuButtons.push({ label: "💬 Ask my own question", action: "escape" });
    const FINISH = { label: "✓ Finish lesson", action: "goto", to: "__DONE__" };
    menuButtons.push(FINISH);
    items.unshift({
      id: menuId, item_type: "menu", concept_tag: null, difficulty: 1,
      bot_text: `You're on "${lesson.title}". How do you want to lock it in?`,
      buttons: menuButtons, is_entry: true, _role: "menu",
    });

    // ---- DONE ---------------------------------------------------------------
    const doneId = uid();
    items.push({
      id: doneId, item_type: "done", concept_tag: null, difficulty: 1,
      bot_text: "Nice — that's the lesson. Ready for the next piece?",
      buttons: [{ label: "↻ Replay this lesson", action: "goto", to: menuId }],
      _role: "done",
    });

    // resolve the menu's finish-button placeholder now that doneId exists
    for (const b of menuButtons) if (b.to === "__DONE__") b.to = doneId;

    // ---- CHAIN feedback steps onward (the wiring code owns) ------------------
    chainFeedback(items, { quizIds, scenarioIds, flashIds, menuId, doneId });

    // ---- VALIDATE the graph (hard gate) -------------------------------------
    validateGraph(items, conceptTags);

    // strip internal _fields, stamp version
    const clean = items.map(({ _role, _parent, ...keep }) => ({ ...keep, content_version }));
    out.lessons.push({
      title: lesson.title,
      source_text: lesson.source_text || "",
      key_concepts: lesson.concepts || [],
      content_version,
      items: clean,
    });
  });
  return out;
}

// Chain every feedback step forward through ONE guided sequence:
//   quizzes → scenarios → flashcards → done.
// The menu offers jump-in points (Quiz me / Play a scenario / Flashcards), but
// whichever the student picks, each step's feedback advances to the next playable
// item until the lesson finishes. This is the change vs. the source compiler,
// which only wired the FIRST scenario/flashcard and dead-ended the rest at the
// menu — leaving 2nd+ items unreachable (caught by validateGraph during this
// very build). One ordered chain keeps every generated item reachable.
function chainFeedback(items, { quizIds, scenarioIds, flashIds, menuId, doneId }) {
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  const order = [...quizIds, ...scenarioIds, ...flashIds];
  const nextOf = {};
  order.forEach((id, idx) => { nextOf[id] = order[idx + 1] || doneId; });
  for (const it of items) {
    if (it._role !== "feedback") continue;
    const parent = byId[it._parent];
    if (!parent) { it.buttons = [{ label: "Continue", action: "goto", to: menuId }]; continue; }
    const target = nextOf[parent.id] || menuId;
    const label = target === doneId ? "Finish →" : "Next →";
    it.buttons = [{ label, action: "goto", to: target }];
  }
}

function validateGraph(items, conceptTags) {
  const ids = new Set(items.map((i) => i.id));
  const errs = [];
  const entry = items.find((i) => i.is_entry);
  if (!entry) errs.push("no entry (menu) step");
  for (const it of items) {
    if (it.item_type !== "done" && (!it.buttons || it.buttons.length === 0))
      errs.push(`${it.id} (${it.item_type}): no buttons`);
    if (it.item_type === "quiz" && it.buttons.filter((b) => b.correct).length !== 1)
      errs.push(`${it.id}: quiz needs exactly one correct`);
    for (const b of it.buttons || [])
      if (b.action !== "escape" && b.to && !ids.has(b.to))
        errs.push(`${it.id}: button → ${b.to} is a dead end`);
    if (it.concept_tag && !conceptTags.has(it.concept_tag))
      errs.push(`${it.id}: concept_tag ${it.concept_tag} not declared`);
  }
  // reachability
  if (entry) {
    const seen = new Set(), stack = [entry.id];
    while (stack.length) {
      const c = stack.pop(); if (seen.has(c)) continue; seen.add(c);
      for (const b of (items.find((i) => i.id === c)?.buttons) || []) if (b.to) stack.push(b.to);
    }
    for (const it of items) if (!seen.has(it.id)) errs.push(`${it.id} (${it.item_type}): unreachable`);
  }
  if (errs.length) throw new Error("COMPILE VALIDATION FAILED:\n- " + errs.join("\n- "));
}

function assert(cond, msg) { if (!cond) throw new Error("Authoring error: " + msg); }

// ---- CLI -------------------------------------------------------------------
if (process.argv[1] && process.argv[1].endsWith("compile.mjs")) {
  const path = process.argv[2];
  if (!path) { console.error("usage: node compile.mjs <authoring.json>"); process.exit(1); }
  const authoring = JSON.parse(fs.readFileSync(path, "utf8"));
  const compiled = compileCourse(authoring);
  const outPath = path.replace(/\.json$/, "") + ".compiled.json";
  fs.writeFileSync(outPath, JSON.stringify(compiled, null, 2) + "\n");
  const totalItems = compiled.lessons.reduce((n, l) => n + l.items.length, 0);
  console.log(`✓ compiled "${compiled.course.title}"`);
  console.log(`  ${compiled.lessons.length} lesson(s), ${totalItems} playable steps`);
  console.log(`  → ${outPath}`);
}
