import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useStreakShield(userId?: string) {
  const qc = useQueryClient()

  const query = useQuery<{ count: number }>({
    queryKey: ['shields', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('shield_count')
        .eq('id', userId)
        .single()
      if (error) throw error
      return { count: (data as { shield_count?: number })?.shield_count ?? 0 }
    },
  })

  const purchase = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('purchase_shield')
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shields', userId] }),
  })

  return { ...query, purchase }
}
