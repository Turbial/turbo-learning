-- goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'xp',
  target_value int NOT NULL DEFAULT 100,
  current_value int NOT NULL DEFAULT 0,
  target_date date,
  completed bool NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='goals' AND policyname='goals_own') THEN
    CREATE POLICY goals_own ON goals USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id, created_at DESC);

-- journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL DEFAULT '',
  mood text,
  tags text[] NOT NULL DEFAULT '{}',
  word_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='journal_entries' AND policyname='journal_own') THEN
    CREATE POLICY journal_own ON journal_entries USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS journal_user_created_idx ON journal_entries(user_id, created_at DESC);
