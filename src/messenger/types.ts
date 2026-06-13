// ─── Messenger types — the compiled content graph + chat runtime state ───
//
// These mirror the `lp_lesson_items` shape produced by learning/authoring/compile.mjs
// and consumed at serve time. Serve/resolve is LLM-FREE: every tap is a local
// lookup over this graph. The only live model call is the `escape` (Ask) action.

// The five button actions (see learning_platform ENGINE.md):
//   goto   — advance to step `to`
//   answer — check `correct`, bump mastery, go to feedback step `to`
//   branch — scenario choice → follow-up step `to`
//   mode   — start a sub-sequence (really a goto)
//   escape — open free text → Ask service (the only live call)
export type ActionType = "goto" | "answer" | "branch" | "mode" | "escape";

export type ItemType = "menu" | "quiz" | "scenario" | "flash" | "feedback" | "done";

export interface ItemButton {
  label: string;
  action: ActionType;
  to?: string; // absent only for `escape`
  correct?: boolean; // present only for `answer`
}

export interface CompiledItem {
  id: string;
  item_type: ItemType;
  concept_tag: string | null;
  difficulty: number;
  bot_text: string;
  buttons: ItemButton[];
  is_entry?: boolean;
  content_version: string;
}

export interface KeyConcept {
  tag: string;
  label: string;
}

export interface CompiledLesson {
  title: string;
  source_text: string;
  key_concepts: KeyConcept[];
  content_version: string;
  items: CompiledItem[];
}

export interface CompiledCourse {
  course: { title: string; description?: string; voice?: string; destination?: string };
  lessons: CompiledLesson[];
}

// ─── Runtime chat state ───

export type BubbleRole = "bot" | "user";
export type BubbleTone = "neutral" | "correct" | "wrong";

export interface ChatBubble {
  key: string;
  role: BubbleRole;
  text: string;
  itemType?: ItemType;
  tone?: BubbleTone;
}

// One row per concept, accumulated from `answer` taps — the client-side mirror of
// lp_concept_mastery. masteryPct is derived (correct / attempts).
export interface ConceptMastery {
  tag: string;
  label: string;
  correct: number;
  attempts: number;
}

// Mirror of an lp_progress_events row — every tap. In Phase 2 these flush to Supabase.
export interface ProgressEvent {
  itemId: string;
  conceptTag: string | null;
  wasCorrect: boolean | null;
  at: number;
}
