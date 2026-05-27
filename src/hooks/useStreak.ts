// useStreak — Streak + shield logic:
// - Check if consecutive day
// - Consume shield on miss
// - Earn shield every 7 days
import { useCallback, useMemo } from "react";

type CDate = { year: number; month: number; day: number };

function toDateParts(date: Date): CDate {
  return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
}

function isYesterday(a: Date, b: Date): boolean {
  const aParts = toDateParts(a);
  const bParts = toDateParts(b);
  const aDate = new Date(aParts.year, aParts.month, aParts.day);
  const bDate = new Date(bParts.year, bParts.month, bParts.day);
  const diffMs = bDate.getTime() - aDate.getTime();
  return diffMs === 86400000; // exactly one day
}

function isToday(date: Date): boolean {
  const now = toDateParts(new Date());
  const d = toDateParts(date);
  return now.year === d.year && now.month === d.month && now.day === d.day;
}

interface StreakState {
  streak: number;
  shieldCount: number;
  lastCompletedDate: string | null; // ISO date string
  longestStreak: number;
}

interface UseStreakReturn {
  /** Check if the streak is still active (completed yesterday or today) */
  isStreakActive: (state: StreakState) => boolean;
  /** Compute new streak state after completing a day */
  completeDay: (current: StreakState) => StreakState;
  /** Check if a shield is available to consume */
  hasShield: (state: StreakState) => boolean;
  /** Days until next shield reward */
  daysUntilNextShield: (state: StreakState) => number;
}

export function useStreak(): UseStreakReturn {
  const isStreakActive = useCallback((state: StreakState): boolean => {
    if (state.streak === 0) return false;
    if (!state.lastCompletedDate) return true; // first time
    const lastDate = new Date(state.lastCompletedDate);
    return isToday(lastDate) || isYesterday(lastDate, new Date());
  }, []);

  const completeDay = useCallback((current: StreakState): StreakState => {
    const now = new Date();
    const nowISO = now.toISOString();

    // Check if already completed today
    if (current.lastCompletedDate) {
      const lastDate = new Date(current.lastCompletedDate);
      if (isToday(lastDate)) {
        return current; // Already completed today, no change
      }
    }

    // Determine if streak continues
    let newStreak = current.streak;
    let newShields = current.shieldCount;

    if (current.lastCompletedDate) {
      const lastDate = new Date(current.lastCompletedDate);
      if (isYesterday(lastDate, now)) {
        // Consecutive day — increment streak
        newStreak = current.streak + 1;
      } else {
        // Streak broken — check for shields
        if (current.shieldCount > 0) {
          // Consume a shield to preserve streak
          newShields = current.shieldCount - 1;
          newStreak = current.streak + 1;
        } else {
          // Streak reset
          newStreak = 1;
        }
      }
    } else {
      // First day ever
      newStreak = 1;
    }

    // Earn a shield every 7 days of streak
    if (newStreak > 0 && newStreak % 7 === 0) {
      newShields += 1;
    }

    const newLongest = Math.max(current.longestStreak, newStreak);

    return {
      streak: newStreak,
      shieldCount: newShields,
      lastCompletedDate: nowISO,
      longestStreak: newLongest,
    };
  }, []);

  const hasShield = useCallback((state: StreakState): boolean => {
    return state.shieldCount > 0;
  }, []);

  const daysUntilNextShield = useCallback((state: StreakState): number => {
    const remainder = state.streak % 7;
    if (remainder === 0) return 7; // Just earned one
    return 7 - remainder;
  }, []);

  return useMemo(() => ({
    isStreakActive,
    completeDay,
    hasShield,
    daysUntilNextShield,
  }), [isStreakActive, completeDay, hasShield, daysUntilNextShield]);
}
