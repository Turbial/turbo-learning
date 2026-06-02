/**
 * @turbial/payments/deno — Stripe Webhook Edge Function
 * Drop-in Supabase Edge Function for Stripe webhook processing.
 *
 * Deploy to: supabase/functions/stripe-webhook/index.ts
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY — your Stripe secret key
 *   STRIPE_WEBHOOK_SECRET — webhook signing secret from Stripe Dashboard
 *   SUPABASE_URL — your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service_role key for admin operations
 *
 * Handles:
 *   - checkout.session.completed → upserts subscription + logs order
 *   - customer.subscription.updated → syncs subscription status
 *   - customer.subscription.deleted → marks subscription canceled
 *   - invoice.paid → logs payment in payment_history
 *   - invoice.payment_failed → logs failure + marks past_due
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
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

// ── Main Handler ────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const body = await req.text();

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Webhook signature verification failed: ${err}`, {
      status: 400,
    });
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  console.log(`Processing Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event, admin);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event, admin);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event, admin);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event, admin);
        break;
      case 'invoice.payment_failed':
        await handleInvoiceFailed(event, admin);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true, type: event.type }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);
    const message = String(err);
    const status = message.includes('Missing user_id') ? 400 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ── Event Handlers ──────────────────────────────────────────

async function handleCheckoutCompleted(
  event: Stripe.Event,
  admin: ReturnType<typeof createClient>,
) {
  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata || {};

  const userId = session.client_reference_id || meta.user_id;
  const planId = meta.plan_id || meta.plan_slug;
  const productIds = meta.product_ids?.split(',').map((s: string) => s.trim()).filter(Boolean) || [planId];

  if (!userId) {
    console.error('checkout.session.completed: no user_id');
    throw new Error('Missing user_id — client_reference_id and metadata.user_id are both null/undefined');
  }

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id;

  // Fetch subscription details if available
  let currentPeriodEnd: string | null = null;
  let subStatus = 'active';

  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      currentPeriodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;
      subStatus = subscription.status;
    } catch (err) {
      console.error('Failed to retrieve subscription:', err);
    }
  }

  // Determine tier
  const tier = planId && planId !== 'free' ? 'premium' : 'free';

  // Upsert subscription
  const { error: subError } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      tier,
      status: subStatus,
      plan_id: planId || null,
      plan_slug: planId || null,
      stripe_customer_id: customerId || null,
      stripe_subscription_id: subscriptionId || null,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (subError) {
    console.error('Failed to upsert subscription:', subError);
  } else {
    console.log(
      `Subscription upserted: user=${userId}, tier=${tier}, status=${subStatus}`,
    );
  }

  // Log order for each product
  for (const pid of productIds) {
    const { error: orderError } = await admin.from('orders').insert({
      user_id: userId,
      product_id: pid || 'unknown',
      customer_email: session.customer_details?.email || 'unknown',
      customer_name: session.customer_details?.name || 'Unknown',
      amount_cents: session.amount_total || 0,
      currency: session.currency || 'usd',
      stripe_session_id: session.id,
      stripe_customer_id: customerId,
      status: 'paid',
      is_test: meta.test_mode === 'true',
      metadata: meta,
      created_at: new Date().toISOString(),
    });

    if (orderError) {
      console.error(`Failed to log order for ${pid}:`, orderError);
    }
  }
}

async function handleSubscriptionUpdated(
  event: Stripe.Event,
  admin: ReturnType<typeof createClient>,
) {
  const subscription = event.data.object as Stripe.Subscription;
  const meta = subscription.metadata || {};

  const userId = meta.user_id;
  if (!userId) {
    console.error('subscription.updated: no user_id in metadata');
    throw new Error('Missing user_id in subscription metadata');
  }

  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const tier = isActive ? 'premium' : 'free';

  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      tier,
      status: subscription.status,
      plan_id: meta.plan_id || meta.plan_slug || null,
      plan_slug: meta.plan_id || meta.plan_slug || null,
      stripe_customer_id: customerId || null,
      stripe_subscription_id: subscription.id,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.error('Failed to update subscription:', error);
  } else {
    console.log(
      `Subscription updated: user=${userId}, status=${subscription.status}`,
    );
  }
}

async function handleSubscriptionDeleted(
  event: Stripe.Event,
  admin: ReturnType<typeof createClient>,
) {
  const subscription = event.data.object as Stripe.Subscription;
  const meta = subscription.metadata || {};

  const userId = meta.user_id;
  if (!userId) {
    throw new Error('Missing user_id in subscription metadata');
  }

  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      tier: 'free',
      status: 'canceled',
      plan_id: meta.plan_id || null,
      plan_slug: meta.plan_id || null,
      stripe_customer_id:
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer?.id || null,
      stripe_subscription_id: subscription.id,
      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.error('Failed to cancel subscription:', error);
  } else {
    console.log(`Subscription canceled: user=${userId}`);
  }
}

async function handleInvoicePaid(
  event: Stripe.Event,
  admin: ReturnType<typeof createClient>,
) {
  const invoice = event.data.object as Stripe.Invoice;
  const meta = invoice.metadata || invoice.subscription_details?.metadata || {};

  const userId = meta.user_id || invoice.subscription_details?.metadata?.user_id;

  const { error } = await admin.from('payment_history').insert({
    user_id: userId || null,
    amount_cents: invoice.amount_paid,
    currency: invoice.currency || 'usd',
    status: 'paid',
    stripe_payment_intent:
      typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : invoice.payment_intent?.id || null,
    stripe_invoice_id: invoice.id,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to log payment:', error);
  } else {
    console.log(`Payment logged: ${invoice.amount_paid} ${invoice.currency} for user ${userId}`);
  }
}

async function handleInvoiceFailed(
  event: Stripe.Event,
  admin: ReturnType<typeof createClient>,
) {
  const invoice = event.data.object as Stripe.Invoice;
  const meta = invoice.metadata || invoice.subscription_details?.metadata || {};

  const userId = meta.user_id || invoice.subscription_details?.metadata?.user_id;

  // Log failed payment
  const { error } = await admin.from('payment_history').insert({
    user_id: userId || null,
    amount_cents: invoice.amount_due,
    currency: invoice.currency || 'usd',
    status: 'failed',
    stripe_payment_intent:
      typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : invoice.payment_intent?.id || null,
    stripe_invoice_id: invoice.id,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to log payment failure:', error);
  }

  // Mark subscription past_due
  if (userId) {
    await admin.from('subscriptions').upsert(
      {
        user_id: userId,
        status: 'past_due',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id', ignoreDuplicates: false },
    );
  }

  console.log(
    `Payment failed for user ${userId}: ${invoice.amount_due} ${invoice.currency}`,
  );
}
