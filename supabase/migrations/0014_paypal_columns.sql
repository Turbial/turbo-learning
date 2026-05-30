-- 0014_paypal_columns.sql — Add PayPal-specific columns to subscriptions + payment_history

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT;
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS paypal_transaction_id TEXT;

-- Add plan_slug column to subscriptions for easier plan identification
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_slug TEXT;
