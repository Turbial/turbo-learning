-- PREVIEW — review & approve before applying with the service key.
-- 0007 Streak shields: inventory (profiles.shield_count exists) + purchase log + RPC.
create table if not exists shield_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  source text default 'milestone',     -- 'milestone' | 'purchase'
  created_at timestamptz default now()
);
alter table shield_purchases enable row level security;
create policy "own shield sel" on shield_purchases for select using (auth.uid() = user_id);

-- Grant a shield (milestone path). Payment path would verify a purchase first.
create or replace function public.purchase_shield()
returns int language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid := auth.uid(); v_count int;
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  insert into shield_purchases (user_id) values (v_user);
  update profiles set shield_count = shield_count + 1 where id = v_user returning shield_count into v_count;
  return v_count;
end; $$;
grant execute on function public.purchase_shield() to authenticated;
