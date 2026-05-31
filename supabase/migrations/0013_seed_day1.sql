-- PREVIEW SEED — review & approve before applying with the service key.
-- Program: ai_for_everyone  Unit 1 (Day 1)  Lesson 1
-- Generated from content/ai_for_everyone/day1.json

insert into programs (slug, title, subtitle, unit_label, artifact_label)
values ('ai_for_everyone', 'AI for Everyone', '28 days to AI confidence — one simple skill at a time', 'Day', 'Artifact')
on conflict (slug) do nothing;

insert into units (program_id, order_num, label, title, theme)
select id, 1, 'Day 1', 'What AI Is, and How to Ask It Well', ''
from programs where slug = 'ai_for_everyone'
on conflict (program_id, order_num) do nothing;

insert into lessons (unit_id, order_num, title, est_minutes, xp_reward, steps)
select u.id, 1, 'Your First Useful Question', 13, 90, $json$[
  {
    "id": "d1_s1",
    "type": "info",
    "title": "Welcome to Day 1",
    "body": "You do not need to be technical, and you do not need to code. You only need to learn one skill: how to ask AI clear, useful questions.",
    "audioUrl": null,
    "primaryButton": "Let's go",
    "xp": 3
  },
  {
    "id": "d1_s2",
    "type": "info",
    "title": "What AI Actually Is",
    "body": "AI is a tool that helps you write, plan, summarize, organize, and explain things. It is genuinely useful for everyday life. It is also not perfect, and it can be confidently wrong.",
    "audioUrl": null,
    "primaryButton": "Continue",
    "xp": 3
  },
  {
    "id": "d1_s3",
    "type": "mc",
    "title": "Quick check",
    "question": "Which sentence best describes AI?",
    "options": [
      "AI is always correct.",
      "AI is a helpful tool that responds to your instructions.",
      "AI only works for programmers.",
      "AI should make all your decisions for you."
    ],
    "correct": 1,
    "feedback": [
      "Not quite — AI can sound sure of itself and still be wrong.",
      "Exactly. It is most useful when you give it clear instructions.",
      "Anyone can use AI today — no coding required.",
      "AI can help you decide, but the decision should stay yours."
    ],
    "xp": 10
  },
  {
    "id": "d1_s4",
    "type": "tf",
    "title": "True or false?",
    "question": "AI answers are always correct, so you never need to double-check them.",
    "correct": false,
    "feedback": [
      "Careful — that is the trap. AI can be wrong even when it sounds confident.",
      "Right. Useful, but always worth a sanity check."
    ],
    "xp": 5
  },
  {
    "id": "d1_s5",
    "type": "scenario_card",
    "title": "Imagine this",
    "body": "It is Monday and your week feels like a lot — work, errands, family, and a pile of messages. Instead of carrying it all in your head, you decide to ask AI to turn the chaos into a simple plan.",
    "audioUrl": null,
    "primaryButton": "Continue",
    "xp": 3
  },
  {
    "id": "d1_s6",
    "type": "example",
    "title": "Here is a good example",
    "prompt": "I feel overwhelmed this week. I work Monday to Friday, need to cook dinner three nights, want to exercise twice, and need time for family. Create a simple, realistic weekly plan.",
    "primaryButton": "Why this works",
    "xp": 3
  },
  {
    "id": "d1_s7",
    "type": "info",
    "title": "The one secret",
    "body": "Good answers come from clear, detailed requests. The more relevant detail you give, the more useful the answer. Vague question, vague answer.",
    "audioUrl": null,
    "primaryButton": "Show me",
    "xp": 3
  },
  {
    "id": "d1_s8",
    "type": "highlight",
    "title": "Spot the useful detail",
    "body": "Tap the helpful details in this request: I work 9 to 5, I have two kids, and I want 30 minutes to exercise each day.",
    "highlights": [
      "I work 9 to 5",
      "two kids",
      "30 minutes to exercise"
    ],
    "xp": 6
  },
  {
    "id": "d1_s9",
    "type": "builder",
    "title": "Build your first prompt",
    "fields": [
      {
        "id": "goal",
        "label": "What do you want AI to help with?",
        "placeholder": "organize my week"
      },
      {
        "id": "context",
        "label": "What should AI know about your situation?",
        "placeholder": "I work 9 to 5 and have two kids"
      },
      {
        "id": "format",
        "label": "What kind of answer do you want?",
        "placeholder": "a simple, realistic schedule"
      }
    ],
    "template": "Help me with {{goal}}. Here is my situation: {{context}}. Please give me {{format}}.",
    "primaryButton": "Generate my prompt",
    "xp": 15
  },
  {
    "id": "d1_s10",
    "type": "copy_action",
    "title": "Copy your prompt",
    "body": "Now copy your prompt and paste it into ChatGPT, Claude, Gemini, or Grok.",
    "sourceStepId": "d1_s9",
    "primaryButton": "I copied it",
    "xp": 5
  },
  {
    "id": "d1_s11",
    "type": "paste_capture",
    "title": "Paste what you got back",
    "body": "Paste the answer the AI gave you. We will save it to your work so you can look back later.",
    "minLength": 20,
    "primaryButton": "Submit",
    "xp": 15
  },
  {
    "id": "d1_s12",
    "type": "reflection",
    "title": "How did it go?",
    "questions": [
      {
        "id": "useful",
        "type": "single_choice",
        "label": "How useful was the answer?",
        "options": [
          "Very useful",
          "Somewhat useful",
          "Confusing",
          "Not useful"
        ]
      },
      {
        "id": "missing",
        "type": "textarea",
        "label": "What was missing, and what detail would you add next time?"
      }
    ],
    "xp": 10
  },
  {
    "id": "d1_s13",
    "type": "info",
    "title": "Why that matters",
    "body": "If the answer felt generic, the problem usually was not the tool — your prompt needed more detail. Noticing that is the whole skill.",
    "audioUrl": null,
    "primaryButton": "Continue",
    "xp": 3
  },
  {
    "id": "d1_s14",
    "type": "compare",
    "title": "Try it two ways",
    "question": "Paste the same prompt into a second AI tool. Which answer did you like better, and why?",
    "primaryButton": "I compared them",
    "xp": 10
  },
  {
    "id": "d1_s15",
    "type": "good_fit",
    "title": "Good fit?",
    "question": "Rewrite my message so it sounds polite and friendly.",
    "correct": "good",
    "feedback": [
      "Yes. Rewriting and adjusting tone is exactly what AI is great at.",
      "Actually this is a great use of AI."
    ],
    "xp": 5
  },
  {
    "id": "d1_s16",
    "type": "info",
    "title": "But not everything",
    "body": "AI is helpful, but some questions need a real expert. For anything about your health, money, or legal situation, treat AI as a starting point, not the final word.",
    "audioUrl": null,
    "primaryButton": "Continue",
    "xp": 3
  },
  {
    "id": "d1_s17",
    "type": "good_fit",
    "title": "Good fit?",
    "question": "Tell me for certain whether I have a serious medical condition.",
    "correct": "notideal",
    "feedback": [
      "Be careful here — this one needs a professional.",
      "Right. For a real diagnosis, see a doctor; AI can only give general information."
    ],
    "xp": 5
  },
  {
    "id": "d1_s18",
    "type": "fillblank",
    "title": "Fill in the blank",
    "question": "For medical, legal, or money questions, it is best to check with a ______.",
    "answer": "professional",
    "aliases": [
      "a professional",
      "expert",
      "specialist",
      "doctor"
    ],
    "feedback": [
      "Exactly — verify important things with a professional.",
      "Close. The key idea: check with a professional for important decisions."
    ],
    "xp": 5
  },
  {
    "id": "d1_s19",
    "type": "match",
    "title": "Match the task to the ask",
    "pairs": [
      {
        "left": "A messy, overwhelming week",
        "right": "Make me a simple plan"
      },
      {
        "left": "A draft email that sounds rude",
        "right": "Make it sound polite"
      },
      {
        "left": "A long article you have no time to read",
        "right": "Summarize the key points"
      }
    ],
    "xp": 15
  },
  {
    "id": "d1_s20",
    "type": "quiz",
    "title": "Quick mastery check",
    "questions": [
      {
        "id": "q1",
        "type": "mc",
        "question": "What makes AI answers better?",
        "options": [
          "Asking faster",
          "Giving clear, relevant detail",
          "Using fancy words"
        ],
        "correct": 1
      },
      {
        "id": "q2",
        "type": "tf",
        "question": "AI can sound confident and still be wrong.",
        "correct": true
      },
      {
        "id": "q3",
        "type": "fillblank",
        "question": "For important health or legal questions, check with a ______.",
        "answer": "professional",
        "aliases": [
          "expert",
          "specialist",
          "doctor"
        ]
      }
    ],
    "xp": 15
  },
  {
    "id": "d1_s21",
    "type": "badge_unlock",
    "badgeSlug": "ai_explorer"
  },
  {
    "id": "d1_s22",
    "type": "streak_commitment",
    "commitOptions": [
      7,
      14,
      28
    ]
  },
  {
    "id": "d1_s23",
    "type": "reminder_setup",
    "reminderOptions": [
      "Morning",
      "Afternoon",
      "Evening"
    ]
  },
  {
    "id": "d1_s24",
    "type": "completion",
    "title": "Day 1 complete",
    "body": "You now know what AI is, where it helps, where it has limits, and how to ask a genuinely useful question — and you built and tested one for real. See you tomorrow.",
    "primaryButton": "Go to my journey"
  }
]$json$::jsonb
from units u join programs p on p.id = u.program_id
where p.slug = 'ai_for_everyone' and u.order_num = 1
on conflict (unit_id, order_num) do nothing;
