-- PREVIEW SEED — review & approve before applying with the service key.
-- Program: ai_for_everyone  Unit 8 (Day 8)  Lesson 1
-- Writing & Content Systems — Build a content pipeline with AI

insert into programs (slug, title, subtitle, unit_label, artifact_label)
values ('ai_for_everyone', 'AI for Everyone', '28 days to AI confidence', 'Day', 'Artifact')
on conflict (slug) do nothing;

insert into units (program_id, order_num, label, title, theme)
select id, 8, 'Day 8', 'Writing & Content Systems', ''
from programs where slug = 'ai_for_everyone'
on conflict (program_id, order_num) do nothing;

insert into lessons (unit_id, order_num, title, est_minutes, steps)
select u.id, 1, 'Building Your AI Content Pipeline', 20, $json$[
  {
    "id": "d8_s1",
    "type": "info",
    "title": "Welcome to Week 2 — AI for Real Work",
    "body": "Welcome to Week 2. The training wheels are off. This week you will use AI to do real work: write content, research, plan strategy, market, code, and design. Today starts with writing — the most common real-world AI use case.",
    "audioUrl": null,
    "primaryButton": "Let's build content",
    "xp": 3
  },
  {
    "id": "d8_s2",
    "type": "scenario_card",
    "title": "Meet your content challenge",
    "body": "You run a small business blog. You need to publish one article, three social posts, and a landing page every week. Doing it manually takes 12 hours. With AI, you can do it in 2 hours. Today you will build a complete content pipeline that keeps your brand voice consistent across everything.",
    "audioUrl": null,
    "primaryButton": "I need that system",
    "xp": 3
  },
  {
    "id": "d8_s3",
    "type": "info",
    "title": "The content pipeline model",
    "body": "A content pipeline turns one idea into multiple assets:\n\n1. Idea → Outline (AI helps you structure)\n2. Outline → Full blog post (AI drafts it)\n3. Blog post → Social snippets (AI repurposes)\n4. Blog post → Ad copy (AI adapts format)\n5. Everything → Consistency check (you review brand voice)\n\nThe key is working from ONE source of truth — never start from scratch.",
    "audioUrl": null,
    "primaryButton": "Show me the flow",
    "xp": 3
  },
  {
    "id": "d8_s4",
    "type": "mc",
    "title": "Best practice for content repurposing",
    "question": "What is the most efficient way to create a month of content?",
    "options": [
      "Write each post fresh every day with AI",
      "Create one core piece of content and repurpose it into multiple formats",
      "Hire a human writer and only use AI for editing"
    ],
    "correct": 1,
    "feedback": [
      "Too much work — AI still needs direction.",
      "Exactly. One core idea becomes a blog, 5 social posts, and 3 ads — maximum output, minimum input.",
      "That works but misses the efficiency AI enables."
    ],
    "xp": 10
  },
  {
    "id": "d8_s5",
    "type": "info",
    "title": "Setting your brand voice",
    "body": "Before you generate anything, define your brand voice. AI needs clear guardrails:\n\n- Formal vs casual? \"We believe\" vs \"We think\"\n- Short or long sentences?\n- Use humor? Emojis?\n- Target audience language\n\nJust one paragraph describing your voice transforms AI output from generic to on-brand.",
    "audioUrl": null,
    "primaryButton": "I see why voice matters",
    "xp": 3
  },
  {
    "id": "d8_s6",
    "type": "builder",
    "title": "Define your brand voice",
    "fields": [
      {
        "id": "brand_name",
        "label": "Your brand or business name",
        "placeholder": "My Creative Studio"
      },
      {
        "id": "voice_type",
        "label": "Describe your brand voice (professional, casual, humorous, etc.)",
        "placeholder": "Friendly but professional, like a knowledgeable friend"
      },
      {
        "id": "audience",
        "label": "Who is your target audience?",
        "placeholder": "Small business owners aged 25-45"
      }
    ],
    "template": "Brand voice profile:\n- Brand: {{brand_name}}\n- Voice: {{voice_type}}\n- Audience: {{audience}}",
    "primaryButton": "Save my brand voice",
    "xp": 20
  },
  {
    "id": "d8_s7",
    "type": "good_fit",
    "title": "Good fit for AI?",
    "question": "Turn a 30-minute podcast transcript into a blog summary, 5 quote cards for social media, and a newsletter intro.",
    "correct": "good",
    "feedback": [
      "Yes. Repurposing one piece of content into many formats is exactly what AI excels at.",
      "Right. AI transforms long-form content into multiple assets effortlessly."
    ],
    "xp": 5
  },
  {
    "id": "d8_s8",
    "type": "info",
    "title": "The blog generation workflow",
    "body": "Your AI blog workflow in 4 steps:\n\n1. Give AI your topic + brand voice description\n2. Ask for an outline with 3-5 sections\n3. Review the outline, adjust, then expand\n4. Get a full draft\n\nPro tip: Include an example of a blog post you love. AI learns from examples better than instructions alone.",
    "audioUrl": null,
    "primaryButton": "Let me try",
    "xp": 3
  },
  {
    "id": "d8_s9",
    "type": "fillblank",
    "title": "Fill in the blank",
    "question": "To get better blog content from AI, provide an ______ of writing you admire along with your instructions.",
    "answer": "example",
    "aliases": [
      "sample",
      "reference",
      "model"
    ],
    "feedback": [
      "Correct. Examples give AI a target to match, not just abstract instructions.",
      "Close. The answer is 'example' — showing AI what you want works better than describing it."
    ],
    "xp": 5
  },
  {
    "id": "d8_s10",
    "type": "highlight",
    "title": "Find the blog repurposing opportunities",
    "body": "You just published a 1500-word blog post titled '10 Productivity Tools for Remote Teams.' You need a Twitter thread, a LinkedIn post, an email newsletter, 3 Instagram quote cards, and a podcast intro script from it.",
    "highlights": [
      "Twitter thread",
      "LinkedIn post",
      "email newsletter",
      "3 Instagram quote cards",
      "podcast intro script"
    ],
    "xp": 6
  },
  {
    "id": "d8_s11",
    "type": "match",
    "title": "Match content type to AI prompt approach",
    "pairs": [
      {
        "left": "Blog post",
        "right": "Provide topic + outline + brand voice"
      },
      {
        "left": "Social media post",
        "right": "Give main idea + character limit + tone"
      },
      {
        "left": "Ad copy",
        "right": "Specify audience + benefit + call to action"
      }
    ],
    "xp": 12
  },
  {
    "id": "d8_s12",
    "type": "info",
    "title": "Social media content at scale",
    "body": "One blog post can generate a week of social content:\n\nFrom 1 blog → create:\n- 1 Twitter/X thread (5-10 tweets)\n- 2 LinkedIn posts (different angles)\n- 1 Instagram caption\n- 1 email newsletter blurb\n\nTell AI: 'Repurpose this blog for [platform]. Keep our brand voice. Format for the platform.'",
    "audioUrl": null,
    "primaryButton": "That is efficient",
    "xp": 3
  },
  {
    "id": "d8_s13",
    "type": "scenario_card",
    "title": "Real scenario: Content calendar in 15 minutes",
    "body": "You need a week of content for your business launch. You have 15 minutes. Strategy: Pick one core topic → Have AI write a brief blog → Repurpose into 7 social posts → Review and schedule. 15 minutes for a full week of content.",
    "audioUrl": null,
    "primaryButton": "Let me build that",
    "xp": 3
  },
  {
    "id": "d8_s14",
    "type": "mc",
    "title": "Quality control check",
    "question": "After AI generates your content, what is your most important review step?",
    "options": [
      "Check spelling and grammar only",
      "Verify brand voice consistency and factual accuracy",
      "Rewrite everything from scratch"
    ],
    "correct": 1,
    "feedback": [
      "Important, but not the most critical check.",
      "Yes. Voice and accuracy are what make content trustworthy and on-brand.",
      "That defeats the purpose of AI. You edit, not rewrite."
    ],
    "xp": 10
  },
  {
    "id": "d8_s15",
    "type": "builder",
    "title": "Plan your content strategy",
    "fields": [
      {
        "id": "topic",
        "label": "What topic do you want to build content around?",
        "placeholder": "Starting an online store"
      },
      {
        "id": "formats",
        "label": "What formats will you create? (comma separated)",
        "placeholder": "blog post, Twitter thread, LinkedIn post, email"
      },
      {
        "id": "frequency",
        "label": "How often will you post?",
        "placeholder": "1 blog per week, 3 social posts per week"
      }
    ],
    "template": "My content strategy:\n- Topic: {{topic}}\n- Formats: {{formats}}\n- Frequency: {{frequency}}",
    "primaryButton": "Save my strategy",
    "xp": 20
  },
  {
    "id": "d8_s16",
    "type": "reflection",
    "title": "Reflect on your content pipeline",
    "questions": [
      {
        "id": "biggest_shift",
        "type": "single_choice",
        "label": "What is the biggest shift AI brings to content creation?",
        "options": [
          "Speed — produce content 5x faster",
          "Volume — create more content than before",
          "Consistency — maintain brand voice everywhere",
          "Quality — AI writes better than most people"
        ]
      },
      {
        "id": "content_goal",
        "type": "textarea",
        "label": "What content do you actually want to create with AI?"
      }
    ],
    "xp": 15
  },
  {
    "id": "d8_s17",
    "type": "compare",
    "title": "Compare manual vs AI content creation",
    "question": "Think about writing a blog post + social media package manually vs with AI. Estimate the time difference. What will you do with the hours you save?",
    "primaryButton": "I see the value",
    "xp": 10
  },
  {
    "id": "d8_s18",
    "type": "completion",
    "title": "Day 8 complete!",
    "body": "You now have a working content pipeline strategy. You know how to take one idea, build it into a blog post with AI, and repurpose it across social media — all while keeping your brand voice consistent. Tomorrow: AI as a research assistant.",
    "primaryButton": "On to Day 9"
  }
]$json$::jsonb
from units u join programs p on p.id = u.program_id
where p.slug = 'ai_for_everyone' and u.order_num = 8
on conflict (unit_id, order_num) do nothing;
