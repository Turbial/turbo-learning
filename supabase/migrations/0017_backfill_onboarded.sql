-- 0017_backfill_onboarded.sql
-- Fix the backfill: rows got DEFAULT false, not NULL, so the
-- 0016 UPDATE (WHERE onboarded IS NULL) matched nothing.
-- Corrected: set onboarded = true for users who clearly completed
-- onboarding (have a name and some XP).
UPDATE profiles SET onboarded = true 
WHERE onboarded = false 
  AND name IS NOT NULL 
  AND xp > 0;
