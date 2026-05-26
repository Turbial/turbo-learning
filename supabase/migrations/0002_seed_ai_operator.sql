-- 0002_seed_ai_operator.sql — Seed the AI Operator program + Day 1
-- Must run AFTER 0001_schema.sql

-- ═══ PROGRAM ═══

insert into programs (slug, title, subtitle, unit_label, artifact_label, level_names)
values (
  'ai-operator',
  'AI Operator: 28 Days',
  'Go from AI user to AI operator — build automations, workflows, and your own AI workforce.',
  'Day',
  'Artifact',
  '["Beginner","Learner","Builder","Operator","Master"]'
);

-- Capture the program id for FK references
do $$
declare
  prog_id uuid;
begin
  select id into prog_id from programs where slug = 'ai-operator';

  -- ═══ UNITS (Days 1–28) ═══
  -- We seed Day 1 with full content for M1 smoke test.
  -- Days 2–28 are placeholder shells — content added iteratively.

  -- Day 1: full content
  insert into units (program_id, order_num, label, title, theme)
  values (prog_id, 1, 'Day 1', 'What AI Actually Is (And Isn''t)', '#059669');

  -- Days 2-28: placeholder shells
  insert into units (program_id, order_num, label, title, theme)
  select prog_id, gs, 'Day ' || gs, 'Day ' || gs, '#059669'
  from generate_series(2, 28) as gs;

  -- ═══ LESSON: Day 1 ═══

  with day1_unit as (
    select id from units where program_id = prog_id and order_num = 1
  )
  insert into lessons (unit_id, order_num, title, est_minutes, steps)
  select id, 1, 'What AI Actually Is (And Isn''t)', 15, '[
    {
      "id": "d1-info-1",
      "type": "info",
      "title": "Welcome to Day 1",
      "body": "You''re about to learn what AI actually is — not the hype, not the fear, not the marketing. Just the real thing.\n\nBy the end of today, you''ll understand the three core things you need to know: what AI can do, what it can''t, and where the real power sits (hint: it''s not the AI — it''s the operator).\n\nLet''s go.",
      "xp": 5
    },
    {
      "id": "d1-highlight-1",
      "type": "highlight",
      "body": "AI is not magic. It''s not sentient. It''s not coming for your job.\n\nAI is a prediction engine.\n\nThat''s it. Feed it data, it predicts what comes next — whether that''s the next word, the next pixel, or the next action. Everything else — the ''creativity,'' the ''reasoning,'' the ''personality'' — is emergent from that one mechanism.",
      "highlights": ["prediction engine", "predicts what comes next", "emergent"],
      "xp": 5
    },
    {
      "id": "d1-mc-1",
      "type": "mc",
      "question": "What is AI at its core?",
      "options": [
        "A sentient digital being",
        "A prediction engine that guesses what comes next",
        "A database with a chat interface",
        "A magic black box that does everything"
      ],
      "correct": 1,
      "feedback": [
        "Correct. AI is fundamentally a prediction engine — it predicts tokens, pixels, or actions based on patterns in its training data.",
        "Close, but not quite. While AI can interact with databases, its core mechanism is prediction — not retrieval."
      ],
      "xp": 10
    },
    {
      "id": "d1-scenario-1",
      "type": "scenario_card",
      "title": "The Real Job Impact",
      "body": "Here''s what nobody tells you: AI doesn''t replace jobs. It replaces tasks.\n\nA job is a bundle of 20–50 tasks. AI might automate 5–7 of them — the repetitive, high-volume ones. That doesn''t eliminate the job. It changes it.\n\nThe question isn''t ''Will AI take my job?'' It''s ''Which of my tasks can I offload to AI so I can focus on the ones that actually need me?''\n\nThat shift — from user to operator — is what this entire program is about."
    },
    {
      "id": "d1-tf-1",
      "type": "tf",
      "question": "AI replaces entire jobs, not individual tasks.",
      "correct": false,
      "feedback": [
        "Correct — you caught it. AI automates tasks, not jobs. A job is a bundle of many tasks, and AI typically handles only the repetitive subset.",
        "Not quite. AI automates specific tasks within a job, not the whole job. The operator decides which tasks to delegate."
      ],
      "xp": 10
    },
    {
      "id": "d1-info-2",
      "type": "info",
      "title": "The Three Layers of AI Capability",
      "body": "Layer 1 — Prediction: What AI does natively. Predict the next word, classify an image, detect a pattern.\n\nLayer 2 — Tool Use: AI calls APIs, queries databases, sends emails. This is where AI becomes useful — not just smart.\n\nLayer 3 — Agency: AI makes decisions, chains actions, operates autonomously. This is where operators live.\n\nMost people stop at Layer 1. You''re going to Layer 3.",
      "xp": 5
    },
    {
      "id": "d1-goodfit-1",
      "type": "good_fit",
      "question": "Using ChatGPT to write a single email and then doing everything else manually.",
      "correct": "notideal",
      "feedback": [
        "That''s right — single-use prompting is Layer 1. Real operators build systems where AI handles batches of tasks automatically.",
        "Think bigger. Writing one email is a task. Setting up AI to handle all routine emails is operating. You''re here for the second one."
      ],
      "xp": 10
    },
    {
      "id": "d1-example-1",
      "type": "example",
      "title": "From User to Operator: A Real Example",
      "prompt": "Sarah runs a small marketing agency. Before: she spent 3 hours/day writing client update emails. After: she built a workflow where AI drafts all client updates from project data, she reviews in 20 minutes, and they send automatically. Same quality. 2.5 hours/day saved. That''s operating.\n\nShe didn''t build software. She built a system where AI does the heavy lifting and she stays in control."
    },
    {
      "id": "d1-highlight-2",
      "type": "highlight",
      "body": "The operator mindset: You don''t use AI. You direct it.\n\nYou''re not asking AI to do your work. You''re building systems where AI executes, you decide, and the output is better than either could produce alone.\n\nThis is the difference between being replaced and being amplified.",
      "highlights": ["You don''t use AI. You direct it.", "building systems", "replaced and being amplified"],
      "xp": 5
    },
    {
      "id": "d1-reflection-1",
      "type": "reflection",
      "questions": [
        {
          "id": "r1",
          "prompt": "What''s one task in your work or life that you do repeatedly and wish you didn''t have to?",
          "placeholder": "Name a specific, repetitive task...",
          "minChars": 20
        },
        {
          "id": "r2",
          "prompt": "If AI could handle that task, what would you focus on instead?",
          "placeholder": "What becomes possible...",
          "minChars": 20
        }
      ]
    },
    {
      "id": "d1-completion",
      "type": "completion",
      "title": "Day 1 Complete!",
      "body": "You now understand what AI actually is — a prediction engine — and the operator mindset that turns it from a toy into a workforce.\n\nTomorrow: the tool landscape. Which AI tools exist, what each one is for, and how to pick the right one for the job."
    }
  ]'::jsonb
  from day1_unit;

  -- ═══ BADGES ═══

  insert into badges (slug, name, icon, unlock_condition) values
    ('first_day', 'First Steps', '👣', 'Complete Day 1'),
    ('week_streak', '7-Day Streak', '🔥', '7-day streak'),
    ('two_week_streak', '14-Day Streak', '💪', '14-day streak'),
    ('month_streak', '30-Day Streak', '👑', '30-day streak'),
    ('perfect_week', 'Perfect Week', '⭐', '100% on all lessons in a week'),
    ('first_workflow', 'Workflow Builder', '🏗️', 'Complete your first builder step'),
    ('reflector', 'Deep Thinker', '🤔', 'Complete 5 reflection steps'),
    ('operator', 'AI Operator', '🚀', 'Complete all 28 days');

end $$;
