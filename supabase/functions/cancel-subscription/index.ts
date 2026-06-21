/**
 * cancel-subscription — Cancels the authenticated user's active Stripe subscription.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Client POSTs {} (no body needed — user identity comes from JWT)
 * Returns { canceled: true, ends_at: string }
 */

import Stripe from 'https://esm.sh/stripe@17?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl        = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, apikey, x-client-info',
  };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });

  try {
    const admin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    // ── Auth ──
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return json({ error: 'Missing Authorization header' }, 401);

    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

    // ── Look up subscription ──
    const { data: sub, error: subErr } = await admin
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', user.id)
      .single();

    if (subErr || !sub) return json({ error: 'No subscription found' }, 404);
    if (sub.status === 'canceled') return json({ error: 'Subscription already canceled' }, 400);
    if (!sub.stripe_subscription_id) return json({ error: 'No Stripe subscription ID on record' }, 400);

    // ── Cancel at period end (graceful) ──
    const canceled = await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    const endsAt = canceled.current_period_end
      ? new Date(canceled.current_period_end * 1000).toISOString()
      : null;

    // ── Sync to DB ──
    await admin
      .from('subscriptions')
      .update({ status: 'canceling', updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    return json({ canceled: true, ends_at: endsAt });
  } catch (err) {
    console.error('cancel-subscription error:', err);
    return json({ error: err instanceof Error ? err.message : 'Internal server error' }, 500);
  }
});
