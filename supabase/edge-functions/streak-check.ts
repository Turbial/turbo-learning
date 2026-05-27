// supabase/edge-functions/streak-check.ts — Deno cron (late evening).
// Finds users who haven't completed a lesson today and nudges them before the streak resets.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async () => {
  const today = new Date().toISOString().slice(0, 10);
  const { data: atRisk } = await admin.rpc('users_without_completion_today', { p_date: today });
  for (const u of atRisk ?? []) {
    const { data: toks } = await admin.from('push_tokens').select('token').eq('user_id', u.user_id);
    for (const t of toks ?? []) await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: t.token, title: 'Your streak is at risk 🔥', body: 'A 2-minute lesson keeps it alive.' }),
    });
  }
  return new Response('ok');
});
