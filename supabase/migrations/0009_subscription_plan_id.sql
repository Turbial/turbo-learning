-- 0009 Add plan_id to subscriptions table so the webhook can store which plan
-- the user subscribed to. Backfill existing rows from metadata if needed.
alter table subscriptions add column if not exists plan_id text;
