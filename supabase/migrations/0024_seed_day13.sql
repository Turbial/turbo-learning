-- PREVIEW SEED — review & approve before applying with the service key.
-- Program: ai_for_everyone  Unit 13 (Day 13)  Lesson 1
-- AI for Design & Media — Images, videos, creative assets

insert into programs (slug, title, subtitle, unit_label, artifact_label)
values ('ai_for_everyone', 'AI for Everyone', '28 days to AI confidence', 'Day', 'Artifact')
on conflict (slug) do nothing;

insert into units (program_id, order_num, label, title, theme)
select id, 13, 'Day 13', 'AI for Design & Media', ''
from programs where slug = 'ai_for_everyone'
on conflict (program_id, order_num) do nothing;

insert into lessons (unit_id, order_num, title, est_minutes, steps)
select u.id, 1, 'Creating Visual Content with AI', 20, $json$[
  {
    "id": "d13_s1",
    "type": "info",
    "title": "Welcome to Day 13 — Design & Media",
    "body": "You do not need to be a designer to create professional visuals. AI image generators, video tools, and design assistants let anyone create brand-quality assets. Today you will learn how to generate images, videos, and creative assets that look professional.",
    "audioUrl": null,
    "primaryButton": "Let's create visuals",
    "xp": 3
  },
  {
    "id": "d13_s2",
    "type": "scenario_card",
    "title": "Your design mission",
    "body": "You need a complete ad campaign for your online store: a hero image for the website, 3 social media graphics, a 15-second video ad, and brand colors that tie everything together. You have no design budget. Your only tool is AI. Can you create professional assets? Yes — and by the end of today you will know exactly how.",
    "audioUrl": null,
    "primaryButton": "Show me the tools",
    "xp": 3
  },
  {
    "id": "d13_s3",
    "type": "info",
    "title": "AI design tools at a glance",
    "body": "The AI design toolkit:\n\n- Midjourney — Best for artistic, high-quality images. Runs in Discord.\n- DALL-E — Built into ChatGPT. Good for practical, understandable images.\n- Canva AI — Design tool with AI generation built in. Best for social media graphics.\n- Runway & Pika — AI video generation. Create short clips from text.\n- Adobe Firefly — Professional-grade AI for brand assets.\n\nPick one to start. Master the prompt format. Then expand.",
    "audioUrl": null,
    "primaryButton": "Which tool first?",
    "xp": 3
  },
  {
    "id": "d13_s4",
    "type": "mc",
    "title": "Writing an image prompt",
    "question": "Which prompt will produce the best AI-generated image?",
    "options": [
      "'A cat'",
      "'A fluffy orange tabby cat sitting on a wooden desk next to a laptop in a sunlit home office, warm natural lighting, photorealistic style, 4K'",
      "'Create an image of an animal'"
    ],
    "correct": 1,
    "feedback": [
      "Too vague — AI will give you a generic result.",
      "Yes. Great image prompts include: subject, environment, lighting, style, and quality level.",
      "Way too broad for a professional result."
    ],
    "xp": 10
  },
  {
    "id": "d13_s5",
    "type": "info",
    "title": "The anatomy of a great image prompt",
    "body": "Professional AI image prompts have four parts:\n\n1. Subject — What is in the image? Be specific.\n2. Environment — Where is it? Background, setting.\n3. Lighting & Mood — Warm, dramatic, natural, cinematic?\n4. Style — Photorealistic, illustration, 3D render, watercolor?\n\nExample: 'A minimalist desk setup with a ceramic coffee cup and a small plant, soft morning light from a window, clean white workspace, photorealistic, 4K, shot from above.'",
    "audioUrl": null,
    "primaryButton": "I see the structure",
    "xp": 3
  },
  {
    "id": "d13_s6",
    "type": "tf",
    "title": "True or false?",
    "question": "When generating brand assets with AI, you can use the same prompt across different tools (Midjourney, DALL-E, Canva) and get identical results.",
    "correct": false,
    "feedback": [
      "Correct. Each tool interprets prompts differently. You need to adjust prompts per platform.",
      "False. Each AI model has its own style and interpretation. Tune prompts per tool."
    ],
    "xp": 5
  },
  {
    "id": "d13_s7",
    "type": "highlight",
    "title": "Find the design tasks AI helps with",
    "body": "You are creating a social media campaign for a bakery. Tasks include: generating hero images of pastries, creating Instagram story templates, editing product photos, designing a logo, writing ad copy overlays, and filming a behind-the-scenes video.",
    "highlights": [
      "generating hero images of pastries",
      "creating Instagram story templates",
      "designing a logo"
    ],
    "xp": 6
  },
  {
    "id": "d13_s8",
    "type": "good_fit",
    "title": "Good fit for AI?",
    "question": "Generate a photorealistic image of a product that does not exist yet — a new type of ergonomic keyboard with a curved wooden frame and glowing keys.",
    "correct": "good",
    "feedback": [
      "Yes. AI excels at imagining and visualizing products that do not exist yet.",
      "Right. AI image generation is perfect for concept visualization and prototyping."
    ],
    "xp": 5
  },
  {
    "id": "d13_s9",
    "type": "match",
    "title": "Match the tool to its strength",
    "pairs": [
      {
        "left": "Midjourney",
        "right": "Best artistic, high-quality image generation"
      },
      {
        "left": "Canva AI",
        "right": "Best for templates and social media graphics"
      },
      {
        "left": "Runway / Pika",
        "right": "Best for AI-generated video clips"
      }
    ],
    "xp": 12
  },
  {
    "id": "d13_s10",
    "type": "info",
    "title": "Maintaining visual brand consistency",
    "body": "Brand consistency with AI takes planning:\n\n1. Define your color palette — and include hex codes in prompts\n2. Define your style — 'flat illustration', 'minimalist photography'\n3. Use the same seed or reference image when possible\n4. Create a style guide prompt that you reuse\n5. Test and iterate — the first output is rarely perfect\n\nPro tip: Save your best prompts in a document. Your 'brand prompt library' becomes reusable across all your content.",
    "audioUrl": null,
    "primaryButton": "I will build a prompt library",
    "xp": 3
  },
  {
    "id": "d13_s11",
    "type": "builder",
    "title": "Plan your brand visual identity",
    "fields": [
      {
        "id": "brand",
        "label": "What brand are you designing for?",
        "placeholder": "Artisan coffee shop called 'Bean & Brew'"
      },
      {
        "id": "style",
        "label": "Describe the visual style you want",
        "placeholder": "Warm, rustic, hand-drawn illustrations with earth tones"
      },
      {
        "id": "assets",
        "label": "What assets do you need to create?",
        "placeholder": "Logo, 3 social media posts, hero image for website, menu card"
      }
    ],
    "template": "Brand visual plan:\n- Brand: {{brand}}\n- Visual style: {{style}}\n- Assets needed: {{assets}}",
    "primaryButton": "Save my brand identity plan",
    "xp": 20
  },
  {
    "id": "d13_s12",
    "type": "mc",
    "title": "Iterating on design outputs",
    "question": "AI generated an image that is close but not exactly right. What should you do?",
    "options": [
      "Accept it — close enough is good enough",
      "Iterate: tell AI what you want changed specifically (colors, composition, style) and generate again",
      "Switch to a completely different prompt and start over"
    ],
    "correct": 1,
    "feedback": [
      "Design is in the details. Keep iterating until it is right.",
      "Yes. Iterative refinement is the key to great AI design. Be specific about what to change.",
      "You lose the progress you already made. Iterate, do not restart."
    ],
    "xp": 10
  },
  {
    "id": "d13_s13",
    "type": "reflection",
    "title": "Design reflection",
    "questions": [
      {
        "id": "design_power",
        "type": "single_choice",
        "label": "What excites you most about AI design?",
        "options": [
          "I can create professional visuals without design skills",
          "I can iterate on ideas much faster",
          "I can generate visuals for content I would have skipped before",
          "I can maintain brand consistency across all my content"
        ]
      },
      {
        "id": "design_apply",
        "type": "textarea",
        "label": "What visual content would you create with AI first?"
      }
    ],
    "xp": 15
  },
  {
    "id": "d13_s14",
    "type": "compare",
    "title": "Compare your design process",
    "question": "Compare the traditional design process (hire a designer, brief them, wait for drafts, revise) vs the AI process (describe, generate, iterate in minutes). How does this change what you can produce?",
    "primaryButton": "AI design is faster",
    "xp": 10
  },
  {
    "id": "d13_s15",
    "type": "completion",
    "title": "Day 13 complete!",
    "body": "You now understand the AI design toolkit: image generation with Midjourney/DALL-E, templates with Canva, video with Runway/Pika. You know how to write great prompts (subject, environment, lighting, style) and iterate toward the perfect result. Tomorrow — the Week 2 evaluation where you put everything together.",
    "primaryButton": "On to Day 14"
  }
]$json$::jsonb
from units u join programs p on p.id = u.program_id
where p.slug = 'ai_for_everyone' and u.order_num = 13
on conflict (unit_id, order_num) do nothing;
