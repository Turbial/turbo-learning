// data/useNotifications.ts — push token registration + preferences.
import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { registerForPush } from '../integrations/push';

export function useNotifications(userId?: string, learnTime?: string) {
  const [token, setToken] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);

  const register = useCallback(async () => {
    if (!userId) return;
    const t = await registerForPush();
    if (!t) { setEnabled(false); return; }
    setToken(t);
    await supabase.from('push_tokens').upsert({ user_id: userId, token: t }, { onConflict: 'user_id,token' });
  }, [userId]);

  useEffect(() => { if (enabled) register(); }, [register, enabled]);
  return { token, enabled, setEnabled, register };
}
