CREATE TABLE IF NOT EXISTS flashcard_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  card_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='flashcard_decks' AND policyname='decks_own') THEN
    CREATE POLICY decks_own ON flashcard_decks USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid REFERENCES flashcard_decks(id) ON DELETE CASCADE NOT NULL,
  front text NOT NULL,
  back text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='flashcards' AND policyname='cards_deck_owner_select') THEN
    CREATE POLICY cards_deck_owner_select ON flashcards FOR SELECT USING (
      EXISTS (SELECT 1 FROM flashcard_decks WHERE id=deck_id AND user_id=auth.uid()));
    CREATE POLICY cards_deck_owner_insert ON flashcards FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM flashcard_decks WHERE id=deck_id AND user_id=auth.uid()));
    CREATE POLICY cards_deck_owner_delete ON flashcards FOR DELETE USING (
      EXISTS (SELECT 1 FROM flashcard_decks WHERE id=deck_id AND user_id=auth.uid()));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id uuid REFERENCES flashcards(id) ON DELETE CASCADE NOT NULL,
  ease_factor real NOT NULL DEFAULT 2.5,
  interval_days int NOT NULL DEFAULT 1,
  due_date date NOT NULL DEFAULT CURRENT_DATE,
  reps int NOT NULL DEFAULT 0,
  lapses int NOT NULL DEFAULT 0,
  last_reviewed timestamptz,
  UNIQUE(user_id, card_id)
);
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='flashcard_reviews' AND policyname='reviews_own') THEN
    CREATE POLICY reviews_own ON flashcard_reviews USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS card_reviews_due_idx ON flashcard_reviews(user_id, due_date);
