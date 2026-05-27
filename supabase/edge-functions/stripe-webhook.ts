// supabase/edge-functions/stripe-webhook.ts — Deno edge function.
// Handles checkout.session.completed + subscription updated/deleted → updates `subscriptions`.
// Configure: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY.
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, Deno.env.get('STRIPE_WEBHOOK_SECRET')!);
  } catch (e) { return new Response(`bad sig: ${e}`, { status: 400 }); }

  const upsert = (userId: string, tier: string, status: string, end: number | null) =>
    admin.from('subscriptions').upsert({
      user_id: userId, tier, status,
      current_period_end: end ? new Date(end * 1000).toISOString() : null,
    }, { onConflict: 'user_id' });

  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session;
      await upsert(s.client_reference_id!, 'premium', 'active', null); break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const active = sub.status === 'active' || sub.status === 'trialing';
      await upsert(sub.metadata.user_id, active ? 'premium' : 'free', sub.status, sub.current_period_end); break;
    }
  }
  return new Response('ok');
});
