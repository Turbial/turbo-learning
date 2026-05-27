// supabase/edge-functions/send-reminder.ts — Deno cron edge function.
// Sends each user their daily learning reminder at their chosen time slot.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async () => {
  const slot = hourToSlot(new Date().getUTCHours()); // adjust for user TZ in production
  const { data: users } = await admin.from('profiles').select('id, learn_time').eq('learn_time', slot);
  for (const u of users ?? []) {
    const { data: toks } = await admin.from('push_tokens').select('token').eq('user_id', u.id);
    for (const t of toks ?? []) await dispatch(t.token, 'Time to learn', 'Your lesson is waiting — keep your streak alive.');
  }
  return new Response('ok');
});
function hourToSlot(h: number) { return h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening'; }
async function dispatch(to: string, title: string, body: string) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, title, body, sound: 'default' }),
  });
}
