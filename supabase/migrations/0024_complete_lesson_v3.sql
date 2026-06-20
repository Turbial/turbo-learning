-- 0024_complete_lesson_v3.sql
-- Extends complete_lesson: auto-enroll league, award league XP, consume shield on streak break

-- Add consume_shield RPC
CREATE OR REPLACE FUNCTION public.consume_shield(p_user_id uuid DEFAULT auth.uid())
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE v_count int;
BEGIN
  UPDATE profiles SET shield_count = GREATEST(0, shield_count - 1)
  WHERE id = p_user_id AND shield_count > 0
  RETURNING shield_count INTO v_count;
  RETURN COALESCE(v_count, 0);
END; $$;
GRANT EXECUTE ON FUNCTION public.consume_shield(uuid) TO authenticated;

-- Drop and recreate complete_lesson with league + shield support
DROP FUNCTION IF EXISTS complete_lesson(uuid, int, numeric);

CREATE OR REPLACE FUNCTION complete_lesson(
  p_lesson_id uuid,
  p_xp_earned int DEFAULT 0,
  p_score numeric DEFAULT 0
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_total_xp int;
  v_new_level int;
  v_streak int;
  v_today date := current_date;
  v_yesterday date := current_date - interval '1 day';
  v_had_streak_yesterday boolean;
  v_lesson_completed boolean;
  v_result jsonb;
  v_new_badges text[] := ARRAY[]::text[];
  v_shield_consumed boolean := false;
  v_league_id uuid;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'complete_lesson requires an authenticated user'; END IF;

  SELECT EXISTS(
    SELECT 1 FROM lesson_progress
    WHERE user_id = v_user_id AND lesson_id = p_lesson_id AND completed_at::date = v_today
  ) INTO v_lesson_completed;

  INSERT INTO lesson_progress (user_id, lesson_id, xp_earned, score, completed_at)
  VALUES (v_user_id, p_lesson_id, p_xp_earned, p_score, now());

  UPDATE profiles SET xp = COALESCE(xp, 0) + p_xp_earned
  WHERE id = v_user_id RETURNING xp INTO v_total_xp;

  v_new_level := floor(sqrt(v_total_xp::numeric / 100)) + 1;
  UPDATE profiles SET level = v_new_level WHERE id = v_user_id AND level != v_new_level;

  -- Streak logic with shield consumption
  SELECT EXISTS(
    SELECT 1 FROM streak_log WHERE user_id = v_user_id AND date = v_yesterday AND completed = true
  ) INTO v_had_streak_yesterday;

  IF NOT EXISTS(SELECT 1 FROM streak_log WHERE user_id = v_user_id AND date = v_today) THEN
    IF v_had_streak_yesterday THEN
      UPDATE profiles SET streak = streak + 1 WHERE id = v_user_id;
    ELSE
      -- Streak broken — try to consume a shield
      IF EXISTS(SELECT 1 FROM profiles WHERE id = v_user_id AND shield_count > 0) THEN
        UPDATE profiles SET shield_count = GREATEST(0, shield_count - 1) WHERE id = v_user_id;
        -- Maintain streak (shield absorbed the break)
        v_shield_consumed := true;
      ELSE
        UPDATE profiles SET streak = 1 WHERE id = v_user_id;
      END IF;
    END IF;
    INSERT INTO streak_log (user_id, date, completed) VALUES (v_user_id, v_today, true);
  END IF;

  SELECT streak INTO v_streak FROM profiles WHERE id = v_user_id;

  -- Badges
  IF NOT EXISTS(SELECT 1 FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = v_user_id AND b.slug = 'first_day') THEN
    INSERT INTO user_badges (user_id, badge_id) SELECT v_user_id, id FROM badges WHERE slug = 'first_day';
    v_new_badges := array_append(v_new_badges, 'first_day');
  END IF;
  IF v_streak >= 7 AND NOT EXISTS(SELECT 1 FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = v_user_id AND b.slug = 'week_streak') THEN
    INSERT INTO user_badges (user_id, badge_id) SELECT v_user_id, id FROM badges WHERE slug = 'week_streak';
    v_new_badges := array_append(v_new_badges, 'week_streak');
  END IF;
  IF v_streak >= 14 AND NOT EXISTS(SELECT 1 FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = v_user_id AND b.slug = 'two_week_streak') THEN
    INSERT INTO user_badges (user_id, badge_id) SELECT v_user_id, id FROM badges WHERE slug = 'two_week_streak';
    v_new_badges := array_append(v_new_badges, 'two_week_streak');
  END IF;

  -- Auto-enroll in league (idempotent) and award weekly XP
  BEGIN
    SELECT enroll_in_league(v_user_id) INTO v_league_id;
    IF v_league_id IS NOT NULL AND p_xp_earned > 0 THEN
      PERFORM add_league_xp(v_user_id, p_xp_earned);
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL; -- non-fatal
  END;

  RETURN jsonb_build_object(
    'xp_earned', p_xp_earned,
    'total_xp', v_total_xp,
    'new_level', v_new_level,
    'streak', v_streak,
    'already_completed', v_lesson_completed,
    'new_badges', v_new_badges,
    'shield_consumed', v_shield_consumed
  );
END; $$;
