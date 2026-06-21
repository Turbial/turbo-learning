/**
 * delete-account — Hard-deletes the authenticated user's account and all their data.
 *
 * Required env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   STRIPE_SECRET_KEY  (optional — cancels any active subscription before deletion)
 *
 * Client POSTs {} — user identity comes from JWT
 * Returns { deleted: true }
 *
 * Deletion order respects FK constraints:
 *   review_queue → lesson_progress → shield_purchases → subscriptions → profiles → auth.users
 */

import Stripe from 'https://esm.sh/stripe@17?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl        = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const stripeKey          = Deno.env.get('STRIPE_SECRET_KEY');

const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: '2024-06-20', httpClient: Stripe.createFetchHttpClient() })
  : null;

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

    const uid = user.id;

    // ── Cancel active Stripe subscription if present ──
    if (stripe) {
      const { data: sub } = await admin
        .from('subscriptions')
        .select('stripe_subscription_id, status')
        .eq('user_id', uid)
        .single();

      if (sub?.stripe_subscription_id && sub.status === 'active') {
        try {
          await stripe.subscriptions.cancel(sub.stripe_subscription_id);
        } catch (e) {
          console.warn('Could not cancel Stripe subscription during delete-account:', e);
        }
      }
    }

    // ── Delete user data (order matters for FK constraints) ──
    const tables = [
      'review_queue',
      'lesson_progress',
      'user_badges',
      'shield_purchases',
      'payment_history',
      'subscriptions',
      'enrollments',
    ];

    for (const table of tables) {
      const { error } = await admin.from(table).delete().eq('user_id', uid);
      if (error) {
        // Non-fatal: table may not exist or row may already be gone
        console.warn(`delete-account: could not delete from ${table}:`, error.message);
      }
    }

    // profiles has ON DELETE CASCADE from auth.users, but delete explicitly for safety
    await admin.from('profiles').delete().eq('id', uid);

    // ── Delete the auth user (hard delete) ──
    const { error: deleteErr } = await admin.auth.admin.deleteUser(uid);
    if (deleteErr) {
      console.error('delete-account: auth.admin.deleteUser failed:', deleteErr);
      return json({ error: 'Failed to delete auth user: ' + deleteErr.message }, 500);
    }

    return json({ deleted: true });
  } catch (err) {
    console.error('delete-account error:', err);
    return json({ error: err instanceof Error ? err.message : 'Internal server error' }, 500);
  }
});
