-- PREVIEW SEED — review & approve before applying with the service key.
-- Program: ai_for_everyone  Unit 12 (Day 12)  Lesson 1
-- AI for Coding — Build a working app with AI

insert into programs (slug, title, subtitle, unit_label, artifact_label)
values ('ai_for_everyone', 'AI for Everyone', '28 days to AI confidence', 'Day', 'Artifact')
on conflict (slug) do nothing;

insert into units (program_id, order_num, label, title, theme)
select id, 12, 'Day 12', 'AI for Coding', ''
from programs where slug = 'ai_for_everyone'
on conflict (program_id, order_num) do nothing;

insert into lessons (unit_id, order_num, title, est_minutes, steps)
select u.id, 1, 'Building Apps with AI', 22, $json$[
  {
    "id": "d12_s1",
    "type": "info",
    "title": "Welcome to Day 12 — Coding with AI",
    "body": "Here is the truth: you do not need to know how to code to build with AI. You need to know how to describe what you want clearly. AI handles the syntax. You handle the vision. Today you will learn the workflow to build a working application — even if you have never written a line of code.",
    "audioUrl": null,
    "primaryButton": "I am ready to build",
    "xp": 3
  },
  {
    "id": "d12_s2",
    "type": "scenario_card",
    "title": "Your app-building challenge",
    "body": "You want a simple tool: a task manager for your small team. You could spend weeks learning React and databases. Or you can describe it to AI and have a working prototype in 30 minutes. By the end of today, you will know the exact process to build any simple app with AI.",
    "audioUrl": null,
    "primaryButton": "Let's build it",
    "xp": 3
  },
  {
    "id": "d12_s3",
    "type": "info",
    "title": "The AI coding workflow",
    "body": "Building software with AI follows this process:\n\n1. Describe your app in plain language (what does it do?)\n2. Ask AI to break it into components (pages, features, data)\n3. Generate code one piece at a time\n4. Test each piece before moving on\n5. Ask AI to fix errors by pasting the error message\n\nMost of the work is describing what you want. AI does the typing.",
    "audioUrl": null,
    "primaryButton": "I see the workflow",
    "xp": 3
  },
  {
    "id": "d12_s4",
    "type": "mc",
    "title": "Best first step when building an app with AI",
    "question": "You want to build a calorie tracker app. What is the best first prompt to give AI?",
    "options": [
      "'Write the code for a calorie tracker app.'",
      "'I want to build a calorie tracker. Let us start with the high-level design. What components, pages, and data would this app need?'",
      "'Build me a complete app in one go.'"
    ],
    "correct": 1,
    "feedback": [
      "Too vague — AI will guess and likely get it wrong.",
      "Yes. Start with architecture and design before code. Plan first, build second.",
      "AI will try, but any complex app in one shot will have bugs and poor architecture."
    ],
    "xp": 10
  },
  {
    "id": "d12_s5",
    "type": "info",
    "title": "Tools for AI-powered coding",
    "body": "Different tools for different needs:\n\n- ChatGPT — Great for generating code snippets and explaining concepts\n- Claude — Excellent for full app architecture and complex logic\n- Cursor — Best for interactive coding — edit code in real-time with AI\n- GitHub Copilot — Best if you already code — autocomplete as you type\n\nFor beginners: start with Claude or ChatGPT. Describe the app. Generate code. Test in a browser.",
    "audioUrl": null,
    "primaryButton": "Which tool for me?",
    "xp": 3
  },
  {
    "id": "d12_s6",
    "type": "builder",
    "title": "Plan your first app",
    "fields": [
      {
        "id": "app_name",
        "label": "What app do you want to build?",
        "placeholder": "Team task manager"
      },
      {
        "id": "features",
        "label": "What are the 2-3 core features?",
        "placeholder": "Add tasks, assign to team members, mark complete"
      },
      {
        "id": "users",
        "label": "Who will use this app?",
        "placeholder": "My 5-person team"
      }
    ],
    "template": "My app plan:\n- App: {{app_name}}\n- Core features: {{features}}\n- Users: {{users}}",
    "primaryButton": "Save my app plan",
    "xp": 20
  },
  {
    "id": "d12_s7",
    "type": "tf",
    "title": "True or false?",
    "question": "When AI generates code with errors, you should start over from scratch.",
    "correct": false,
    "feedback": [
      "Correct. You should paste the error message to AI and ask it to fix the specific issue.",
      "False. Debugging is normal — just paste the error to AI and let it suggest fixes."
    ],
    "xp": 5
  },
  {
    "id": "d12_s8",
    "type": "highlight",
    "title": "Find the coding tasks AI handles best",
    "body": "You want to build a simple landing page. Tasks include: writing the HTML structure, designing CSS styles, adding a contact form, setting up a database, deploying to a server, and testing on mobile devices.",
    "highlights": [
      "writing the HTML structure",
      "designing CSS styles",
      "adding a contact form"
    ],
    "xp": 6
  },
  {
    "id": "d12_s9",
    "type": "good_fit",
    "title": "Good fit for AI?",
    "question": "Design a complete database schema for an e-commerce platform with users, products, orders, and inventory tables.",
    "correct": "good",
    "feedback": [
      "Yes. Schema design is structured and logical — AI excels at this.",
      "Right. Database schema design follows clear patterns that AI handles well."
    ],
    "xp": 5
  },
  {
    "id": "d12_s10",
    "type": "info",
    "title": "The iterative building loop",
    "body": "Building with AI is a loop:\n\n1. Ask AI to generate a piece of the app\n2. Test it — does it work?\n3. If it breaks, paste the error to AI: 'I got this error: [paste]. Fix it.'\n4. If it works but you want changes: 'Can you change [specific thing] to [different thing]?'\n5. Repeat until done\n\nEach iteration takes 30 seconds. In 20 cycles, you have a working app.",
    "audioUrl": null,
    "primaryButton": "I can do that",
    "xp": 3
  },
  {
    "id": "d12_s11",
    "type": "scenario_card",
    "title": "Real coding moment",
    "body": "You asked AI to build a calculator app. It gave you HTML, CSS, and JavaScript. You opened it in a browser and the buttons do not work. Now what? You copy the error or describe the problem — 'the buttons do nothing when clicked' — and paste it back to AI. It will diagnose and fix within seconds.",
    "audioUrl": null,
    "primaryButton": "I would debug that way",
    "xp": 3
  },
  {
    "id": "d12_s12",
    "type": "mc",
    "title": "Debugging strategy",
    "question": "AI generates code that has a bug. What should you include when asking AI to fix it?",
    "options": [
      "Just say 'Fix the bug' — AI should know what is wrong",
      "Describe what is happening vs what should happen, and paste any error messages",
      "Rewrite the whole thing yourself"
    ],
    "correct": 1,
    "feedback": [
      "AI cannot read your mind. Be specific about the problem.",
      "Yes. Specific + error message = fastest fix. AI can pinpoint the exact line causing the issue.",
      "Why would you do that? You have an AI assistant."
    ],
    "xp": 10
  },
  {
    "id": "d12_s13",
    "type": "quiz",
    "title": "AI coding fundamentals check",
    "questions": [
      {
        "id": "q1",
        "type": "mc",
        "question": "What is the recommended first step when building an app with AI?",
        "options": [
          "Ask for the complete code immediately",
          "Start with high-level design — describe what you want and plan components",
          "Learn to code first, then use AI"
        ],
        "correct": 1
      },
      {
        "id": "q2",
        "type": "mc",
        "question": "When code breaks, what should you do?",
        "options": [
          "Give up and try a different approach",
          "Paste the error to AI and ask it to fix that specific issue",
          "Rewrite from scratch"
        ],
        "correct": 1
      },
      {
        "id": "q3",
        "type": "tf",
        "question": "AI-generated code is always bug-free on the first try.",
        "correct": false
      },
      {
        "id": "q4",
        "type": "mc",
        "question": "Which AI tool is best for beginners building complete apps?",
        "options": [
          "Any tool — the key is good descriptions, not the specific tool",
          "Only Cursor works for building apps",
          "GitHub Copilot exclusively"
        ],
        "correct": 0
      }
    ],
    "xp": 25
  },
  {
    "id": "d12_s14",
    "type": "compare",
    "title": "Compare traditional vs AI-assisted coding",
    "question": "Think about building a simple tool like a to-do list app. Compare the traditional approach (learn coding for weeks, write each line yourself) vs the AI approach (describe, generate, iterate). What is the time difference?",
    "primaryButton": "AI is faster",
    "xp": 10
  },
  {
    "id": "d12_s15",
    "type": "reflection",
    "title": "Coding reflection",
    "questions": [
      {
        "id": "coding_feeling",
        "type": "single_choice",
        "label": "How do you feel about building apps with AI?",
        "options": [
          "Excited — I can build things I never could before",
          "Skeptical — I need to see it work first",
          "Curious — I want to try building something simple",
          "Overwhelmed — it still sounds complex"
        ]
      },
      {
        "id": "first_app",
        "type": "textarea",
        "label": "What is the first app you would try to build with AI?"
      }
    ],
    "xp": 15
  },
  {
    "id": "d12_s16",
    "type": "completion",
    "title": "Day 12 complete!",
    "body": "You now understand the AI coding workflow: describe your app, plan the architecture, generate code in pieces, test each one, and debug by pasting errors. Even with zero coding experience, you can build working applications. Tomorrow — AI for design and media.",
    "primaryButton": "On to Day 13"
  }
]$json$::jsonb
from units u join programs p on p.id = u.program_id
where p.slug = 'ai_for_everyone' and u.order_num = 12
on conflict (unit_id, order_num) do nothing;
