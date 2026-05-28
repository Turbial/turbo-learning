// supabase/edge-functions/create-checkout.ts — Deno edge function.
// Creates a Stripe Checkout Session for the authenticated user.
// Client POSTs { plan_id } → returns { url }.
// Env: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  }

  try {
    // Parse request body
    const body = await req.json();
    const { plan_id } = body;

    if (!plan_id) {
      return json({ error: 'plan_id is required' }, 400);
    }

    // Authenticate user via Supabase auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401);
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await admin.auth.getUser(token);

    if (authError || !authData?.user) {
      return json({ error: 'Invalid or expired token' }, 401);
    }

    const userId = authData.user.id;

    // Look up plan in the plans table
    const { data: plan, error: planError } = await admin
      .from('plans')
      .select('id, name, price_cents, interval, stripe_price_id')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return json({ error: `Plan not found: ${plan_id}` }, 404);
    }

    if (plan.id === 'free') {
      return json({ error: 'Cannot purchase the free plan' }, 400);
    }

    // Build line_items — prefer stripe_price_id if configured
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (plan.stripe_price_id) {
      lineItems.push({
        price: plan.stripe_price_id,
        quantity: 1,
      });
    } else {
      // Fallback: build a one-time or recurring price from plan metadata
      const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
        currency: 'usd',
        product_data: { name: plan.name },
        unit_amount: plan.price_cents,
      };

      if (plan.interval === 'month') {
        priceData.recurring = { interval: 'month' };
      } else if (plan.interval === 'year') {
        priceData.recurring = { interval: 'year' };
      }

      lineItems.push({ price_data: priceData, quantity: 1 });
    }

    // Determine the success/cancel URLs
    const origin = req.headers.get('origin') || 'https://turbo-learning.app';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: plan.interval ? 'subscription' : 'payment',
      line_items: lineItems,
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        plan_id: plan.id,
      },
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      ...(plan.interval ? {} : {}), // subscription mode handles recurring automatically
    });

    return json({ url: session.url }, 200);
  } catch (err) {
    console.error('create-checkout error:', err);
    return json({ error: err instanceof Error ? err.message : 'Internal server error' }, 500);
  }
});

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
