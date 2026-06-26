-- quests (system-seeded, public read)
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  emoji text DEFAULT '⚔️',
  type text NOT NULL DEFAULT 'weekly',
  xp_reward int NOT NULL DEFAULT 100,
  condition_type text NOT NULL DEFAULT 'lessons',
  condition_value int NOT NULL DEFAULT 1,
  active_from date,
  active_to date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='quests' AND policyname='quests_read_all') THEN
    CREATE POLICY quests_read_all ON quests FOR SELECT USING (true);
  END IF;
END $$;

-- quest_progress
CREATE TABLE IF NOT EXISTS quest_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  current_value int NOT NULL DEFAULT 0,
  completed bool NOT NULL DEFAULT false,
  completed_at timestamptz,
  UNIQUE(user_id, quest_id)
);
ALTER TABLE quest_progress ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='quest_progress' AND policyname='qp_own') THEN
    CREATE POLICY qp_own ON quest_progress USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
  END IF;
END $$;

-- community_posts
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  likes int NOT NULL DEFAULT 0,
  reply_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='community_posts' AND policyname='posts_read_all') THEN
    CREATE POLICY posts_read_all ON community_posts FOR SELECT USING (true);
    CREATE POLICY posts_own_write ON community_posts FOR INSERT WITH CHECK (auth.uid()=user_id);
    CREATE POLICY posts_own_update ON community_posts FOR UPDATE USING (auth.uid()=user_id);
    CREATE POLICY posts_own_delete ON community_posts FOR DELETE USING (auth.uid()=user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS community_posts_created_idx ON community_posts(created_at DESC);

-- community_replies
CREATE TABLE IF NOT EXISTS community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  body text NOT NULL,
  likes int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='community_replies' AND policyname='replies_read_all') THEN
    CREATE POLICY replies_read_all ON community_replies FOR SELECT USING (true);
    CREATE POLICY replies_own_write ON community_replies FOR INSERT WITH CHECK (auth.uid()=user_id);
    CREATE POLICY replies_own_delete ON community_replies FOR DELETE USING (auth.uid()=user_id);
  END IF;
END $$;

-- resources
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'article',
  topic text,
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  likes int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='resources' AND policyname='res_read_all') THEN
    CREATE POLICY res_read_all ON resources FOR SELECT USING (true);
    CREATE POLICY res_auth_write ON resources FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- resource_bookmarks
CREATE TABLE IF NOT EXISTS resource_bookmarks (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, resource_id)
);
ALTER TABLE resource_bookmarks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='resource_bookmarks' AND policyname='rb_own') THEN
    CREATE POLICY rb_own ON resource_bookmarks USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
  END IF;
END $$;

-- achievements (system-seeded)
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT '🏆',
  xp_reward int NOT NULL DEFAULT 50,
  condition_type text NOT NULL DEFAULT 'lessons',
  condition_value int NOT NULL DEFAULT 1
);
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='achievements' AND policyname='ach_read_all') THEN
    CREATE POLICY ach_read_all ON achievements FOR SELECT USING (true);
  END IF;
END $$;

-- user_achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  progress int NOT NULL DEFAULT 0,
  unlocked bool NOT NULL DEFAULT false,
  unlocked_at timestamptz,
  UNIQUE(user_id, achievement_id)
);
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_achievements' AND policyname='ua_own') THEN
    CREATE POLICY ua_own ON user_achievements USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
  END IF;
END $$;

-- lesson_bookmarks
CREATE TABLE IF NOT EXISTS lesson_bookmarks (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, lesson_id)
);
ALTER TABLE lesson_bookmarks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lesson_bookmarks' AND policyname='lb_own') THEN
    CREATE POLICY lb_own ON lesson_bookmarks USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
  END IF;
END $$;

-- Seed achievements
INSERT INTO achievements (slug,title,description,icon,xp_reward,condition_type,condition_value)
VALUES
  ('first_lesson','First Step','Complete your first lesson','🎯',50,'lessons',1),
  ('lesson_5','Getting Started','Complete 5 lessons','📚',100,'lessons',5),
  ('lesson_10','Committed Learner','Complete 10 lessons','🎓',200,'lessons',10),
  ('lesson_25','Dedicated','Complete 25 lessons','🏅',500,'lessons',25),
  ('lesson_50','Expert','Complete 50 lessons','🏆',1000,'lessons',50),
  ('streak_3','Hat Trick','Maintain a 3-day streak','🔥',75,'streak',3),
  ('streak_7','Week Warrior','Maintain a 7-day streak','⚡',150,'streak',7),
  ('streak_30','Monthly Master','Maintain a 30-day streak','💎',500,'streak',30),
  ('xp_500','XP Collector','Earn 500 XP','⭐',50,'xp',500),
  ('xp_1000','XP Hunter','Earn 1000 XP','🌟',100,'xp',1000),
  ('xp_5000','XP Master','Earn 5000 XP','✨',300,'xp',5000)
ON CONFLICT (slug) DO NOTHING;

-- Seed quests
INSERT INTO quests (title,description,emoji,type,xp_reward,condition_type,condition_value)
VALUES
  ('Daily Warmup','Complete 1 lesson today','🌅','daily',25,'lessons',1),
  ('Triple Threat','Complete 3 lessons this week','⚡','weekly',75,'lessons',3),
  ('XP Rush','Earn 200 XP this week','💰','weekly',50,'xp',200),
  ('Week Warrior','Maintain a 7-day streak','🔥','weekly',150,'streak',7),
  ('Challenge Champion','Complete 3 daily challenges','⚔️','weekly',100,'challenge',3),
  ('Century Club','Complete 100 lessons total','🏆','epic',500,'lessons',100),
  ('XP Millionaire','Earn 10000 XP total','💎','epic',1000,'xp',10000)
ON CONFLICT DO NOTHING;
