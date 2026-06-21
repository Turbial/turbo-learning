import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export type LeaderRow = {
  user_id: string
  display_name: string
  xp: number
  rank: number
}

export function useLeaderboard(scope: 'global' | 'friends' = 'global', limit = 50) {
  return useQuery<LeaderRow[]>({
    queryKey: ['leaderboard', scope, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('user_id,display_name,xp,rank')
        .order('rank', { ascending: true })
        .limit(limit)
      if (error) throw error
      return (data ?? []) as LeaderRow[]
    },
    staleTime: 60_000,
  })
}
