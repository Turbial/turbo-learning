/**
 * create-portal-session — Opens a Stripe Customer Portal session for billing management.
 *
 * Lets subscribers update payment methods, download invoices, and self-cancel.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Client POSTs { return_url?: string }
 * Returns { url: string }
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

    // ── Look up Stripe customer ID ──
    const { data: sub, error: subErr } = await admin
      .from('subscriptions')
      .select('stripe_customer_id, status')
      .eq('user_id', user.id)
      .single();

    if (subErr || !sub?.stripe_customer_id) {
      return json({ error: 'No Stripe customer found. Subscribe first.' }, 404);
    }

    // ── Determine return URL ──
    let body: { return_url?: string } = {};
    try { body = await req.json(); } catch (_) {}

    const origin    = req.headers.get('origin') || 'http://localhost:8081';
    const returnUrl = body.return_url || `${origin}/profile`;

    // ── Create portal session ──
    const session = await stripe.billingPortal.sessions.create({
      customer:   sub.stripe_customer_id,
      return_url: returnUrl,
    });

    return json({ url: session.url });
  } catch (err) {
    console.error('create-portal-session error:', err);
    return json({ error: err instanceof Error ? err.message : 'Internal server error' }, 500);
  }
});
