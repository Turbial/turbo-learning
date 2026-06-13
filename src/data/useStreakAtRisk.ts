// data/useStreakAtRisk.ts — detect if the user's streak is about to expire
// Returns: isAtRisk (boolean), expiresInHours (number), shieldCount (number)
//
// A streak is "at risk" when:
// - The last completed date was yesterday (expires in ~12h from now)
// - No lesson completed today yet
// - User has a streak >= 3 (it matters enough to warn)

import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

export interface StreakAtRiskState {
  isAtRisk: boolean;
  expiresInHours: number;
  streakDays: number;
  shieldCount: number;
}

export function useStreakAtRisk(userId?: string) {
  return useQuery<StreakAtRiskState>({
    queryKey: ["streak-at-risk", userId],
    queryFn: async () => {
      if (!userId) return { isAtRisk: false, expiresInHours: 0, streakDays: 0, shieldCount: 0 };

      // Get the user's profile for current streak + shields
      const { data: profile } = await supabase
        .from("profiles")
        .select("streak, shield_count")
        .eq("id", userId)
        .single();

      const streakDays = profile?.streak ?? 0;
      const shieldCount = profile?.shield_count ?? 0;

      // Nothing to worry about if streak < 3
      if (streakDays < 3) {
        return { isAtRisk: false, expiresInHours: 0, streakDays, shieldCount };
      }

      // Check today's streak log
      const today = new Date().toISOString().split("T")[0] as string;
      const { data: todayLog } = await supabase
        .from("streak_log")
        .select("date")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

      // Already completed today — streak is safe
      if (todayLog) {
        return { isAtRisk: false, expiresInHours: 0, streakDays, shieldCount };
      }

      // Check if yesterday was completed (if not, streak is already broken)
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0] as string;
      const { data: yesterdayLog } = await supabase
        .from("streak_log")
        .select("date")
        .eq("user_id", userId)
        .eq("date", yesterday)
        .single();

      if (!yesterdayLog) {
        return { isAtRisk: false, expiresInHours: 0, streakDays, shieldCount };
      }

      // Streak is at risk — expires at 00:00:00 the next calendar day
      const now = new Date();
      const midnight = new Date(now);
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);
      const expiresInHours = Math.max(
        1,
        Math.round((midnight.getTime() - now.getTime()) / 3600000),
      );

      return { isAtRisk: true, expiresInHours, streakDays, shieldCount };
    },
    enabled: !!userId,
    refetchInterval: 15 * 60 * 1000, // recheck every 15 min
    staleTime: 5 * 60 * 1000,
  });
}
