-- 0023_leagues.sql
-- XP Leagues: weekly competition groups (Duolingo-style tiers).
-- Each week users are placed into a bronze/silver/gold/diamond/master league
-- based on their total lifetime XP, then compete on weekly XP earned.

-- ─── Tables ───

-- leagues: one row per tier per week (up to 30 members per league instance)
CREATE TABLE IF NOT EXISTS public.leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  tier text NOT NULL CHECK (tier IN ('bronze','silver','gold','diamond','master')),
  created_at timestamptz DEFAULT now()
);

-- league_enrollments: one row per user per week
CREATE TABLE IF NOT EXISTS public.league_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  week_xp integer NOT NULL DEFAULT 0,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(user_id, league_id)
);

-- ─── Row Level Security ───

ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_enrollments ENABLE ROW LEVEL SECURITY;

-- Anyone can read league metadata (needed to display tier names/dates)
CREATE POLICY "leagues_read" ON public.leagues
  FOR SELECT USING (true);

-- Users can read their own enrollment and league-mates' enrollments
CREATE POLICY "enrollments_self_read" ON public.league_enrollments
  FOR SELECT USING (
    league_id IN (
      SELECT league_id FROM public.league_enrollments WHERE user_id = auth.uid()
    )
  );

-- Users can only enroll themselves
CREATE POLICY "enrollments_self_insert" ON public.league_enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can only update their own enrollment (week_xp updates via RPC)
CREATE POLICY "enrollments_self_update" ON public.league_enrollments
  FOR UPDATE USING (user_id = auth.uid());

-- ─── Standings View ───

-- league_standings: ranked list of all members within each league for the week
CREATE OR REPLACE VIEW public.league_standings AS
SELECT
  le.league_id,
  le.user_id,
  COALESCE(p.display_name, 'Learner') AS display_name,
  le.week_xp,
  l.tier,
  l.week_start,
  RANK() OVER (PARTITION BY le.league_id ORDER BY le.week_xp DESC) AS rank
FROM public.league_enrollments le
JOIN public.leagues l ON le.league_id = l.id
JOIN public.profiles p ON le.user_id = p.id;

-- ─── RPCs ───

-- enroll_in_league: auto-enrolls the user in this week's appropriate tier league.
-- Returns the league_id. Idempotent — calling multiple times returns the same id.
-- Tier is determined by the user's total lifetime XP in profiles.xp.
-- Each league holds up to 30 members; a new league is created when all are full.
CREATE OR REPLACE FUNCTION public.enroll_in_league(p_user_id uuid DEFAULT auth.uid())
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_week_start date := date_trunc('week', now())::date;
  v_league_id uuid;
  v_tier text;
  v_user_xp integer;
BEGIN
  -- Already enrolled this week? Return existing league.
  SELECT le.league_id INTO v_league_id
  FROM public.league_enrollments le
  JOIN public.leagues l ON le.league_id = l.id
  WHERE le.user_id = p_user_id AND l.week_start = v_week_start
  LIMIT 1;

  IF v_league_id IS NOT NULL THEN
    RETURN v_league_id;
  END IF;

  -- Determine tier from lifetime XP
  SELECT COALESCE(xp, 0) INTO v_user_xp FROM public.profiles WHERE id = p_user_id;

  v_tier := CASE
    WHEN v_user_xp >= 5000 THEN 'master'
    WHEN v_user_xp >= 2000 THEN 'diamond'
    WHEN v_user_xp >= 800  THEN 'gold'
    WHEN v_user_xp >= 200  THEN 'silver'
    ELSE 'bronze'
  END;

  -- Find a non-full league for this week + tier (max 30 members, prefer fuller ones)
  SELECT l.id INTO v_league_id
  FROM public.leagues l
  LEFT JOIN public.league_enrollments le ON le.league_id = l.id
  WHERE l.week_start = v_week_start AND l.tier = v_tier
  GROUP BY l.id
  HAVING COUNT(le.id) < 30
  ORDER BY COUNT(le.id) DESC
  LIMIT 1;

  -- No available league — create a new one for this week + tier
  IF v_league_id IS NULL THEN
    INSERT INTO public.leagues (week_start, tier)
    VALUES (v_week_start, v_tier)
    RETURNING id INTO v_league_id;
  END IF;

  -- Enroll the user (week_xp starts at 0)
  INSERT INTO public.league_enrollments (league_id, user_id, week_xp)
  VALUES (v_league_id, p_user_id, 0)
  ON CONFLICT (user_id, league_id) DO NOTHING;

  RETURN v_league_id;
END;
$$;

-- add_league_xp: increments the user's week_xp in their current league.
-- Called after lesson completion alongside the global addXp mutation.
CREATE OR REPLACE FUNCTION public.add_league_xp(p_user_id uuid, p_xp integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.league_enrollments le
  SET week_xp = week_xp + p_xp
  FROM public.leagues l
  WHERE le.league_id = l.id
    AND le.user_id = p_user_id
    AND l.week_start = date_trunc('week', now())::date;
END;
$$;
