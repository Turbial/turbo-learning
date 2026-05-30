// supabase/edge-functions/paypal-webhook.ts — Deno edge function.
// Handles PayPal webhook events and syncs subscription state to Supabase.
// Events: BILLING.SUBSCRIPTION.ACTIVATED, BILLING.SUBSCRIPTION.CANCELLED,
//          BILLING.SUBSCRIPTION.EXPIRED, BILLING.SUBSCRIPTION.PAYMENT.FAILED,
//          PAYMENT.SALE.COMPLETED.
// Env: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID,
//      SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYPAL_API = "https://api-m.paypal.com";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET")!;
const PAYPAL_WEBHOOK_ID = Deno.env.get("PAYPAL_WEBHOOK_ID")!;

// ─── PayPal OAuth ───

async function getPayPalAccessToken(): Promise<string> {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
}

// ─── Verify webhook signature ───

async function verifyWebhookSignature(
  token: string,
  body: string,
  headers: Headers
): Promise<boolean> {
  const verification = {
    auth_algo: headers.get("paypal-auth-algo") || "",
    cert_url: headers.get("paypal-cert-url") || "",
    transmission_id: headers.get("paypal-transmission-id") || "",
    transmission_sig: headers.get("paypal-transmission-sig") || "",
    transmission_time: headers.get("paypal-transmission-time") || "",
    webhook_id: PAYPAL_WEBHOOK_ID,
    webhook_event: JSON.parse(body),
  };

  const res = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(verification),
  });

  const result = await res.json();
  return result.verification_status === "SUCCESS";
}

// ─── Main handler ───

Deno.serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    // Verify webhook signature
    const ppToken = await getPayPalAccessToken();
    const verified = await verifyWebhookSignature(ppToken, body, req.headers);

    if (!verified) {
      console.error("PayPal webhook verification failed");
      return new Response("Verification failed", { status: 403 });
    }

    const event = JSON.parse(body);
    const eventType = event.event_type;
    const resource = event.resource;
    console.log(`PayPal webhook: ${eventType}`);

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const sub = resource;
        const userId = sub.custom_id;
        if (!userId) throw new Error("Missing custom_id (user_id)");

        await admin.from("subscriptions").upsert({
          user_id: userId,
          tier: "premium",
          status: "active",
          plan_slug: sub.plan_id?.includes("pro") ? "pro" : "premium",
          paypal_subscription_id: sub.id,
          current_period_end: sub.billing_info?.next_billing_time || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

        console.log(`Subscription activated for user ${userId}`);
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const sub = resource;
        const userId = sub.custom_id;
        if (!userId) throw new Error("Missing custom_id (user_id)");

        await admin.from("subscriptions").upsert({
          user_id: userId,
          tier: "free",
          status: eventType.includes("CANCELLED") ? "canceled" : "expired",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

        console.log(`Subscription ${eventType} for user ${userId}`);
        break;
      }

      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
        const sub = resource;
        const userId = sub.custom_id;
        if (!userId) throw new Error("Missing custom_id (user_id)");

        await admin.from("subscriptions").upsert({
          user_id: userId,
          status: "past_due",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

        console.log(`Payment failed for user ${userId}`);
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        const sale = resource;
        const billingAgreementId = sale.billing_agreement_id;
        // Find user by subscription
        if (billingAgreementId) {
          await admin.from("payment_history").insert({
            user_id: null, // We'll backfill from subscription
            amount_cents: Math.round(parseFloat(sale.amount?.value || "0") * 100),
            currency: sale.amount?.currency_code || "USD",
            status: "paid",
            paypal_transaction_id: sale.id,
            created_at: new Date().toISOString(),
          });
        }
        console.log(`Payment completed: ${sale.id}`);
        break;
      }

      default:
        console.log(`Unhandled PayPal event: ${eventType}`);
    }

    return new Response(JSON.stringify({ received: true, type: eventType }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("paypal-webhook error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
