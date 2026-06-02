/**
 * @turbial/payments/deno — Create Checkout Edge Function
 * Drop-in Supabase Edge Function for Stripe Checkout sessions.
 *
 * Deploy to: supabase/functions/create-checkout/index.ts
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY — your Stripe secret key
 *   SUPABASE_URL — your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service_role key for admin operations
 *
 * Client POSTs { plan_id: string, test_mode?: boolean }
 * Returns { url: string }
 */

import Stripe from 'https://esm.sh/stripe@17?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Configuration ───────────────────────────────────────────

const STRIPE_API_VERSION = '2024-06-20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: STRIPE_API_VERSION,
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ── Plan Definitions ────────────────────────────────────────
// Customize these for your product! These define what's for sale.
// You can also load them from a Supabase `plans` table (see below).

interface PlanDefinition {
  slug: string;
  name: string;
  /** One-time price in cents. Omit for subscription-only plans. */
  price_cents?: number;
  /** Stripe Price ID from the Dashboard (preferred for subscriptions) */
  stripe_price_id?: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_annual?: string;
  /** 'month' | 'year' for subscriptions; omit for one-time */
  interval?: 'month' | 'year';
}

// ── Plan Loader ─────────────────────────────────────────────
// Option A: Load plans from Supabase `plans` table
// Option B: Hard-code plan definitions below

async function getPlans(
  admin: ReturnType<typeof createClient>,
): Promise<PlanDefinition[]> {
  // Option A: Load from database (recommended — single source of truth)
  const { data, error } = await admin
    .from('plans')
    .select('slug, name, price_cents, stripe_price_id, stripe_price_id_monthly, stripe_price_id_annual, interval');

  if (!error && data?.length) {
    return data as PlanDefinition[];
  }

  // Option B: Fallback hard-coded plans — customize these!
  // Remove this if you always load from DB.
  console.warn('No plans table found. Using hard-coded fallback plans.');
  return [
    {
      slug: 'premium_monthly',
      name: 'Premium Monthly',
      price_cents: 999,
      interval: 'month',
    },
    {
      slug: 'premium_annual',
      name: 'Premium Annual',
      price_cents: 9990,
      interval: 'year',
    },
  ];
}

// ── CORS Helper ─────────────────────────────────────────────

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, apikey, x-client-info',
  };
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

// ── Main Handler ────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const body = await req.json();
    const { plan_id, test_mode } = body;

    if (!plan_id) {
      return json({ error: 'plan_id is required' }, 400);
    }

    // Authenticate via Supabase auth (optional: remove if checkout is public)
    const authHeader = req.headers.get('Authorization');
    let userId: string | undefined;

    if (authHeader) {
      const admin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });
      const token = authHeader.replace('Bearer ', '');
      const { data: authData, error: authError } = await admin.auth.getUser(token);

      if (authError || !authData?.user) {
        return json({ error: 'Invalid or expired token' }, 401);
      }

      userId = authData.user.id;
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Look up plan
    const plans = await getPlans(admin);
    const plan = plans.find((p) => p.slug === plan_id);

    if (!plan) {
      return json({ error: `Plan not found: ${plan_id}` }, 404);
    }

    if (plan.slug === 'free') {
      return json({ error: 'Cannot purchase the free plan' }, 400);
    }

    // Build line items
    const lineItems: Array<Record<string, unknown>> = [];
    const stripePriceId = plan.stripe_price_id || plan.stripe_price_id_monthly;

    if (stripePriceId && !test_mode) {
      // Use pre-configured Stripe Price ID (handles recurring logic correctly)
      lineItems.push({ price: stripePriceId, quantity: 1 });
    } else {
      // Build ad-hoc price
      const unitAmount = test_mode ? 100 : (plan.price_cents || 999);
      const priceData: Record<string, unknown> = {
        currency: 'usd',
        product_data: {
          name: test_mode ? `${plan.name} [TEST — $1]` : plan.name,
        },
        unit_amount: unitAmount,
      };

      if (plan.interval === 'month') {
        (priceData as any).recurring = { interval: 'month' };
      } else if (plan.interval === 'year') {
        (priceData as any).recurring = { interval: 'year' };
      }

      lineItems.push({ price_data: priceData, quantity: 1 });
    }

    // Determine mode
    const mode = plan.interval ? 'subscription' : 'payment';

    // Origin for success/cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:8081';

    // Create session
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems as any,
      client_reference_id: userId || undefined,
      metadata: {
        user_id: userId || '',
        plan_id: plan.slug,
        plan_slug: plan.slug,
        test_mode: test_mode ? 'true' : 'false',
      },
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
    });

    return json({ url: session.url, sessionId: session.id }, 200);
  } catch (err) {
    console.error('create-checkout error:', err);
    return json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      500,
    );
  }
});
