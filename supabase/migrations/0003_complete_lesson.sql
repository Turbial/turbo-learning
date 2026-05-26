-- 0003_complete_lesson.sql — Atomic RPC for lesson completion
-- Handles XP, level, streak, badge checks in a single transaction.
-- Called by the app on lesson completion (replaces multiple client-side writes).

create or replace function complete_lesson(
  p_user_id uuid,
  p_lesson_id uuid,
  p_xp_earned int,
  p_score numeric
)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  v_total_xp int;
  v_new_level int;
  v_streak int;
  v_today date := current_date;
  v_yesterday date := current_date - interval '1 day';
  v_had_streak_yesterday boolean;
  v_lesson_completed boolean;
  v_result jsonb;
begin
  -- 1. Record lesson progress (idempotent — only first completion counts)
  insert into lesson_progress (user_id, lesson_id, xp_earned, score)
  values (p_user_id, p_lesson_id, p_xp_earned, p_score)
  on conflict (user_id, lesson_id) do nothing;

  -- Check if this was a new completion (not a repeat)
  select exists(
    select 1 from lesson_progress
    where user_id = p_user_id and lesson_id = p_lesson_id
  ) into v_lesson_completed;

  -- 2. Update XP and calculate new level
  update profiles
  set xp = xp + p_xp_earned
  where id = p_user_id
  returning xp into v_total_xp;

  -- Level formula: floor(sqrt(xp / 100)) + 1
  v_new_level := floor(sqrt(v_total_xp::numeric / 100)) + 1;

  update profiles
  set level = v_new_level
  where id = p_user_id and level != v_new_level;

  -- 3. Streak logic
  -- Check if user completed a lesson yesterday
  select exists(
    select 1 from streak_log
    where user_id = p_user_id and date = v_yesterday and completed = true
  ) into v_had_streak_yesterday;

  -- Check if today already logged
  if not exists(select 1 from streak_log where user_id = p_user_id and date = v_today) then
    if v_had_streak_yesterday then
      -- Continuing streak
      update profiles set streak = streak + 1 where id = p_user_id;
    else
      -- Starting new streak
      update profiles set streak = 1 where id = p_user_id;
    end if;

    insert into streak_log (user_id, date, completed)
    values (p_user_id, v_today, true);
  end if;

  select streak into v_streak from profiles where id = p_user_id;

  -- 4. Badge checks (simple rules — expand later)
  -- First day badge
  if not exists(
    select 1 from user_badges ub
    join badges b on b.id = ub.badge_id
    where ub.user_id = p_user_id and b.slug = 'first_day'
  ) then
    insert into user_badges (user_id, badge_id)
    select p_user_id, id from badges where slug = 'first_day';
  end if;

  -- 7-day streak badge
  if v_streak >= 7 and not exists(
    select 1 from user_badges ub
    join badges b on b.id = ub.badge_id
    where ub.user_id = p_user_id and b.slug = 'week_streak'
  ) then
    insert into user_badges (user_id, badge_id)
    select p_user_id, id from badges where slug = 'week_streak';
  end if;

  -- 14-day streak badge
  if v_streak >= 14 and not exists(
    select 1 from user_badges ub
    join badges b on b.id = ub.badge_id
    where ub.user_id = p_user_id and b.slug = 'two_week_streak'
  ) then
    insert into user_badges (user_id, badge_id)
    select p_user_id, id from badges where slug = 'two_week_streak';
  end if;

  -- 5. Build result
  select jsonb_build_object(
    'total_xp', v_total_xp,
    'level', v_new_level,
    'streak', v_streak,
    'lesson_completed', v_lesson_completed
  ) into v_result;

  return v_result;
end;
$$;
