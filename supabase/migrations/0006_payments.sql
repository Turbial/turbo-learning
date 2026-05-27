-- PREVIEW — review & approve before applying with the service key.
-- 0006 Payments: plans, subscriptions, payment history. Stripe is source of truth;
-- the stripe-webhook edge function writes here via the service role.
create table if not exists plans (
  id text primary key,                 -- 'free' | 'premium_monthly' | 'premium_annual'
  name text not null, price_cents int default 0, interval text, stripe_price_id text
);
insert into plans (id, name, price_cents, interval) values
  ('free','Free',0,null),
  ('premium_monthly','Premium (Monthly)',1900,'month'),
  ('premium_annual','Premium (Annual)',15000,'year')
on conflict (id) do nothing;

create table if not exists subscriptions (
  user_id uuid primary key references profiles(id) on delete cascade,
  tier text default 'free',            -- 'free' | 'premium'
  status text default 'none',
  stripe_customer_id text, stripe_subscription_id text,
  current_period_end timestamptz, updated_at timestamptz default now()
);
create table if not exists payment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  amount_cents int, currency text default 'usd', status text,
  stripe_payment_intent text, created_at timestamptz default now()
);
alter table subscriptions enable row level security;
alter table payment_history enable row level security;
-- Users may READ their own billing; only the service role (webhook) writes.
create policy "own sub sel" on subscriptions for select using (auth.uid() = user_id);
create policy "own pay sel" on payment_history for select using (auth.uid() = user_id);
alter table plans enable row level security;
create policy "plans read" on plans for select using (true);
