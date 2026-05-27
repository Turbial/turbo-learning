-- PREVIEW — review & approve before applying with the service key.
-- 0005 Auth support. Supabase Auth manages identities/passwords/verification natively;
-- this only adds app-side preferences. Email/password + reset are configured in the
-- Supabase Auth dashboard, not here.
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists onboarded boolean default false;

-- Push tokens (one row per device token).
create table if not exists push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  token text not null,
  created_at timestamptz default now(),
  unique (user_id, token)
);
alter table push_tokens enable row level security;
create policy "own push sel" on push_tokens for select using (auth.uid() = user_id);
create policy "own push ins" on push_tokens for insert with check (auth.uid() = user_id);
create policy "own push del" on push_tokens for delete using (auth.uid() = user_id);
