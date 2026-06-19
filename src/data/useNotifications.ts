// data/useNotifications.ts — push token registration + preferences.
import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { registerForPush, scheduleStreakReminder } from '../integrations/push';

const LEARN_TIME_TO_HOUR: Record<string, number> = {
  Morning: 8,
  Afternoon: 13,
  Evening: 18,
  Night: 21,
};

export function useNotifications(userId?: string, learnTime?: string) {
  const [token, setToken] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);

  const register = useCallback(async () => {
    if (!userId) return;
    const t = await registerForPush();
    if (!t) { setEnabled(false); return; }
    setToken(t);
    await supabase.from('profiles').update({ push_token: t }).eq('id', userId);
  }, [userId]);

  useEffect(() => { if (enabled) register(); }, [register, enabled]);

  const scheduleReminder = useCallback(async (timeSlot: string) => {
    const hour = LEARN_TIME_TO_HOUR[timeSlot] ?? 8;
    await scheduleStreakReminder(hour);
  }, []);

  // Auto-schedule based on learnTime from profile
  useEffect(() => {
    if (enabled && learnTime) {
      const hour = LEARN_TIME_TO_HOUR[learnTime] ?? 8;
      scheduleStreakReminder(hour).catch(() => {});
    }
  }, [enabled, learnTime]);

  return { token, enabled, setEnabled, register, scheduleReminder };
}
