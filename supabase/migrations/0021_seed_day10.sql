-- PREVIEW SEED — review & approve before applying with the service key.
-- Program: ai_for_everyone  Unit 10 (Day 10)  Lesson 1
-- AI for Business Strategy — SWOT, roadmaps, and GTM planning

insert into programs (slug, title, subtitle, unit_label, artifact_label)
values ('ai_for_everyone', 'AI for Everyone', '28 days to AI confidence', 'Day', 'Artifact')
on conflict (slug) do nothing;

insert into units (program_id, order_num, label, title, theme)
select id, 10, 'Day 10', 'AI for Business Strategy', ''
from programs where slug = 'ai_for_everyone'
on conflict (program_id, order_num) do nothing;

insert into lessons (unit_id, order_num, title, est_minutes, steps)
select u.id, 1, 'Strategic Thinking with AI', 22, $json$[
  {
    "id": "d10_s1",
    "type": "info",
    "title": "Welcome to Day 10 — Strategy Mode",
    "body": "Strategy is about seeing patterns, identifying leverage points, and planning moves ahead. AI cannot replace strategic thinking, but it can be your strategy analyst — running frameworks, catching blind spots, and generating options you might not see.",
    "audioUrl": null,
    "primaryButton": "Let's think strategically",
    "xp": 3
  },
  {
    "id": "d10_s2",
    "type": "scenario_card",
    "title": "Your strategy challenge",
    "body": "You are launching a meal kit delivery service for busy professionals. You need: a SWOT analysis to understand your position, a 12-month roadmap, and a go-to-market strategy. Your competitor analysis is due Friday. Let AI help you think through this.",
    "audioUrl": null,
    "primaryButton": "Let's strategize",
    "xp": 3
  },
  {
    "id": "d10_s3",
    "type": "info",
    "title": "AI-powered SWOT analysis",
    "body": "SWOT stands for Strengths, Weaknesses, Opportunities, Threats. AI can generate a thorough SWOT if you give it:\n\n- Your business description\n- Your target market\n- Your competitors\n- Your resources and constraints\n\nPrompt: 'Do a SWOT analysis for [business]. Consider [market factors]. Be specific about [key area].'",
    "audioUrl": null,
    "primaryButton": "I know my SWOT",
    "xp": 3
  },
  {
    "id": "d10_s4",
    "type": "mc",
    "title": "Best use of AI for SWOT",
    "question": "How should you use AI to get the best SWOT analysis?",
    "options": [
      "Ask AI to do the SWOT and use it as-is — AI knows business better than you",
      "Give AI detailed context about your business, market, and competitors, then review and customize the output",
      "Only use AI for the Opportunities and Threats sections"
    ],
    "correct": 1,
    "feedback": [
      "Never use AI output as-is. Strategy needs your judgment.",
      "Yes. The quality of AI's SWOT depends entirely on the context you provide. Then you refine it.",
      "Why limit it? AI can help with all four quadrants."
    ],
    "xp": 10
  },
  {
    "id": "d10_s5",
    "type": "builder",
    "title": "Define your strategic context",
    "fields": [
      {
        "id": "business",
        "label": "Describe the business or product",
        "placeholder": "Meal kit delivery for busy professionals"
      },
      {
        "id": "market",
        "label": "Who is the target market?",
        "placeholder": "Professionals aged 25-45 in urban areas"
      },
      {
        "id": "competitors",
        "label": "Who are the main competitors?",
        "placeholder": "Blue Apron, HelloFresh, local meal prep services"
      }
    ],
    "template": "Strategic context:\n- Business: {{business}}\n- Target market: {{market}}\n- Competitors: {{competitors}}",
    "primaryButton": "Save my context",
    "xp": 20
  },
  {
    "id": "d10_s6",
    "type": "tf",
    "title": "True or false?",
    "question": "AI can generate a complete business strategy that is ready to execute without human review.",
    "correct": false,
    "feedback": [
      "Correct. AI generates ideas and frameworks, but strategy needs human judgment, context, and decision-making.",
      "False. AI is a strategist's assistant, not a replacement. Your business knowledge makes the strategy work."
    ],
    "xp": 5
  },
  {
    "id": "d10_s7",
    "type": "info",
    "title": "Building a roadmap with AI",
    "body": "A good roadmap answers: What are we building? When? Why that order?\n\nAI helps by:\n- Breaking a big goal into phased milestones\n- Identifying dependencies between steps\n- Estimating realistic timelines\n- Suggesting risk mitigation\n\nPrompt: 'Create a 12-month product roadmap for [product]. Key milestones should include [list]. Consider that [constraints].'",
    "audioUrl": null,
    "primaryButton": "Show me the roadmap",
    "xp": 3
  },
  {
    "id": "d10_s8",
    "type": "good_fit",
    "title": "Good fit for AI?",
    "question": "Create a 12-month strategic roadmap for a new SaaS product with milestones, resourcing needs, and risk factors.",
    "correct": "good",
    "feedback": [
      "Yes. Roadmapping is a structure-heavy task where AI excels — it organizes phases and dependencies well.",
      "Right. AI can build a detailed roadmap structure that you then adjust with your specific knowledge."
    ],
    "xp": 5
  },
  {
    "id": "d10_s9",
    "type": "match",
    "title": "Match the strategic tool to its purpose",
    "pairs": [
      {
        "left": "SWOT Analysis",
        "right": "Understand internal strengths/weaknesses and external opportunities/threats"
      },
      {
        "left": "GTM Strategy",
        "right": "Define how to launch and acquire first customers"
      },
      {
        "left": "Product Roadmap",
        "right": "Map milestones and features over time"
      }
    ],
    "xp": 12
  },
  {
    "id": "d10_s10",
    "type": "scenario_card",
    "title": "GTM planning scenario",
    "body": "Your meal kit service is ready to launch in 3 months. You need a go-to-market plan: target audience segments, pricing strategy, launch channels, and first-100-customers plan. AI can generate options for each. Your job is to pick the best ones and make decisions.",
    "audioUrl": null,
    "primaryButton": "Let's plan the launch",
    "xp": 3
  },
  {
    "id": "d10_s11",
    "type": "mc",
    "title": "GTM pricing strategy with AI",
    "question": "You ask AI for pricing strategies. What key context should you include?",
    "options": [
      "Just ask 'What should I charge?' — AI knows standard pricing",
      "Include your cost structure, competitor pricing, target margin, and customer willingness to pay",
      "Ask AI to survey your potential customers about pricing"
    ],
    "correct": 1,
    "feedback": [
      "Too little context for meaningful pricing advice.",
      "Yes. AI needs your specific numbers and market data to generate realistic pricing options.",
      "AI cannot conduct surveys — that is your job."
    ],
    "xp": 10
  },
  {
    "id": "d10_s12",
    "type": "info",
    "title": "Competitive positioning with AI",
    "body": "To position yourself against competitors, ask AI:\n\n'Compare [my product] to [competitor 1], [competitor 2], and [competitor 3]. Use a comparison table. Include: pricing, features, target audience, and unique advantages. Identify gaps in the market I can exploit.'\n\nAI will produce a table showing exactly where you win and where you lose. Use this to sharpen your positioning.",
    "audioUrl": null,
    "primaryButton": "That is actionable",
    "xp": 3
  },
  {
    "id": "d10_s13",
    "type": "fillblank",
    "title": "Fill in the blank",
    "question": "When using AI for strategy, you provide the business ______, and AI provides the frameworks and structure.",
    "answer": "context",
    "aliases": [
      "knowledge",
      "details",
      "information"
    ],
    "feedback": [
      "Exactly. Your business context makes AI's strategic output relevant and actionable.",
      "Close. The answer is 'context' — your specific knowledge is what makes AI strategy useful."
    ],
    "xp": 5
  },
  {
    "id": "d10_s14",
    "type": "quiz",
    "title": "Strategy fundamentals check",
    "questions": [
      {
        "id": "q1",
        "type": "mc",
        "question": "What does SWOT stand for?",
        "options": [
          "Strategy, Work, Opportunity, Timeline",
          "Strengths, Weaknesses, Opportunities, Threats",
          "Structure, Workflow, Output, Testing"
        ],
        "correct": 1
      },
      {
        "id": "q2",
        "type": "mc",
        "question": "What is the most important input for AI strategy generation?",
        "options": [
          "The latest business news",
          "Detailed context about your specific business and market",
          "A list of popular business books"
        ],
        "correct": 1
      },
      {
        "id": "q3",
        "type": "tf",
        "question": "An AI-generated GTM plan should be reviewed and customized before use.",
        "correct": true
      },
      {
        "id": "q4",
        "type": "mc",
        "question": "What is the best format to ask AI for competitive analysis?",
        "options": [
          "'Who are my competitors?'",
          "'Compare my product to specific competitors in a table with pricing, features, and positioning'",
          "'Tell me everything about the market'"
        ],
        "correct": 1
      }
    ],
    "xp": 25
  },
  {
    "id": "d10_s15",
    "type": "reflection",
    "title": "Strategy reflection",
    "questions": [
      {
        "id": "strategy_view",
        "type": "single_choice",
        "label": "How has your view of AI for strategy changed?",
        "options": [
          "I see AI as a useful brainstorming partner for strategy",
          "I trust AI to generate good frameworks but I still make the decisions",
          "I am more skeptical — AI needs too much context to be useful",
          "I did not realize AI could help with structured planning like roadmaps"
        ]
      },
      {
        "id": "strategy_apply",
        "type": "textarea",
        "label": "What business problem would you like to run through a strategic analysis with AI?"
      }
    ],
    "xp": 15
  },
  {
    "id": "d10_s16",
    "type": "compare",
    "title": "Compare your strategic thinking",
    "question": "Compare how you would approach a strategic problem before this lesson vs after. How does having an AI strategy analyst change your process?",
    "primaryButton": "I see the difference",
    "xp": 10
  },
  {
    "id": "d10_s17",
    "type": "completion",
    "title": "Day 10 complete!",
    "body": "You now know how to use AI as your strategy analyst. SWOT analysis, product roadmaps, GTM planning, competitive positioning — these are no longer daunting tasks. Your job is to provide context. AI provides structure. Together you produce strategy that is both rigorous and practical. Tomorrow: AI for marketing.",
    "primaryButton": "On to Day 11"
  }
]$json$::jsonb
from units u join programs p on p.id = u.program_id
where p.slug = 'ai_for_everyone' and u.order_num = 10
on conflict (unit_id, order_num) do nothing;
