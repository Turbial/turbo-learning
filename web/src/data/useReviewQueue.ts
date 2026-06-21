import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export type ReviewItem = {
  id: string
  step_id: string
  lesson_id: string
  due_at: string
}

export function useReviewQueue(userId?: string) {
  return useQuery<ReviewItem[]>({
    queryKey: ['review-queue', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_queue')
        .select('id,step_id,lesson_id,due_at')
        .lte('due_at', new Date().toISOString())
        .order('due_at')
      if (error) throw error
      return (data ?? []) as ReviewItem[]
    },
  })
}

export function useMarkReviewed() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      itemId,
      difficulty,
    }: {
      itemId: string
      difficulty: 'easy' | 'hard' | 'again'
    }) => {
      const daysMap = { easy: 7, hard: 1 } as const
      const due = new Date()
      if (difficulty === 'again') {
        due.setMinutes(due.getMinutes() + 10)
      } else {
        due.setDate(due.getDate() + daysMap[difficulty])
      }
      const { error } = await supabase
        .from('review_queue')
        .update({ due_at: due.toISOString() })
        .eq('id', itemId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['review-queue'] }),
  })
}
