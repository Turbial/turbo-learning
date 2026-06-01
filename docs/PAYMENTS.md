# Turbo Learning — Payment Integration

## Architecture

Turbo Learning uses the `@turbial/payments` shared library for all Stripe payment operations.

```
@turbial/payments (turbial/turbial-payments)
        │
        ├── deno/create-checkout.ts → supabase/functions/create-checkout/
        ├── deno/stripe-webhook.ts → supabase/functions/stripe-webhook/
        └── src/expo/ → lib/payments.ts (client-side checkout)
```

## Quick Setup

### 1. Install dependency

```bash
npm install github:Turbial/turbial-payments#v1.0.0
```

### 2. Client-side checkout (Expo)

```typescript
// lib/payments.ts
import { setCheckoutInvoker, startCheckout } from '@turbial/payments/expo';
import { supabase } from './supabase';

// One-time setup at app startup
setCheckoutInvoker(supabase);

// Start a checkout session
export async function startPremiumCheckout(planId: string) {
  return startCheckout(planId);
}
```

### 3. Edge Functions

The edge functions in `supabase/functions/` are kept in sync with `@turbial/payments/deno/`.
To update them:

```bash
cp ../turbial-payments/deno/create-checkout.ts supabase/functions/create-checkout/index.ts
cp ../turbial-payments/deno/stripe-webhook.ts supabase/functions/stripe-webhook/index.ts
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

### 4. Environment Variables (Supabase Dashboard)

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | `rk_live_...` (restricted key for turbo-learning) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `SUPABASE_URL` | `https://afgmlkduuapquqkcqdsk.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | (existing) |

## Plans

| Plan | Slug | Price | Stripe Price ID |
|------|------|-------|-----------------|
| Premium Monthly | `turboed_premium_monthly` | $9.99/mo | TBD (create in Stripe Dashboard) |
| Premium Annual | `turboed_premium_annual` | $99.90/yr | TBD (create in Stripe Dashboard) |

## Provisioning Status

| Item | Status | Owner |
|------|--------|-------|
| Restricted API key | 🔴 Needs creation | Marcus (Stripe Dashboard) |
| Products & Prices | 🔴 Needs creation | Marcus (Stripe Dashboard) |
| Webhook endpoint | ✅ Shared endpoint exists | Already configured |
| Edge functions deployed | ✅ Already deployed | Existing |
| Database migration | 🔴 SQL ready, needs execution | Marcus (Supabase SQL Editor) |

## Next Steps (Marcus)

1. Go to https://dashboard.stripe.com/apikeys → Create restricted key `turbo-learning-restricted`
2. Go to https://dashboard.stripe.com/products → Create 2 products (Premium Monthly + Annual)
3. Copy the Price IDs
4. Go to https://supabase.com/dashboard/project/afgmlkduuapquqkcqdsk/sql/new → Run migration
5. Set `STRIPE_SECRET_KEY` to the restricted key in Supabase Edge Function secrets
6. Test with `test_mode: true` and card `4242 4242 4242 4242`
7. Switch to live
