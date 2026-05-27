-- PREVIEW — review & approve before applying with the service key.
-- 0008 Spaced repetition. review_queue table exists (0001); this adds the scheduler RPC
-- (expanding interval) + the streak-at-risk helper used by the cron edge function.
create or replace function public.schedule_review(p_step_id text, p_lesson_id uuid, p_correct boolean)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid := auth.uid(); v_interval int; v_ease numeric;
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  select interval_days, ease into v_interval, v_ease from review_queue
    where user_id = v_user and step_id = p_step_id;
  if not found then v_interval := 1; v_ease := 2.5; end if;
  if p_correct then v_interval := greatest(1, round(v_interval * v_ease)); else v_interval := 1; end if;
  insert into review_queue (user_id, step_id, lesson_id, due_at, interval_days, ease, last_result)
  values (v_user, p_step_id, p_lesson_id, now() + (v_interval || ' days')::interval, v_interval, v_ease,
          case when p_correct then 'pass' else 'fail' end)
  on conflict (id) do nothing;
end; $$;
grant execute on function public.schedule_review(text, uuid, boolean) to authenticated;

create or replace function public.users_without_completion_today(p_date date)
returns table(user_id uuid) language sql security definer set search_path = public, pg_temp as $$
  select p.id from profiles p
  where p.streak > 0
    and not exists (select 1 from streak_log s where s.user_id = p.id and s.date = p_date);
$$;
grant execute on function public.users_without_completion_today(date) to authenticated, service_role;
