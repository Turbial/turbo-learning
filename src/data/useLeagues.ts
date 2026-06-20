// ─── useLeagues — XP League data hook ───
// Fetches the current user's weekly league standings via Supabase RPC + view.
// Auto-enrolls the user in their tier's league on first call each week.

import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

export type LeagueStanding = {
  user_id: string;
  display_name: string;
  week_xp: number;
  rank: number;
  tier: string;
  week_start: string;
};

export const TIER_INFO: Record<string, { label: string; emoji: string; color: string }> = {
  bronze:  { label: 'Bronze',  emoji: '🥉', color: '#cd7f32' },
  silver:  { label: 'Silver',  emoji: '🥈', color: '#9ca3af' },
  gold:    { label: 'Gold',    emoji: '🥇', color: '#f59e0b' },
  diamond: { label: 'Diamond', emoji: '💎', color: '#6366f1' },
  master:  { label: 'Master',  emoji: '🏆', color: '#059669' },
};

export function useMyLeague(userId?: string) {
  return useQuery({
    queryKey: ['my_league', userId],
    enabled: !!userId,
    queryFn: async () => {
      // Auto-enroll if not enrolled yet this week; returns existing league_id if already in
      const { data: leagueId, error: enrollError } = await supabase.rpc('enroll_in_league', {
        p_user_id: userId,
      });
      if (enrollError) throw enrollError;
      if (!leagueId) return null;

      const { data, error } = await supabase
        .from('league_standings')
        .select('user_id,display_name,week_xp,rank,tier,week_start')
        .eq('league_id', leagueId)
        .order('rank', { ascending: true })
        .limit(30);

      if (error) throw error;
      return {
        leagueId,
        standings: (data ?? []) as LeagueStanding[],
        tier: (data?.[0]?.tier ?? 'bronze') as string,
      };
    },
    staleTime: 60_000,
  });
}
