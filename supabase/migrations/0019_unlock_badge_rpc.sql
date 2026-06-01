-- 0019_unlock_badge_rpc.sql
-- RPC for awarding a badge by slug. Idempotent — does nothing if badge already earned.

CREATE OR REPLACE FUNCTION unlock_badge(p_badge_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_badge_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unlock_badge requires an authenticated user';
  END IF;

  SELECT id INTO v_badge_id FROM badges WHERE slug = p_badge_slug;
  IF v_badge_id IS NULL THEN
    RAISE EXCEPTION 'Badge slug "%" not found', p_badge_slug;
  END IF;

  -- Idempotent: skip if already awarded
  IF EXISTS(SELECT 1 FROM user_badges WHERE user_id = v_user_id AND badge_id = v_badge_id) THEN
    RETURN jsonb_build_object('already_earned', true, 'badge_slug', p_badge_slug);
  END IF;

  INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge_id);

  RETURN jsonb_build_object('unlocked', true, 'badge_slug', p_badge_slug);
END;
$$;
