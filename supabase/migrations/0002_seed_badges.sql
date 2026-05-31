-- 0002_seed_badges.sql — Seed badge definitions
-- Badges are world-readable, unlocked by the complete_lesson RPC and future game logic.

insert into badges (slug, name, icon, unlock_condition) values
  ('first_day',      'First Day',        '🌅', 'Complete your first lesson'),
  ('week_streak',    '7-Day Streak',     '🔥', 'Maintain a 7-day streak'),
  ('two_week_streak','14-Day Streak',    '💎', 'Maintain a 14-day streak'),
  ('ai_explorer',    'AI Explorer',      '🤖', 'Complete Day 1: AI for Everyone'),
  ('first_artifact', 'First Artifact',   '🛠️', 'Complete your first artifact'),
  ('level_5',        'Level 5',           '⭐', 'Reach level 5'),
  ('level_10',       'Level 10',          '🌟', 'Reach level 10'),
  ('perfect_score',  'Perfect Score',     '💯', 'Score 100% on a lesson'),
  ('seven_day_unit', 'Unit Complete',     '🏆', 'Complete a full 7-day unit')
on conflict (slug) do nothing;
