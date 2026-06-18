// ─── Adaptive selection + weak-area detection (LLM-free) ───
//
// The "adapt" half of the engine: pick what to serve next from the pool based on
// per-concept mastery and a recent-correctness streak — harder after a streak,
// re-drill the weakest concept when struggling, prefer items not yet served. This
// "feels like live AI" but is pure selection over the compiled graph (mirrors the
// adaptive SQL in learning_platform ENGINE.md; the backend version is lp_next_adaptive).

import type { CompiledLesson, CompiledItem, ConceptMastery } from "./types";

/** The concept with the lowest mastery (correct/attempts), among attempted ones. */
export function weakestConcept(mastery: ConceptMastery[]): ConceptMastery | null {
  const attempted = mastery.filter((m) => m.attempts > 0);
  if (attempted.length === 0) return null;
  return attempted.reduce((lo, m) =>
    m.correct / m.attempts < lo.correct / lo.attempts ? m : lo,
  );
}

/** Recent-correctness streak → target difficulty (1 reinforce … 4 stretch). */
export function targetDifficulty(streak: number): number {
  if (streak >= 2) return 4; // on a roll → stretch
  if (streak <= -1) return 1; // struggling → reinforce
  return 2;
}

/**
 * Choose the next quiz item: weakest concept first, difficulty nearest the target,
 * preferring items the student hasn't seen. Falls back to re-drilling when the
 * pool for that concept is exhausted. Returns null if the lesson has no quizzes.
 */
export function pickAdaptiveItem(args: {
  lesson: CompiledLesson;
  mastery: ConceptMastery[];
  servedItemIds: Set<string>;
  streak: number;
}): CompiledItem | null {
  const { lesson, mastery, servedItemIds, streak } = args;
  const quizzes = lesson.items.filter((i) => i.item_type === "quiz");
  if (quizzes.length === 0) return null;

  const weak = weakestConcept(mastery);
  const target = targetDifficulty(streak);

  const byConcept = weak ? quizzes.filter((q) => q.concept_tag === weak.tag) : [];
  const pool = byConcept.length ? byConcept : quizzes;

  const unserved = pool.filter((q) => !servedItemIds.has(q.id));
  const ranked = (unserved.length ? unserved : pool)
    .slice()
    .sort((a, b) => Math.abs((a.difficulty ?? 2) - target) - Math.abs((b.difficulty ?? 2) - target));

  return ranked[0] ?? null;
}
