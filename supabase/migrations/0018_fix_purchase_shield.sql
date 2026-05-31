-- 0018_fix_purchase_shield.sql
-- The production shield_purchases table has a 'shield_type' NOT NULL column
-- that wasn't in migration 0007. Fix the purchase_shield function to set it.
CREATE OR REPLACE FUNCTION public.purchase_shield()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_user uuid := auth.uid();
  v_count int;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  INSERT INTO shield_purchases (user_id, shield_type)
  VALUES (v_user, 'purchase');

  UPDATE profiles
  SET shield_count = COALESCE(shield_count, 0) + 1
  WHERE id = v_user
  RETURNING shield_count INTO v_count;

  RETURN v_count;
END;
$$;
GRANT EXECUTE ON FUNCTION public.purchase_shield() TO authenticated;
