-- 0020_seed_badges.sql
-- Add missing badges that content references but aren't yet in the badges table.
-- Uses ON CONFLICT DO NOTHING so it's safe to re-run.

INSERT INTO badges (slug, name, icon, unlock_condition) VALUES
  ('first_automation', 'First Automation', '⚙️', 'Design your first automation'),
  ('first_workflow', 'Workflow Builder', '🏗️', 'Built first AI workflow')
ON CONFLICT (slug) DO NOTHING;
