-- PREVIEW SEED — review & approve before applying with the service key.
-- Program: ai_for_everyone  Unit 11 (Day 11)  Lesson 1
-- AI for Marketing — Email campaigns, CRM, sales funnels, and outreach

insert into programs (slug, title, subtitle, unit_label, artifact_label)
values ('ai_for_everyone', 'AI for Everyone', '28 days to AI confidence', 'Day', 'Artifact')
on conflict (slug) do nothing;

insert into units (program_id, order_num, label, title, theme)
select id, 11, 'Day 11', 'AI for Marketing', ''
from programs where slug = 'ai_for_everyone'
on conflict (program_id, order_num) do nothing;

insert into lessons (unit_id, order_num, title, est_minutes, steps)
select u.id, 1, 'Building a Marketing Engine with AI', 22, $json$[
  {
    "id": "d11_s1",
    "type": "info",
    "title": "Welcome to Day 11 — Marketing Mode",
    "body": "Marketing is one of AI's strongest use cases. Email sequences, CRM workflows, sales funnels, outreach campaigns — all of these are structured, repeatable processes that AI handles beautifully. Today you will build a complete marketing engine.",
    "audioUrl": null,
    "primaryButton": "Let's market with AI",
    "xp": 3
  },
  {
    "id": "d11_s2",
    "type": "scenario_card",
    "title": "Your marketing mission",
    "body": "You are launching a new online course on digital photography. You need: a targeted email sequence for cold leads, a CRM pipeline from signup to purchase, and a sales funnel that converts readers into buyers. Your budget is $500 and you have no marketing team — just you and AI.",
    "audioUrl": null,
    "primaryButton": "Let's build the engine",
    "xp": 3
  },
  {
    "id": "d11_s3",
    "type": "info",
    "title": "The AI marketing workflow",
    "body": "Your AI marketing engine has four parts:\n\n1. Research — AI identifies target segments and their pain points\n2. Create — AI writes emails, social posts, landing pages\n3. Sequence — AI structures the customer journey\n4. Analyze — AI reviews performance and suggests improvements\n\nYou set the strategy. AI executes the tactics. Together you build a complete marketing operation.",
    "audioUrl": null,
    "primaryButton": "Show me the workflow",
    "xp": 3
  },
  {
    "id": "d11_s4",
    "type": "mc",
    "title": "Building an email sequence with AI",
    "question": "What is the best approach to getting a 5-email cold outreach sequence from AI?",
    "options": [
      "'Write me 5 cold emails.'",
      "'Create a 5-email cold outreach sequence for selling [product] to [target audience]. Each email should have a purpose: intro, value, social proof, objection handling, call to action. Keep tone professional but warm.'",
      "'Write an email about my product.'"
    ],
    "correct": 1,
    "feedback": [
      "Way too vague — AI will give you generic templates.",
      "Yes. Specifying the sequence structure, purpose of each email, audience, and tone produces a ready-to-use sequence.",
      "That is one email, not a sequence."
    ],
    "xp": 10
  },
  {
    "id": "d11_s5",
    "type": "tf",
    "title": "True or false?",
    "question": "A single AI-generated email template can work for every segment of your audience.",
    "correct": false,
    "feedback": [
      "Correct. Different segments need different messaging. AI should tailor each version.",
      "False. Each audience segment has different pain points and needs tailored messaging."
    ],
    "xp": 5
  },
  {
    "id": "d11_s6",
    "type": "info",
    "title": "CRM pipeline design with AI",
    "body": "A CRM pipeline has stages. Each stage needs different messaging:\n\nLead → Contacted → Interested → Proposal → Closed\n\nFor each stage, ask AI to write:\n- The purpose of this stage\n- Key questions to answer\n- Email templates for this stage\n- Trigger to advance to next stage\n\nPrompt: 'Design a CRM pipeline for [business]. Stages: [list]. For each stage, give me the goal, email template, and advancement criteria.'",
    "audioUrl": null,
    "primaryButton": "I see the pipeline",
    "xp": 3
  },
  {
    "id": "d11_s7",
    "type": "builder",
    "title": "Design your outreach campaign",
    "fields": [
      {
        "id": "offer",
        "label": "What are you marketing?",
        "placeholder": "Online course: Digital Photography for Beginners"
      },
      {
        "id": "audience",
        "label": "Describe your target audience",
        "placeholder": "Amateur photographers aged 30-55 who own a DSLR"
      },
      {
        "id": "goal",
        "label": "What is the campaign goal?",
        "placeholder": "Get 100 signups in the first month"
      }
    ],
    "template": "My outreach campaign:\n- Offer: {{offer}}\n- Target audience: {{audience}}\n- Campaign goal: {{goal}}",
    "primaryButton": "Save my campaign plan",
    "xp": 20
  },
  {
    "id": "d11_s8",
    "type": "highlight",
    "title": "Find the marketing tasks for AI",
    "body": "You need to launch an email campaign next week. Tasks include: writing email copy, segmenting your subscriber list, designing landing pages, analyzing past campaign data, A/B testing subject lines, and setting up automated follow-ups.",
    "highlights": [
      "writing email copy",
      "analyzing past campaign data",
      "A/B testing subject lines"
    ],
    "xp": 6
  },
  {
    "id": "d11_s9",
    "type": "match",
    "title": "Match marketing tactic to AI prompt",
    "pairs": [
      {
        "left": "Email sequence",
        "right": "Ask for multi-email journey with purpose per email"
      },
      {
        "left": "Sales funnel",
        "right": "Ask for stages from awareness to conversion"
      },
      {
        "left": "A/B test variants",
        "right": "Ask for multiple versions with different hooks"
      }
    ],
    "xp": 12
  },
  {
    "id": "d11_s10",
    "type": "info",
    "title": "Sales funnel design with AI",
    "body": "A sales funnel maps the customer journey:\n\nAwareness → Interest → Decision → Action\n\nFor each stage, ask AI:\n- What content does the customer need?\n- What questions are they asking?\n- What will move them to the next stage?\n\nAI can generate a complete funnel map: content for top-of-funnel (blog posts, social), middle-of-funnel (case studies, demos), and bottom-of-funnel (pricing, testimonials).",
    "audioUrl": null,
    "primaryButton": "I understand funnels",
    "xp": 3
  },
  {
    "id": "d11_s11",
    "type": "good_fit",
    "title": "Good fit for AI?",
    "question": "Write 10 variations of a Facebook ad headline for a fitness app targeting new parents who want to get back in shape.",
    "correct": "good",
    "feedback": [
      "Yes. Generating many variations for A/B testing is one of AI's best marketing use cases.",
      "Right. AI can rapidly generate creative variations, saving hours of brainstorming time."
    ],
    "xp": 5
  },
  {
    "id": "d11_s12",
    "type": "scenario_card",
    "title": "The follow-up sequence strategy",
    "body": "Someone downloaded your free guide but did not buy. This is 70% of your leads. AI can write a 3-email reactivation sequence: (1) Value reminder — did you use the guide? (2) Social proof — here is how others benefited (3) Offer — limited-time discount. Each email is tailored to the 'downloaded but did not buy' segment.",
    "audioUrl": null,
    "primaryButton": "That converts",
    "xp": 3
  },
  {
    "id": "d11_s13",
    "type": "mc",
    "title": "Segment-based email strategy",
    "question": "A new subscriber and a past customer both need an email. How should they differ?",
    "options": [
      "Send the same welcome email to both — consistency matters",
      "New subscriber: introduction and value. Past customer: upsell and loyalty rewards.",
      "Only email past customers — new subscribers are not ready yet"
    ],
    "correct": 1,
    "feedback": [
      "Different segments need different messaging for maximum relevance.",
      "Yes. Treat new and existing relationships differently — the content match the relationship stage.",
      "You are ignoring your warmest leads."
    ],
    "xp": 10
  },
  {
    "id": "d11_s14",
    "type": "paste_capture",
    "title": "Paste a marketing piece to analyze",
    "body": "Paste a marketing email, ad, or landing page you have received recently. In the next steps you will analyze and improve it with AI techniques.",
    "minLength": 50,
    "xp": 8
  },
  {
    "id": "d11_s15",
    "type": "reflection",
    "title": "Marketing reflection",
    "questions": [
      {
        "id": "marketing_impact",
        "type": "single_choice",
        "label": "What is the biggest advantage of AI in marketing?",
        "options": [
          "Speed — create campaigns in hours instead of days",
          "Personalization — tailor messages to every segment",
          "Volume — run more campaigns simultaneously",
          "Testing — A/B test many variations quickly"
        ]
      },
      {
        "id": "marketing_apply",
        "type": "textarea",
        "label": "What marketing campaign would you build with AI?"
      }
    ],
    "xp": 15
  },
  {
    "id": "d11_s16",
    "type": "compare",
    "title": "Compare your marketing process",
    "question": "Compare how you would build an email campaign manually vs with AI. Which parts get faster? Which parts still need your human judgment?",
    "primaryButton": "I see the efficiency",
    "xp": 10
  },
  {
    "id": "d11_s17",
    "type": "completion",
    "title": "Day 11 complete!",
    "body": "You now know how to build a complete marketing engine with AI: email sequences with purpose per email, CRM pipelines mapped to customer stages, sales funnels from awareness to action, and personalized campaigns for different segments. Tomorrow is completely different — you will build an app with AI.",
    "primaryButton": "On to Day 12"
  }
]$json$::jsonb
from units u join programs p on p.id = u.program_id
where p.slug = 'ai_for_everyone' and u.order_num = 11
on conflict (unit_id, order_num) do nothing;
