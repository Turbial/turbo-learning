-- 0015_add_xp_rpc.sql
-- Lightweight RPC to incrementally add XP per-step (not just at lesson end).
-- Called mid-lesson so XP is reflected immediately on Journey/Progress/Dashboard.

CREATE OR REPLACE FUNCTION add_xp(
  p_xp int DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'add_xp requires an authenticated user';
  END IF;

  UPDATE profiles
  SET xp = COALESCE(xp, 0) + p_xp,
      level = floor(sqrt((COALESCE(xp, 0) + p_xp)::numeric / 100)) + 1
  WHERE id = v_user_id;
END;
$$;
