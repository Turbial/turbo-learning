-- Phase A: lesson_notes table for in-lesson note-taking
CREATE TABLE IF NOT EXISTS lesson_notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id     uuid        REFERENCES units(id) ON DELETE SET NULL,
  content     text        NOT NULL CHECK (char_length(content) <= 2000),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_id ON lesson_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_unit_id  ON lesson_notes(unit_id);

ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own notes"
    ON lesson_notes FOR ALL
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_lesson_notes_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_lesson_notes_updated_at
    BEFORE UPDATE ON lesson_notes
    FOR EACH ROW EXECUTE FUNCTION update_lesson_notes_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
