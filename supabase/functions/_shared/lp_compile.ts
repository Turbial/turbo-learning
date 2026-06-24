// Deterministic compiler (server port of learning/authoring/compile.mjs).
//
// LLM owns meaning; CODE owns structure. Takes content-only authoring JSON for one
// lesson and returns wired + VALIDATED lp_lesson_items rows. Unlike the local
// authoring script (readable ids for committed artifacts), this assigns real UUIDs
// so rows insert straight into lp_lesson_items (id uuid). If the content can't form
// a playable graph, compileLesson throws and nothing is inserted — the hard gate.

export interface AuthoringLesson {
  title: string;
  source_text?: string;
  concepts?: Array<{ tag: string; label: string }>;
  quizzes?: Array<{
    concept: string;
    difficulty?: number;
    question: string;
    options: Array<{ text: string; correct: boolean; feedback?: string }>;
  }>;
  scenarios?: Array<{
    concept: string;
    setup: string;
    choices: Array<{ text: string; good?: boolean; outcome: string }>;
  }>;
  flashcards?: Array<{ concept: string; front: string; back: string }>;
}

export interface CompiledItem {
  id: string;
  item_type: "menu" | "quiz" | "scenario" | "flash" | "feedback" | "done";
  concept_tag: string | null;
  difficulty: number;
  bot_text: string;
  buttons: Array<{ label: string; action: string; to?: string; correct?: boolean }>;
  is_entry?: boolean;
  content_version: string;
}

export interface CompiledLesson {
  title: string;
  source_text: string;
  key_concepts: Array<{ tag: string; label: string }>;
  content_version: string;
  items: CompiledItem[];
}

const uid = () => crypto.randomUUID();

async function versionOf(s: string): Promise<string> {
  const norm = (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(norm));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error("Authoring error: " + msg);
}

export async function compileLesson(lesson: AuthoringLesson): Promise<CompiledLesson> {
  assert(lesson?.title, "lesson.title required");
  const content_version = await versionOf(lesson.source_text || JSON.stringify(lesson));
  const conceptTags = new Set((lesson.concepts || []).map((c) => c.tag));

  type Internal = CompiledItem & { _role?: string; _parent?: string };
  const items: Internal[] = [];
  const quizIds: string[] = [];
  const scenarioIds: string[] = [];
  const flashIds: string[] = [];

  for (const q of lesson.quizzes || []) {
    assert(conceptTags.has(q.concept), `quiz concept '${q.concept}' not in lesson concepts`);
    const correctCount = (q.options || []).filter((o) => o.correct).length;
    assert(correctCount === 1, `quiz "${q.question}" must have exactly one correct option`);
    const quizId = uid();
    const buttons = q.options.map((o) => {
      const fbId = uid();
      items.push({
        id: fbId, item_type: "feedback", concept_tag: q.concept, difficulty: q.difficulty ?? 2,
        bot_text: o.feedback || (o.correct ? "Correct." : "Not quite."), buttons: [],
        content_version, _role: "feedback", _parent: quizId,
      });
      return { label: o.text, action: "answer", correct: !!o.correct, to: fbId };
    });
    items.push({
      id: quizId, item_type: "quiz", concept_tag: q.concept, difficulty: q.difficulty ?? 2,
      bot_text: q.question, buttons, content_version, _role: "quiz",
    });
    quizIds.push(quizId);
  }

  for (const s of lesson.scenarios || []) {
    assert(conceptTags.has(s.concept), `scenario concept '${s.concept}' not in lesson concepts`);
    const scId = uid();
    const buttons = (s.choices || []).map((c) => {
      const fbId = uid();
      items.push({
        id: fbId, item_type: "feedback", concept_tag: s.concept, difficulty: 3,
        bot_text: c.outcome, buttons: [], content_version, _role: "feedback", _parent: scId,
      });
      return { label: c.text, action: "branch", to: fbId };
    });
    items.push({
      id: scId, item_type: "scenario", concept_tag: s.concept, difficulty: 3,
      bot_text: s.setup, buttons, content_version, _role: "scenario",
    });
    scenarioIds.push(scId);
  }

  for (const f of lesson.flashcards || []) {
    assert(conceptTags.has(f.concept), `flashcard concept '${f.concept}' not in lesson concepts`);
    const frontId = uid(), backId = uid();
    items.push({
      id: backId, item_type: "feedback", concept_tag: f.concept, difficulty: 1,
      bot_text: f.back, buttons: [], content_version, _role: "feedback", _parent: frontId,
    });
    items.push({
      id: frontId, item_type: "flash", concept_tag: f.concept, difficulty: 1,
      bot_text: f.front, buttons: [{ label: "Flip card", action: "goto", to: backId }],
      content_version, _role: "flash",
    });
    flashIds.push(frontId);
  }

  const menuId = uid();
  const menuButtons: CompiledItem["buttons"] = [];
  if (quizIds.length) menuButtons.push({ label: "🎯 Quiz me", action: "goto", to: quizIds[0] });
  if (scenarioIds.length) menuButtons.push({ label: "🎭 Play a scenario", action: "goto", to: scenarioIds[0] });
  if (flashIds.length) menuButtons.push({ label: "🃏 Flashcards", action: "goto", to: flashIds[0] });
  menuButtons.push({ label: "💬 Ask my own question", action: "escape" });
  const doneId = uid();
  menuButtons.push({ label: "✓ Finish lesson", action: "goto", to: doneId });
  items.unshift({
    id: menuId, item_type: "menu", concept_tag: null, difficulty: 1,
    bot_text: `You're on "${lesson.title}". How do you want to lock it in?`,
    buttons: menuButtons, is_entry: true, content_version, _role: "menu",
  });
  items.push({
    id: doneId, item_type: "done", concept_tag: null, difficulty: 1,
    bot_text: "Nice — that's the lesson. Ready for the next piece?",
    buttons: [{ label: "↻ Replay this lesson", action: "goto", to: menuId }],
    content_version, _role: "done",
  });

  // One guided chain: quizzes → scenarios → flashcards → done (every item reachable).
  const order = [...quizIds, ...scenarioIds, ...flashIds];
  const nextOf: Record<string, string> = {};
  order.forEach((id, i) => { nextOf[id] = order[i + 1] || doneId; });
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  for (const it of items) {
    if (it._role !== "feedback") continue;
    const parent = it._parent ? byId[it._parent] : undefined;
    const target = parent ? nextOf[parent.id] ?? menuId : menuId;
    it.buttons = [{ label: target === doneId ? "Finish →" : "Next →", action: "goto", to: target }];
  }

  validateGraph(items, conceptTags);

  const clean: CompiledItem[] = items.map(({ _role, _parent, ...keep }) => keep);
  return {
    title: lesson.title,
    source_text: lesson.source_text || "",
    key_concepts: lesson.concepts || [],
    content_version,
    items: clean,
  };
}

function validateGraph(items: CompiledItem[], conceptTags: Set<string>): void {
  const ids = new Set(items.map((i) => i.id));
  const errs: string[] = [];
  const entry = items.find((i) => i.is_entry);
  if (!entry) errs.push("no entry (menu) step");
  for (const it of items) {
    if (it.item_type !== "done" && (!it.buttons || it.buttons.length === 0)) errs.push(`${it.id} (${it.item_type}): no buttons`);
    if (it.item_type === "quiz" && it.buttons.filter((b) => b.correct).length !== 1) errs.push(`${it.id}: quiz needs exactly one correct`);
    for (const b of it.buttons || []) if (b.action !== "escape" && b.to && !ids.has(b.to)) errs.push(`${it.id}: button → ${b.to} is a dead end`);
    if (it.concept_tag && !conceptTags.has(it.concept_tag)) errs.push(`${it.id}: concept_tag ${it.concept_tag} not declared`);
  }
  if (entry) {
    const seen = new Set<string>(), stack = [entry.id];
    while (stack.length) {
      const c = stack.pop()!; if (seen.has(c)) continue; seen.add(c);
      for (const b of items.find((i) => i.id === c)?.buttons || []) if (b.to) stack.push(b.to);
    }
    for (const it of items) if (!seen.has(it.id)) errs.push(`${it.id} (${it.item_type}): unreachable`);
  }
  if (errs.length) throw new Error("COMPILE VALIDATION FAILED:\n- " + errs.join("\n- "));
}
