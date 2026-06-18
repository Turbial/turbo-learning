// ─── resolve — the button-action state machine (LLM-FREE serve layer) ───
//
// This is the client-side mirror of the serve/resolve endpoint described in
// learning_platform ENGINE.md. Tapping a button resolves an action against the
// pre-compiled graph: pure local lookups, zero model calls. The only action that
// is NOT resolved here is `escape`, which hands off to the Ask service (ask.ts).
//
// In Phase 2 the same contract moves behind a Supabase Edge Function reading
// lp_lesson_items — the UI (ChatPlayer) does not change.

import type { CompiledLesson, CompiledItem, ItemButton, ProgressEvent } from "./types";

export function getItem(lesson: CompiledLesson, id: string | undefined): CompiledItem | undefined {
  if (!id) return undefined;
  return lesson.items.find((i) => i.id === id);
}

export function getEntry(lesson: CompiledLesson): CompiledItem {
  return lesson.items.find((i) => i.is_entry) ?? lesson.items[0];
}

export interface ResolveResult {
  // Always recorded — every tap is a progress event (mastery + served-tracking).
  event: ProgressEvent;
  // The next step to render. Undefined when the action is `escape`.
  next?: CompiledItem;
  // True when the student tapped the free-text escape hatch.
  escape: boolean;
  // XP awarded for this tap (correct answers earn; participation earns a little).
  xpAwarded: number;
  // When an `answer`/`branch` tap carries a correctness signal, the concept to
  // bump and whether it was correct — drives lp_concept_mastery.
  mastery?: { tag: string; correct: boolean };
}

// Award shape: correct answers scale a little with difficulty; a wrong answer
// still earns a small participation nudge so momentum never stalls.
function xpFor(button: ItemButton, item: CompiledItem): number {
  if (button.action !== "answer") return 0;
  if (button.correct) return 8 + item.difficulty * 2; // 10–18
  return 2;
}

export function resolveTap(
  lesson: CompiledLesson,
  current: CompiledItem,
  button: ItemButton,
): ResolveResult {
  const wasCorrect =
    button.action === "answer" && typeof button.correct === "boolean" ? button.correct : null;

  const event: ProgressEvent = {
    itemId: current.id,
    conceptTag: current.concept_tag,
    wasCorrect,
    at: Date.now(),
  };

  if (button.action === "escape") {
    return { event, escape: true, xpAwarded: 0 };
  }

  const mastery =
    button.action === "answer" && current.concept_tag && typeof button.correct === "boolean"
      ? { tag: current.concept_tag, correct: button.correct }
      : undefined;

  return {
    event,
    next: getItem(lesson, button.to),
    escape: false,
    xpAwarded: xpFor(button, current),
    mastery,
  };
}

// Bubble tone for the step we're advancing INTO, derived from the tapped answer.
export function toneForAnswer(button: ItemButton): "correct" | "wrong" | "neutral" {
  if (button.action !== "answer" || typeof button.correct !== "boolean") return "neutral";
  return button.correct ? "correct" : "wrong";
}
