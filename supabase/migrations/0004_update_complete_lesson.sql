-- 0004_update_complete_lesson.sql — Update RPC with public. table references
-- Fixes search_path issue and uses correct parameter signature

DROP FUNCTION IF EXISTS complete_lesson(uuid, date, int);
DROP FUNCTION IF EXISTS complete_lesson(uuid, uuid, int, numeric);

CREATE OR REPLACE FUNCTION complete_lesson(
  p_user_id uuid,
  p_lesson_id uuid,
  p_xp_earned int,
  p_score numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_total_xp int;
  v_new_level int;
  v_streak int;
  v_today date := current_date;
  v_yesterday date := current_date - interval '1 day';
  v_had_streak_yesterday boolean;
  v_lesson_completed boolean;
  v_result jsonb;
BEGIN
  -- 1. Record lesson progress (idempotent)
  INSERT INTO lesson_progress (user_id, lesson_id, xp_earned, score)
  VALUES (p_user_id, p_lesson_id, p_xp_earned, p_score)
  ON CONFLICT (user_id, lesson_id) DO NOTHING;

  SELECT EXISTS(
    SELECT 1 FROM lesson_progress
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id
  ) INTO v_lesson_completed;

  -- 2. Update XP and calculate new level
  UPDATE profiles
  SET xp = xp + p_xp_earned
  WHERE id = p_user_id
  RETURNING xp INTO v_total_xp;

  v_new_level := floor(sqrt(v_total_xp::numeric / 100)) + 1;

  UPDATE profiles
  SET level = v_new_level
  WHERE id = p_user_id AND level != v_new_level;

  -- 3. Streak logic
  SELECT EXISTS(
    SELECT 1 FROM streak_log
    WHERE user_id = p_user_id AND date = v_yesterday AND completed = true
  ) INTO v_had_streak_yesterday;

  IF NOT EXISTS(SELECT 1 FROM streak_log WHERE user_id = p_user_id AND date = v_today) THEN
    IF v_had_streak_yesterday THEN
      UPDATE profiles SET streak = streak + 1 WHERE id = p_user_id;
    ELSE
      UPDATE profiles SET streak = 1 WHERE id = p_user_id;
    END IF;
    INSERT INTO streak_log (user_id, date, completed) VALUES (p_user_id, v_today, true);
  END IF;

  SELECT streak INTO v_streak FROM profiles WHERE id = p_user_id;

  -- 4. Badge checks
  IF NOT EXISTS(SELECT 1 FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = p_user_id AND b.slug = 'first_day') THEN
    INSERT INTO user_badges (user_id, badge_id) SELECT p_user_id, id FROM badges WHERE slug = 'first_day';
  END IF;

  IF v_streak >= 7 AND NOT EXISTS(SELECT 1 FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = p_user_id AND b.slug = 'week_streak') THEN
    INSERT INTO user_badges (user_id, badge_id) SELECT p_user_id, id FROM badges WHERE slug = 'week_streak';
  END IF;

  IF v_streak >= 14 AND NOT EXISTS(SELECT 1 FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = p_user_id AND b.slug = 'two_week_streak') THEN
    INSERT INTO user_badges (user_id, badge_id) SELECT p_user_id, id FROM badges WHERE slug = 'two_week_streak';
  END IF;

  -- 5. Build result
  SELECT jsonb_build_object(
    'total_xp', v_total_xp,
    'level', v_new_level,
    'streak', v_streak,
    'lesson_completed', v_lesson_completed
  ) INTO v_result;

  RETURN v_result;
END;
$$;
