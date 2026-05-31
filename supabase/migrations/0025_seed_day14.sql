-- PREVIEW SEED — review & approve before applying with the service key.
-- Program: ai_for_everyone  Unit 14 (Day 14)  Lesson 1
-- Week 2 Evaluation — Create a $100-500 deliverable

insert into programs (slug, title, subtitle, unit_label, artifact_label)
values ('ai_for_everyone', 'AI for Everyone', '28 days to AI confidence', 'Day', 'Artifact')
on conflict (slug) do nothing;

insert into units (program_id, order_num, label, title, theme)
select id, 14, 'Day 14', 'Week 2 Evaluation', ''
from programs where slug = 'ai_for_everyone'
on conflict (program_id, order_num) do nothing;

-- Seed the Week 2 badge
insert into badges (slug, name, icon, unlock_condition)
values ('week2_content_creator', 'Content Creator', '✍️', 'Complete Day 14: AI for Real Work')
on conflict (slug) do nothing;

insert into lessons (unit_id, order_num, title, est_minutes, steps)
select u.id, 1, 'Week 2 Final Project', 30, $json$[
  {
    "id": "d14_s1",
    "type": "info",
    "title": "Welcome to Day 14 — Week 2 Finale",
    "body": "This is the end of Week 2. In the past 6 days you have learned to: build content pipelines, do deep research, think strategically, build marketing campaigns, create working apps, and design visual assets. Today you prove it — by creating a deliverable worth $100-500 in the real world.",
    "audioUrl": null,
    "primaryButton": "I am ready for this",
    "xp": 3
  },
  {
    "id": "d14_s2",
    "type": "scenario_card",
    "title": "Your final challenge",
    "body": "A real client needs a deliverable. Or a real business problem needs solving. Today you will produce something you could actually sell for $100-500. Options: a full content package (blog + social + ads), a market research brief, a complete business strategy, an outreach campaign, a working app, or a brand design package. Pick one and build it with AI.",
    "audioUrl": null,
    "primaryButton": "I choose my project",
    "xp": 3
  },
  {
    "id": "d14_s3",
    "type": "info",
    "title": "What makes a $100-500 deliverable",
    "body": "Real-world deliverables at this price point share common traits:\n\n1. They solve a specific problem (not generic advice)\n2. They are well-structured and professional\n3. They demonstrate expertise in one area\n4. They are ready to use (not a draft)\n5. They show clear thinking and research\n\nYour goal is not just to use AI — it is to produce something that feels like it came from a professional. Edit. Refine. Add your voice. AI drafts, you polish.",
    "audioUrl": null,
    "primaryButton": "I understand the standard",
    "xp": 3
  },
  {
    "id": "d14_s4",
    "type": "mc",
    "title": "Choosing your project type",
    "question": "You are choosing between: a content package, a research brief, and a business strategy. Which should you pick?",
    "options": [
      "Pick the one you enjoy most — passion produces the best work",
      "Pick the most complex one to impress",
      "Pick the fastest one to finish quickly"
    ],
    "correct": 0,
    "feedback": [
      "Yes. The best deliverable comes from something you actually care about. Your passion shows through AI refinement.",
      "Complexity does not equal value. Choose what plays to your interests.",
      "Speed is not the goal. Quality is."
    ],
    "xp": 10
  },
  {
    "id": "d14_s5",
    "type": "info",
    "title": "Your project: multi-tool orchestration",
    "body": "For this final project, use at least 3 different AI techniques you learned:\n\n- Content system (Day 8) — one source → many formats\n- Research protocol (Day 9) — structured questions + sources\n- Strategy framework (Day 10) — SWOT, roadmap, GTM\n- Marketing engine (Day 11) — sequences, funnels, segments\n- Coding workflow (Day 12) — describe, generate, iterate, deploy\n- Design pipeline (Day 13) — prompts, iterations, brand consistency\n\nYou do not need all of them. But more than one shows mastery.",
    "audioUrl": null,
    "primaryButton": "I will combine techniques",
    "xp": 3
  },
  {
    "id": "d14_s6",
    "type": "quiz",
    "title": "Week 2 mastery check",
    "questions": [
      {
        "id": "q1",
        "type": "mc",
        "question": "What is the most efficient AI content pipeline?",
        "options": [
          "Create each piece of content from scratch with separate prompts",
          "Create one core piece and repurpose it into multiple formats",
          "Use AI only for editing human-written content"
        ],
        "correct": 1
      },
      {
        "id": "q2",
        "type": "mc",
        "question": "When using AI for research, what should you always do before using a claim?",
        "options": [
          "Ask AI if it is confident about the claim",
          "Verify the source manually — cross-check with external information",
          "Use the claim — AI is accurate most of the time"
        ],
        "correct": 1
      },
      {
        "id": "q3",
        "type": "mc",
        "question": "What is the right role for AI in business strategy?",
        "options": [
          "Decision-maker — AI knows best",
          "Framework provider — AI generates structures, you provide context and decide",
          "Note-taker — AI just records your thoughts"
        ],
        "correct": 1
      },
      {
        "id": "q4",
        "type": "mc",
        "question": "When AI-generated code has an error, what is the fastest way to fix it?",
        "options": [
          "Delete everything and start over with a new description",
          "Paste the error message to AI and ask for a targeted fix",
          "Try to fix it manually even if you do not know the language"
        ],
        "correct": 1
      },
      {
        "id": "q5",
        "type": "mc",
        "question": "What makes an AI-generated image prompt effective?",
        "options": [
          "Short and simple — AI works best with minimal instructions",
          "Subject, environment, lighting, and style — detailed and specific",
          "Technical camera specifications only"
        ],
        "correct": 1
      }
    ],
    "xp": 25
  },
  {
    "id": "d14_s7",
    "type": "info",
    "title": "The $100-500 mindset",
    "body": "Think about what you can offer that has real economic value:\n\n- A small business needs 5 blog posts = $200\n- A startup needs a competitive analysis = $300\n- A coach needs a social media package = $150\n- A non-profit needs a grant research brief = $400\n- A founder needs a pitch deck = $500\n\nAI makes these possible in hours instead of days. Your value is: speed + quality + your domain knowledge.",
    "audioUrl": null,
    "primaryButton": "I see the economic value",
    "xp": 3
  },
  {
    "id": "d14_s8",
    "type": "builder",
    "title": "Plan your $100-500 project",
    "fields": [
      {
        "id": "project_type",
        "label": "What type of deliverable will you create?",
        "placeholder": "Content package for a local coffee shop"
      },
      {
        "id": "techniques",
        "label": "Which AI techniques will you use? (from Days 8-13)",
        "placeholder": "Content pipeline, research synthesis, brand voice consistency"
      },
      {
        "id": "value",
        "label": "What makes this worth $100-500?",
        "placeholder": "Saves the business 20 hours of work and provides ready-to-use assets"
      },
      {
        "id": "audience",
        "label": "Who is the client or audience for this?",
        "placeholder": "Local business owner who needs online content but has no time"
      }
    ],
    "template": "My final project plan:\n- Project: {{project_type}}\n- AI techniques: {{techniques}}\n- Value proposition: {{value}}\n- Client / audience: {{audience}}",
    "primaryButton": "Save my project plan",
    "xp": 20
  },
  {
    "id": "d14_s9",
    "type": "info",
    "title": "Your project checklist",
    "body": "Before you call it done:\n\n- Did you use AI as a tool, not a crutch? (your judgment matters)\n- Is the output professional enough to send to a client?\n- Did you verify facts and sources?\n- Is the brand voice consistent throughout?\n- Does it solve a real problem?\n- Could you confidently charge for it?\n\nIf you answered yes to all of these — congratulations, you have graduated from AI user to AI professional.",
    "audioUrl": null,
    "primaryButton": "I will check my work",
    "xp": 3
  },
  {
    "id": "d14_s10",
    "type": "reflection",
    "title": "Week 2 reflection",
    "questions": [
      {
        "id": "biggest_growth",
        "type": "single_choice",
        "label": "What is the biggest skill you gained this week?",
        "options": [
          "Content creation and repurposing with AI",
          "Research and fact-checking with AI",
          "Business strategy and planning with AI",
          "Marketing and outreach with AI",
          "Coding and building with AI",
          "Design and visual creation with AI"
        ]
      },
      {
        "id": "week2_takeaway",
        "type": "textarea",
        "label": "What is the most important thing you learned about using AI for real work?"
      },
      {
        "id": "next_steps",
        "type": "textarea",
        "label": "What real project will you apply these skills to next week?"
      }
    ],
    "xp": 15
  },
  {
    "id": "d14_s11",
    "type": "compare",
    "title": "Compare your skills: before Week 2 to now",
    "question": "Think about your ability to use AI for real work before Week 2. Now compare it to today. What could you produce now that you could not 6 days ago? What is the economic value of that difference?",
    "primaryButton": "I have grown",
    "xp": 10
  },
  {
    "id": "d14_s12",
    "type": "info",
    "title": "Coming up in Week 3 — Automation",
    "body": "Week 2 was about using AI as your assistant. Week 3 is about making AI work without you. You will learn:\n\n- APIs — how tools talk to each other\n- Zapier & Make — no-code automation workflows\n- Databases — giving AI permanent memory\n- CRM, messaging, and document generation — all on autopilot\n\nYou will build workflows that run while you sleep. The robots will do the work.",
    "audioUrl": null,
    "primaryButton": "I am excited for Week 3",
    "xp": 3
  },
  {
    "id": "d14_s13",
    "type": "badge_unlock",
    "badgeSlug": "week2_content_creator",
    "xp": 3
  },
  {
    "id": "d14_s14",
    "type": "streak_commitment",
    "commitOptions": [
      14,
      21,
      28,
      60
    ],
    "xp": 3
  },
  {
    "id": "d14_s15",
    "type": "completion",
    "title": "Week 2 complete!",
    "body": "Congratulations — you completed Week 2 of AI for Everyone. You have proven you can use AI to do real, economically valuable work. Content systems, research, strategy, marketing, coding, design — these are no longer mysterious. They are tools in your AI toolkit. Keep building. Keep creating. And remember: AI handles the work. You provide the vision.",
    "primaryButton": "On to Week 3"
  }
]$json$::jsonb
from units u join programs p on p.id = u.program_id
where p.slug = 'ai_for_everyone' and u.order_num = 14
on conflict (unit_id, order_num) do nothing;
