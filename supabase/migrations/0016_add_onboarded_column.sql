-- 0016_add_onboarded_column.sql
-- Migration 0005 was tracked as applied but the onboarded column never
-- materialised in production. Apply it directly.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarded boolean DEFAULT false;

-- Backfill existing users: anyone with xp > 0 and a name set has likely
-- completed onboarding (even if the flag wasn't being set).
UPDATE profiles SET onboarded = true WHERE onboarded IS NULL AND name IS NOT NULL AND xp > 0;
