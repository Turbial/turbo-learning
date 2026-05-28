// =====================================================================
// data/mutations.ts — the client side of the persistence contract.
// step responses: upsert one latest per step.  completion: idempotent RPC.
// =====================================================================
import { supabase } from './supabase';
import type { StepResponse, CompleteLessonResult } from '../engine/types';

// Upsert one latest response per (user, lesson, step). Safe to retry.
export async function upsertStepResponse(params: {
  userId: string;
  lessonId: string;
  stepId: string;
  response: StepResponse;
  correct: boolean | null;
}) {
  const { userId, lessonId, stepId, response, correct } = params;
  return supabase
    .from('step_responses')
    .upsert(
      { user_id: userId, lesson_id: lessonId, step_id: stepId, response, correct, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,lesson_id,step_id' },
    );
}

// Finalize a lesson exactly once. The RPC is idempotent: a second call adds no XP.
// @deprecated — prefer useCompleteLesson() from queries.ts (TanStack Query wrapper).
// Requires migration 0011: complete_lesson now derives user from auth.uid().
export async function completeLesson(params: {
  lessonId: string;
  xpEarned: number;
  score: number;
}): Promise<CompleteLessonResult> {
  const { data, error } = await supabase.rpc('complete_lesson', {
    p_lesson_id: params.lessonId,
    p_xp_earned: params.xpEarned,
    p_score: params.score,
  });
  if (error) throw error;
  return data as CompleteLessonResult;
}
