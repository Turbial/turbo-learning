// supabase/edge-functions/paypal-checkout.ts — Deno edge function.
// Creates a PayPal subscription checkout for the authenticated user.
// Client POSTs { plan_slug } → returns { url } (PayPal approval URL).
// Env: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
//
// PayPal REST API flow:
//   1. Get OAuth token from PayPal
//   2. Look up plan in Supabase
//   3. Create a PayPal subscription
//   4. Return approval URL to client

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYPAL_API = "https://api-m.paypal.com"; // live
// const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // sandbox

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET")!;

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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ─── PayPal Product/Plan lookup or creation ───

async function getOrCreatePayPalProduct(
  token: string,
  planSlug: string
): Promise<string> {
  // List products to find ours
  const listRes = await fetch(`${PAYPAL_API}/v1/catalogs/products?page_size=20`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const products = await listRes.json();

  const existing = products.products?.find(
    (p: any) => p.id === `turbo-learning-${planSlug}`
  );
  if (existing) return existing.id;

  // Create product
  const createRes = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `create-prod-${planSlug}-${Date.now()}`,
    },
    body: JSON.stringify({
      id: `turbo-learning-${planSlug}`,
      name: `Turbo Learning ${planSlug === "pro" ? "Pro" : "Premium"}`,
      type: "SERVICE",
      description: "Unlock all programs and features on Turbo Learning",
      category: "SOFTWARE",
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`PayPal product creation failed: ${err}`);
  }

  const prod = await createRes.json();
  return prod.id;
}

async function getOrCreatePayPalPlan(
  token: string,
  productId: string,
  planSlug: string,
  priceCents: number
): Promise<string> {
  const planId = `turbo-learning-${planSlug}-monthly`;

  // Check if plan exists
  const showRes = await fetch(`${PAYPAL_API}/v1/billing/plans/${planId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (showRes.ok) {
    const plan = await showRes.json();
    if (plan.status === "ACTIVE") return plan.id;
  }

  // Create billing plan
  const createRes = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `create-plan-${planSlug}-${Date.now()}`,
    },
    body: JSON.stringify({
      product_id: productId,
      name: `Turbo Learning ${planSlug === "pro" ? "Pro" : "Premium"} Monthly`,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // infinite
          pricing_scheme: {
            fixed_price: {
              value: (priceCents / 100).toFixed(2),
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CANCEL",
        payment_failure_threshold: 3,
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`PayPal plan creation failed: ${err}`);
  }

  const plan = await createRes.json();
  return plan.id;
}

// ─── Main handler ───

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  try {
    const body = await req.json();
    const { plan_slug } = body;

    if (!plan_slug) {
      return json({ error: "plan_slug is required" }, 400);
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await admin.auth.getUser(token);

    if (authError || !authData?.user) {
      return json({ error: "Invalid or expired token" }, 401);
    }

    const userId = authData.user.id;

    // Look up plan in Supabase
    const { data: plan, error: planError } = await admin
      .from("plans")
      .select("id, slug, name, price_cents, price_monthly_usd")
      .eq("slug", plan_slug)
      .single();

    if (planError || !plan) {
      return json({ error: `Plan not found: ${plan_slug}` }, 404);
    }

    const priceCents = plan.price_cents || plan.price_monthly_usd || 999;

    // PayPal flow
    const ppToken = await getPayPalAccessToken();
    const productId = await getOrCreatePayPalProduct(ppToken, plan.slug);
    const billingPlanId = await getOrCreatePayPalPlan(
      ppToken,
      productId,
      plan.slug,
      priceCents
    );

    // Create subscription
    const origin = req.headers.get("origin") || "https://turbo-learning.app";

    const subRes = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ppToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `sub-${userId}-${Date.now()}`,
      },
      body: JSON.stringify({
        plan_id: billingPlanId,
        application_context: {
          brand_name: "Turbo Learning",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${origin}/dashboard?paypal=success`,
          cancel_url: `${origin}/pricing?paypal=cancelled`,
        },
        custom_id: userId,
      }),
    });

    if (!subRes.ok) {
      const err = await subRes.text();
      throw new Error(`PayPal subscription creation failed: ${err}`);
    }

    const subscription = await subRes.json();

    // Return the approval URL
    const approvalUrl = subscription.links?.find(
      (l: any) => l.rel === "approve"
    )?.href;

    if (!approvalUrl) {
      throw new Error("No approval URL in PayPal response");
    }

    return json({ url: approvalUrl }, 200);
  } catch (err) {
    console.error("paypal-checkout error:", err);
    return json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      500
    );
  }
});

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
