// data/useLeaderboard.ts — global / friends leaderboard.
// NOTE: leaderboards expose other users' display name + XP. Confirm the
// leaderboard_view RLS only surfaces opt-in, non-sensitive fields (see 0007).
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

export type LeaderRow = { user_id: string; display_name: string; xp: number; rank: number };

export function useLeaderboard(scope: 'global' | 'friends' = 'global', limit = 50) {
  return useQuery<LeaderRow[]>({
    queryKey: ['leaderboard', scope, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_view').select('user_id,display_name,xp,rank')
        .order('xp', { ascending: false }).limit(limit);
      if (error) throw error;
      return (data ?? []) as LeaderRow[];
    },
  });
}
