-- 0022_leaderboard_view.sql
-- Leaderboard view: ranks users by XP, exposes display_name and rank for the leaderboard screen.

CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
  id AS user_id,
  COALESCE(NULLIF(name, ''), 'Anonymous') AS display_name,
  COALESCE(xp, 0) AS xp,
  ROW_NUMBER() OVER (ORDER BY COALESCE(xp, 0) DESC)::int AS rank
FROM profiles
WHERE id IS NOT NULL;

-- Allow anon read on leaderboard_view
ALTER VIEW leaderboard_view SET (security_invoker = true);
