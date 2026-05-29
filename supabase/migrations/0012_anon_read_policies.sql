-- 0012_anon_read_policies.sql — Enable anon read access on public content tables
-- Without these policies, the web app falls back to local JSON for everything.

-- Programs are public content
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS anon_programs_read ON programs;
CREATE POLICY anon_programs_read ON programs FOR SELECT USING (true);

-- Units are public content
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS anon_units_read ON units;
CREATE POLICY anon_units_read ON units FOR SELECT USING (true);

-- Lessons are public content
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS anon_lessons_read ON lessons;
CREATE POLICY anon_lessons_read ON lessons FOR SELECT USING (true);

-- Badges are public content
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS anon_badges_read ON badges;
CREATE POLICY anon_badges_read ON badges FOR SELECT USING (true);
