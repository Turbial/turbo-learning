// supabase/edge-functions/stripe-webhook.ts — Deno edge function.
// Handles Stripe webhook events and syncs subscription state to Supabase.
// Events: checkout.session.completed, customer.subscription.updated,
//          customer.subscription.deleted, invoice.paid, invoice.payment_failed.
// Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

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
    return new Response(`Webhook signature verification failed: ${err}`, { status: 400 });
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  console.log(`Processing Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event, admin);
        break;
      }
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event, admin);
        break;
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event, admin);
        break;
      }
      case 'invoice.paid': {
        await handleInvoicePaid(event, admin);
        break;
      }
      case 'invoice.payment_failed': {
        await handleInvoiceFailed(event, admin);
        break;
      }
      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return new Response(JSON.stringify({ received: true, type: event.type }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);
    // Return 400 for data integrity failures (e.g. missing user_id) so Stripe retries.
    // Return 500 for unexpected errors.
    const message = String(err);
    const status = message.includes('Missing user_id') ? 400 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ─── Event Handlers ───

async function handleCheckoutCompleted(event: Stripe.Event, admin: ReturnType<typeof createClient>) {
  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.client_reference_id || session.metadata?.user_id;
  const planId = session.metadata?.plan_id;

  if (!userId) {
    console.error('checkout.session.completed: no user_id in session');
    throw new Error('Missing user_id — client_reference_id and metadata.user_id are both null/undefined');
  }

  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;

  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id;

  // If we have a subscription ID, fetch its details for the period end
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

  // Determine tier from plan_id; default to 'premium' for paid plans
  const tier = planId && planId !== 'free' ? 'premium' : (planId || 'free');

  const { error } = await admin.from('subscriptions').upsert({
    user_id: userId,
    tier,
    status: subStatus,
    plan_id: planId || null,
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscriptionId || null,
    current_period_end: currentPeriodEnd,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) {
    console.error('Failed to upsert subscription:', error);
  } else {
    console.log(`Subscription upserted for user ${userId}: tier=${tier}, status=${subStatus}`);
  }
}

async function handleSubscriptionUpdated(event: Stripe.Event, admin: ReturnType<typeof createClient>) {
  const subscription = event.data.object as Stripe.Subscription;

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.error('subscription.updated: no user_id in metadata');
    throw new Error('Missing user_id in subscription metadata');
  }

  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const tier = isActive ? 'premium' : 'free';

  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;

  const planId = subscription.metadata?.plan_id || null;

  const { error } = await admin.from('subscriptions').upsert({
    user_id: userId,
    tier,
    status: subscription.status,
    plan_id: planId,
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscription.id,
    current_period_end: currentPeriodEnd,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) {
    console.error('Failed to update subscription:', error);
  } else {
    console.log(`Subscription updated for user ${userId}: status=${subscription.status}`);
  }
}

async function handleSubscriptionDeleted(event: Stripe.Event, admin: ReturnType<typeof createClient>) {
  const subscription = event.data.object as Stripe.Subscription;

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.error('subscription.deleted: no user_id in metadata');
    throw new Error('Missing user_id in subscription metadata');
  }

  const { error } = await admin.from('subscriptions').upsert({
    user_id: userId,
    tier: 'free',
    status: 'canceled',
    plan_id: subscription.metadata?.plan_id || null,
    stripe_customer_id: typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id || null,
    stripe_subscription_id: subscription.id,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) {
    console.error('Failed to cancel subscription:', error);
  } else {
    console.log(`Subscription canceled for user ${userId}`);
  }
}

async function handleInvoicePaid(event: Stripe.Event, admin: ReturnType<typeof createClient>) {
  const invoice = event.data.object as Stripe.Invoice;

  const userId = invoice.metadata?.user_id || invoice.subscription_details?.metadata?.user_id;
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id;

  // Log payment in payment_history
  const { error } = await admin.from('payment_history').insert({
    user_id: userId || null,
    amount_cents: invoice.amount_paid,
    currency: invoice.currency || 'usd',
    status: 'paid',
    stripe_payment_intent: typeof invoice.payment_intent === 'string'
      ? invoice.payment_intent
      : invoice.payment_intent?.id || null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to log payment:', error);
  } else {
    console.log(`Payment logged: ${invoice.amount_paid} ${invoice.currency} for user ${userId}`);
  }
}

async function handleInvoiceFailed(event: Stripe.Event, admin: ReturnType<typeof createClient>) {
  const invoice = event.data.object as Stripe.Invoice;

  const userId = invoice.metadata?.user_id || invoice.subscription_details?.metadata?.user_id;

  // Log failed payment
  const { error } = await admin.from('payment_history').insert({
    user_id: userId || null,
    amount_cents: invoice.amount_due,
    currency: invoice.currency || 'usd',
    status: 'failed',
    stripe_payment_intent: typeof invoice.payment_intent === 'string'
      ? invoice.payment_intent
      : invoice.payment_intent?.id || null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to log payment failure:', error);
  }

  // If subscription exists and is past due, update status
  if (userId) {
    await admin.from('subscriptions').upsert({
      user_id: userId,
      status: 'past_due',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id', ignoreDuplicates: false });
  }

  console.log(`Payment failed for user ${userId}: ${invoice.amount_due} ${invoice.currency}`);
}
