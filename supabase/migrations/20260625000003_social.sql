-- Phase C: challenge leaderboard + referral tracking

-- Daily challenge completions (one per user per day)
CREATE TABLE IF NOT EXISTS challenge_completions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       text        NOT NULL,
  score      int         NOT NULL CHECK (score BETWEEN 0 AND 5),
  time_sec   int,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_challenge_completions_date ON challenge_completions(date);

ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own scores"
  ON challenge_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read scores for leaderboard"
  ON challenge_completions FOR SELECT
  USING (true);

-- Referrals tracking
CREATE TABLE IF NOT EXISTS referrals (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_email text,
  xp_awarded    boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- Public profile reads (for share cards and leaderboard names)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public can read profile names'
  ) THEN
    CREATE POLICY "Public can read profile names" ON profiles FOR SELECT USING (true);
  END IF;
END $$;
