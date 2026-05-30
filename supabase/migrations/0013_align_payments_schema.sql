-- 0013_align_payments_schema.sql
-- Aligns the existing plans/subscriptions tables with what the code expects.
-- The existing plans table uses slug/price_monthly_usd; code expects id/text, price_cents, interval.
-- The existing subscriptions table is missing the tier column.

-- 1. Add missing columns to plans (idempotent — uses IF NOT EXISTS)
ALTER TABLE plans ADD COLUMN IF NOT EXISTS price_cents INT DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS "interval" TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- 2. Backfill price_cents from price_monthly_usd
UPDATE plans SET price_cents = price_monthly_usd WHERE price_cents = 0 AND price_monthly_usd > 0;

-- 3. Add tier to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';

-- 4. Make sure stripe_price_id columns exist for checkout
-- stripe_price_id_monthly / stripe_price_id_annual already exist on plans
-- We populate stripe_price_id with monthly as default for compatibility
UPDATE plans SET stripe_price_id = stripe_price_id_monthly WHERE stripe_price_id IS NULL AND stripe_price_id_monthly IS NOT NULL;

-- 5. Add Stripe product/price IDs for the Pro plan (if not set)
-- These need to be created in Stripe dashboard and pasted here
-- UPDATE plans SET stripe_price_id_monthly = 'price_XXXXX' WHERE slug = 'pro';
-- UPDATE plans SET stripe_price_id = 'price_XXXXX' WHERE slug = 'pro';
