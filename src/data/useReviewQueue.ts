// data/useReviewQueue.ts — spaced-repetition items due for review.
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

export type ReviewItem = { id: string; step_id: string; lesson_id: string; due_at: string };

export function useReviewQueue(userId?: string) {
  return useQuery<ReviewItem[]>({
    queryKey: ['review-queue', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_queue').select('id,step_id,lesson_id,due_at')
        .lte('due_at', new Date().toISOString()).order('due_at');
      if (error) throw error;
      return (data ?? []) as ReviewItem[];
    },
  });
}
