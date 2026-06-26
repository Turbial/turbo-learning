-- 20260625000005_seed_prompt_engineering_program.sql
-- Seeds the "AI Prompt Engineering" program with 6 units × 2 lessons.
-- Covers every step type in the lesson engine (23 total).
-- Safe to re-run: skips if program slug already exists.

-- Ensure optional columns exist on programs and units
ALTER TABLE programs ADD COLUMN IF NOT EXISTS emoji       text;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE units    ADD COLUMN IF NOT EXISTS emoji       text;
ALTER TABLE units    ADD COLUMN IF NOT EXISTS goal        text;
ALTER TABLE units    ADD COLUMN IF NOT EXISTS week        integer;

-- Add badges used in this program
INSERT INTO badges (slug, name, icon, unlock_condition) VALUES
  ('prompt_engineer',  'Prompt Engineer',  '✏️',  'Complete Unit 6 Lesson 1'),
  ('ai_practitioner',  'AI Practitioner',  '🤖',  'Complete the full program')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  prog_id uuid;
  u1_id uuid; u2_id uuid; u3_id uuid; u4_id uuid; u5_id uuid; u6_id uuid;
  l1_id  uuid; l2_id  uuid; l3_id  uuid; l4_id  uuid;
  l5_id  uuid; l6_id  uuid; l7_id  uuid; l8_id  uuid;
  l9_id  uuid; l10_id uuid; l11_id uuid; l12_id uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM programs WHERE slug = 'prompt-engineering') THEN
    RAISE NOTICE 'prompt-engineering already seeded — skipping.';
    RETURN;
  END IF;

  prog_id := gen_random_uuid();
  u1_id := gen_random_uuid(); u2_id := gen_random_uuid();
  u3_id := gen_random_uuid(); u4_id := gen_random_uuid();
  u5_id := gen_random_uuid(); u6_id := gen_random_uuid();
  l1_id  := gen_random_uuid(); l2_id  := gen_random_uuid();
  l3_id  := gen_random_uuid(); l4_id  := gen_random_uuid();
  l5_id  := gen_random_uuid(); l6_id  := gen_random_uuid();
  l7_id  := gen_random_uuid(); l8_id  := gen_random_uuid();
  l9_id  := gen_random_uuid(); l10_id := gen_random_uuid();
  l11_id := gen_random_uuid(); l12_id := gen_random_uuid();

  -- ── Program ──────────────────────────────────────────────────────────────
  INSERT INTO programs
    (id, slug, title, subtitle, emoji, description, unit_label, artifact_label, level_names, journey_shape)
  VALUES (
    prog_id,
    'prompt-engineering',
    'AI Prompt Engineering',
    'Master the skill every knowledge worker needs',
    '✏️',
    'Go from AI user to AI operator. Learn how language models work, master prompting from zero-shot to chain-of-thought, build real AI workflows, and use AI responsibly.',
    'Lesson',
    'Prompt',
    ARRAY['Beginner','Apprentice','Practitioner','Expert','Master'],
    'linear'
  );

  -- ── Units ─────────────────────────────────────────────────────────────────
  INSERT INTO units (id, program_id, order_num, label, title, emoji, goal, theme, week) VALUES
    (u1_id, prog_id, 1, 'Unit 1', 'Foundations of AI',    '🧠', 'Understand what LLMs are and how they work',         '#6366f1', 1),
    (u2_id, prog_id, 2, 'Unit 2', 'Prompting Basics',     '💬', 'Write effective zero-shot and few-shot prompts',      '#0ea5e9', 2),
    (u3_id, prog_id, 3, 'Unit 3', 'Advanced Techniques',  '🔬', 'Master chain-of-thought and system prompts',         '#10b981', 3),
    (u4_id, prog_id, 4, 'Unit 4', 'Tools & Agents',       '⚙️', 'Build AI workflows that take real-world actions',    '#f59e0b', 4),
    (u5_id, prog_id, 5, 'Unit 5', 'Safety & Ethics',      '🛡️', 'Understand hallucination and responsible AI use',   '#ef4444', 5),
    (u6_id, prog_id, 6, 'Unit 6', 'Capstone',             '🏆', 'Build a complete AI system and earn your badge',     '#8b5cf6', 6);

  -- ══════════════════════════════════════════════════════════════════════════
  -- UNIT 1 · FOUNDATIONS
  -- Step types introduced: story_chapter, story_scene, info, highlight, mc, tf, completion
  -- ══════════════════════════════════════════════════════════════════════════

  INSERT INTO lessons (id, unit_id, order_num, title, est_minutes, steps)
  VALUES (l1_id, u1_id, 1, 'What Is a Language Model?', 10, $L1$[
    {
      "id": "l1-chapter",
      "type": "story_chapter",
      "episode": 1,
      "act": "Unit 1 · Foundations",
      "title": "What Is a Language Model?",
      "subtitle": "The prediction engine that changed everything"
    },
    {
      "id": "l1-scene1",
      "type": "story_scene",
      "character": "aria",
      "mood": "excited",
      "scene": "lab",
      "dialogue": "Welcome to AI Prompt Engineering. I'm Aria — your guide through this program.\n\nForget the hype. Forget the fear. By the time we're done today you'll understand exactly what a language model is — and why that understanding gives you real power over it."
    },
    {
      "id": "l1-info1",
      "type": "info",
      "title": "What You'll Learn Today",
      "body": "Language models are everywhere. But most people use them without understanding what they actually are.\n\nToday you'll learn:\n• What a language model is at its core\n• Why 'understanding' is the wrong word for what they do\n• How this knowledge makes you a better prompt engineer",
      "xp": 5
    },
    {
      "id": "l1-highlight1",
      "type": "highlight",
      "body": "A language model is not intelligent. It does not understand language the way you do.\n\nInstead, it predicts the most likely next token based on all the text it was trained on. That's it.\n\nBut here's what's remarkable: from that single mechanism — next-token prediction — emerges the ability to write code, translate languages, summarize documents, and hold coherent conversations.\n\nThe magic is in the scale of training data and the architecture. Not in any kind of sentience.",
      "highlights": ["predicts the most likely next token", "next-token prediction", "scale of training data"],
      "xp": 5
    },
    {
      "id": "l1-mc1",
      "type": "mc",
      "question": "What does a large language model fundamentally do?",
      "options": [
        "Searches the internet for the best answer",
        "Predicts the most likely next token based on context",
        "Understands meaning the same way humans do",
        "Retrieves facts from a structured database"
      ],
      "correct": 1,
      "feedback": [
        "Correct. LLMs predict next tokens — that single mechanism produces all the impressive capabilities you see.",
        "LLMs (without retrieval tools) don't search the internet. They generate text based on patterns learned during training."
      ],
      "xp": 10
    },
    {
      "id": "l1-tf1",
      "type": "tf",
      "question": "Language models understand the meaning of text the same way humans do.",
      "correct": false,
      "feedback": [
        "Correct. LLMs process statistical patterns over tokens — not meaning in the human sense. This distinction changes how you write prompts.",
        "LLMs work through statistical prediction, not semantic understanding. Knowing this helps you write better, more precise prompts."
      ],
      "xp": 10
    },
    {
      "id": "l1-completion",
      "type": "completion",
      "title": "Lesson 1 Complete!",
      "body": "You now know what a language model actually is: a next-token predictor trained on vast text data.\n\nNext: the three numbers that define model behavior — tokens, context window, and temperature."
    }
  ]$L1$::jsonb);

  -- ── Step types introduced: fillblank, match, good_fit ─────────────────────

  INSERT INTO lessons (id, unit_id, order_num, title, est_minutes, steps)
  VALUES (l2_id, u1_id, 2, 'Tokens, Context & Temperature', 12, $L2$[
    {
      "id": "l2-info1",
      "type": "info",
      "title": "Three Numbers That Define AI Behavior",
      "body": "Every LLM interaction is shaped by three key concepts:\n\n• Tokens — the units the model reads and writes (~4 characters each)\n• Context window — the maximum tokens the model can process at once\n• Temperature — how creative or deterministic the output is\n\nUnderstand these three and you can predict how a model will behave before you hit send.",
      "xp": 5
    },
    {
      "id": "l2-highlight1",
      "type": "highlight",
      "body": "A token is roughly 4 characters of English text — about ¾ of a word.\n\n'Artificial intelligence' = 4 tokens. 'AI' = 1 token.\n\nThe context window is the total tokens the model can attend to at once — input plus output combined. Exceed it and the model loses earlier parts of the conversation.\n\nTemperature controls randomness. At 0, the model always picks the most likely next token. At 1+, it samples more widely and produces creative, variable output.",
      "highlights": ["roughly 4 characters", "context window", "Temperature controls randomness"],
      "xp": 5
    },
    {
      "id": "l2-mc1",
      "type": "mc",
      "question": "What happens when a conversation exceeds the model's context window?",
      "options": [
        "The model crashes and resets the session",
        "The model starts generating random text",
        "Earlier tokens are dropped and the model loses that context",
        "The response is automatically compressed"
      ],
      "correct": 2,
      "feedback": [
        "Correct. Once the context window is full, the model cannot attend to tokens that fall outside it — they effectively cease to exist for that interaction.",
        "The model doesn't crash — but tokens outside the context window are dropped and the model loses access to that information."
      ],
      "xp": 10
    },
    {
      "id": "l2-fillblank1",
      "type": "fillblank",
      "question": "A token is roughly ___ characters of English text.",
      "answer": "4",
      "aliases": ["four", "~4", "about 4", "around 4", "3-4", "3 to 4"],
      "feedback": [
        "Correct! Roughly 4 characters per token, or about ¾ of a word — so 1,000 tokens ≈ 750 words.",
        "A token is approximately 4 characters. This means 1,000 tokens ≈ 750 words, useful for estimating costs and context usage."
      ],
      "xp": 10
    },
    {
      "id": "l2-match1",
      "type": "match",
      "pairs": [
        { "left": "Temperature = 0",   "right": "Deterministic — always picks the most likely token" },
        { "left": "Temperature = 1+",  "right": "Creative and variable output" },
        { "left": "Context window",    "right": "Max tokens the model can process at once" },
        { "left": "Token",             "right": "~4 characters, the model's unit of text" }
      ],
      "xp": 15
    },
    {
      "id": "l2-goodfit1",
      "type": "good_fit",
      "question": "Using temperature 0.9 when generating a consistent, precise legal contract.",
      "correct": "notideal",
      "feedback": [
        "Correct — high temperature adds randomness, which is exactly what you don't want for legal documents. Use temperature 0–0.2 for precision tasks.",
        "High temperature means high variability. For consistent, precise outputs like contracts, code, or structured data — use low temperature."
      ],
      "xp": 10
    },
    {
      "id": "l2-completion",
      "type": "completion",
      "title": "Lesson 2 Complete!",
      "body": "Tokens, context window, temperature — you now speak the language of model behavior.\n\nUnit 2 starts next: writing your first real prompts with zero-shot and few-shot techniques."
    }
  ]$L2$::jsonb);

  -- ══════════════════════════════════════════════════════════════════════════
  -- UNIT 2 · PROMPTING BASICS
  -- Step types introduced: example, reflection
  -- ══════════════════════════════════════════════════════════════════════════

  INSERT INTO lessons (id, unit_id, order_num, title, est_minutes, steps)
  VALUES (l3_id, u2_id, 1, 'Zero-Shot Prompting', 10, $L3$[
    {
      "id": "l3-chapter",
      "type": "story_chapter",
      "episode": 2,
      "act": "Unit 2 · Prompting Basics",
      "title": "Zero-Shot Prompting",
      "subtitle": "Getting results without examples"
    },
    {
      "id": "l3-scene1",
      "type": "story_scene",
      "character": "coach",
      "mood": "excited",
      "scene": "classroom",
      "dialogue": "Zero-shot prompting is the starting point for every prompt engineer.\n\nNo examples. No templates. Just a clear instruction — and a model that delivers.\n\nSounds simple. But there's a real skill here: knowing what to say, how specific to be, and what to leave out."
    },
    {
      "id": "l3-info1",
      "type": "info",
      "title": "What Is Zero-Shot Prompting?",
      "body": "Zero-shot prompting means giving the model a task with no worked examples.\n\nYou rely entirely on the model's pre-trained knowledge to interpret and execute.\n\nWhen it works well: clear, well-defined tasks similar to what the model saw in training.\n\nWhen it struggles: novel formats, domain-specific outputs, or anything requiring precise structure the model hasn't seen before.",
      "xp": 5
    },
    {
      "id": "l3-example1",
      "type": "example",
      "title": "Zero-Shot: Weak vs. Strong",
      "prompt": "WEAK:\n\"Write something about climate change.\"\n\nSTRONG:\n\"Write a 3-bullet executive summary of the key business risks of climate change for a manufacturing company. Use plain language suitable for a C-suite audience. Each bullet must be one sentence, starting with an action verb.\"\n\nThe difference: specificity of task, format, audience, length, and style — all without any examples."
    },
    {
      "id": "l3-mc1",
      "type": "mc",
      "question": "What is the most important factor in an effective zero-shot prompt?",
      "options": [
        "Making it as short as possible",
        "Including at least one worked example",
        "Being specific about task, format, audience, and constraints",
        "Using technical vocabulary to signal expertise"
      ],
      "correct": 2,
      "feedback": [
        "Correct! Specificity is the key lever — task, format, audience, and constraints reduce ambiguity and guide the model to your intended output.",
        "Including worked examples would make this a few-shot prompt, not zero-shot."
      ],
      "xp": 10
    },
    {
      "id": "l3-tf1",
      "type": "tf",
      "question": "Zero-shot prompting requires at least one example to work effectively.",
      "correct": false,
      "feedback": [
        "Correct — zero-shot means zero examples. The model draws entirely on its training data and your instruction.",
        "Zero-shot prompting uses no examples — that's the whole definition. The model interprets the task from instruction alone."
      ],
      "xp": 10
    },
    {
      "id": "l3-reflection1",
      "type": "reflection",
      "questions": [
        {
          "id": "r1",
          "prompt": "Think of a task you do regularly at work. Write a zero-shot prompt you could use to get AI to help with it.",
          "placeholder": "e.g. Summarize this customer email in 2 sentences, identifying the main request and the sentiment. Use neutral, professional language.",
          "minChars": 30
        },
        {
          "id": "r2",
          "prompt": "What could you add to that prompt to make it more specific? Think about format, audience, length, tone, or constraints.",
          "placeholder": "What extra detail would remove ambiguity?",
          "minChars": 20
        }
      ]
    },
    {
      "id": "l3-completion",
      "type": "completion",
      "title": "Lesson 3 Complete!",
      "body": "Zero-shot mastered. The key insight: specificity beats brevity every time.\n\nNext: few-shot prompting — teaching the model exactly what you want through examples."
    }
  ]$L3$::jsonb);

  -- ── Step types introduced: quiz, builder ──────────────────────────────────

  INSERT INTO lessons (id, unit_id, order_num, title, est_minutes, steps)
  VALUES (l4_id, u2_id, 2, 'Few-Shot Prompting', 14, $L4$[
    {
      "id": "l4-info1",
      "type": "info",
      "title": "Teaching by Showing",
      "body": "Few-shot prompting adds 1–5 worked examples to your prompt before the real task.\n\nInstead of describing what you want, you show it. The model recognizes the pattern and applies it.\n\nThis is especially powerful when:\n• The output format is unusual or specific\n• The tone is hard to describe but easy to demonstrate\n• The task requires domain-specific judgment",
      "xp": 5
    },
    {
      "id": "l4-example1",
      "type": "example",
      "title": "Few-Shot: Sentiment Classification",
      "prompt": "Classify the sentiment of customer reviews as POSITIVE, NEGATIVE, or NEUTRAL.\n\nReview: \"The product arrived on time and works exactly as described.\"\nSentiment: POSITIVE\n\nReview: \"Completely broken out of the box. Waste of money.\"\nSentiment: NEGATIVE\n\nReview: \"It's okay. Does what it's supposed to.\"\nSentiment: NEUTRAL\n\nReview: \"I've bought this three times now. Never disappoints.\"\nSentiment:"
    },
    {
      "id": "l4-mc1",
      "type": "mc",
      "question": "Why does few-shot prompting outperform zero-shot on precise formatting tasks?",
      "options": [
        "It gives the model more tokens to process",
        "It shows the model the exact output pattern you expect",
        "It trains the model on new domain knowledge",
        "It increases the model's effective context window"
      ],
      "correct": 1,
      "feedback": [
        "Exactly. Examples are the clearest possible specification — you show rather than tell, removing all ambiguity about the desired output format.",
        "Few-shot prompting doesn't change the model's parameters or context window — it demonstrates the pattern you want within the prompt itself."
      ],
      "xp": 10
    },
    {
      "id": "l4-goodfit1",
      "type": "good_fit",
      "question": "Using few-shot prompting with three rigid example formats to generate a completely open-ended creative short story.",
      "correct": "notideal",
      "feedback": [
        "Right — few-shot examples constrain the model to follow the shown pattern, which limits creative freedom. For open-ended creative work, zero-shot is usually better.",
        "Few-shot shines for structured, repeatable outputs. For open-ended creative tasks, rigid examples can over-constrain the model."
      ],
      "xp": 10
    },
    {
      "id": "l4-quiz1",
      "type": "quiz",
      "title": "Few-Shot Quick Check",
      "questions": [
        {
          "id": "q1",
          "question": "How many examples does 'one-shot' prompting include?",
          "questionType": "mc",
          "options": ["Zero", "One", "Three to five", "As many as possible"],
          "correct": 1,
          "feedback": [
            "Correct — one-shot means exactly one worked example before the real task.",
            "Zero examples is zero-shot. One-shot = exactly one example."
          ]
        },
        {
          "id": "q2",
          "question": "Few-shot examples permanently update the model's weights with new knowledge.",
          "questionType": "tf",
          "correct": false,
          "feedback": [
            "Correct — in-context examples don't change model weights. They guide inference via pattern recognition within the prompt.",
            "Examples are in-context only — they don't update the model's parameters. The model learns the pattern for this prompt, not permanently."
          ]
        },
        {
          "id": "q3",
          "question": "The technique where a model learns from examples within the prompt context is called ___ learning.",
          "questionType": "fillblank",
          "correct": "in-context",
          "aliases": ["in context", "incontext", "in context learning"],
          "feedback": [
            "Correct! In-context learning — the model applies patterns from examples within the same context window.",
            "The term is 'in-context learning' — learning from examples embedded in the current prompt, without weight updates."
          ]
        }
      ],
      "config": {
        "mode": "one_at_a_time",
        "showResultsAfterEach": true,
        "passingThreshold": 67
      }
    },
    {
      "id": "l4-builder1",
      "type": "builder",
      "fields": [
        { "id": "task",        "label": "What task do you want the model to do?",  "placeholder": "e.g. classify customer emails by topic" },
        { "id": "ex1_input",  "label": "Example 1 — Input",                        "placeholder": "e.g. 'Where is my order?'" },
        { "id": "ex1_output", "label": "Example 1 — Output",                       "placeholder": "e.g. 'SHIPPING_INQUIRY'" },
        { "id": "ex2_input",  "label": "Example 2 — Input",                        "placeholder": "e.g. 'I want a refund'" },
        { "id": "ex2_output", "label": "Example 2 — Output",                       "placeholder": "e.g. 'REFUND_REQUEST'" },
        { "id": "real_input", "label": "Your real input",                           "placeholder": "e.g. 'Can I change my delivery address?'" }
      ],
      "template": "{task}\n\nInput: {ex1_input}\nOutput: {ex1_output}\n\nInput: {ex2_input}\nOutput: {ex2_output}\n\nInput: {real_input}\nOutput:"
    },
    {
      "id": "l4-completion",
      "type": "completion",
      "title": "Lesson 4 Complete!",
      "body": "Zero-shot and few-shot are now in your toolkit.\n\nNext unit: advanced techniques — chain-of-thought and system prompts. The tools that separate operators from users."
    }
  ]$L4$::jsonb);

  -- ══════════════════════════════════════════════════════════════════════════
  -- UNIT 3 · ADVANCED TECHNIQUES
  -- Step types introduced: copy_action, compare, scenario_card, paste_capture
  -- ══════════════════════════════════════════════════════════════════════════

  INSERT INTO lessons (id, unit_id, order_num, title, est_minutes, steps)
  VALUES (l5_id, u3_id, 1, 'Chain-of-Thought Prompting', 12, $L5$[
    {
      "id": "l5-chapter",
      "type": "story_chapter",
      "episode": 3,
      "act": "Unit 3 · Advanced Techniques",
      "title": "Chain-of-Thought Prompting",
      "subtitle": "Make the model show its work"
    },
    {
      "id": "l5-scene1",
      "type": "story_scene",
      "character": "aria",
      "mood": "thinking",
      "scene": "lab",
      "dialogue": "Here's something counterintuitive.\n\nFor complex reasoning tasks, asking the model to answer immediately often gives worse results than asking it to think out loud first.\n\nChain-of-thought prompting fixes this — and the results can be dramatic. A single phrase can cut errors in half."
    },
    {
      "id": "l5-info1",
      "type": "info",
      "title": "What Is Chain-of-Thought?",
      "body": "Chain-of-thought (CoT) prompting asks the model to reason step-by-step before giving its final answer.\n\nTwo approaches:\n1. Zero-shot CoT — append 'Think step by step.' to any prompt\n2. Few-shot CoT — show examples where reasoning is spelled out before the answer\n\nWhy it works: by generating intermediate reasoning steps as text, the model creates 'scratch space' to work through complex problems — much like a human writing out their working.",
      "xp": 5
    },
    {
      "id": "l5-highlight1",
      "type": "highlight",
      "body": "Without CoT: 'Is 17 × 24 > 400?' → Model: 'Yes' (often wrong)\n\nWith CoT: 'Is 17 × 24 > 400? Think step by step.' → Model: '17 × 24 = 17 × 20 + 17 × 4 = 340 + 68 = 408. 408 > 400, so yes.'\n\nThe reasoning step produces not just an answer, but a verifiable one.\n\nThis technique works for math, multi-step logic, analysis, and any task where intermediate steps matter.",
      "highlights": ["Think step by step", "scratch space", "verifiable"],
      "xp": 5
    },
    {
      "id": "l5-mc1",
      "type": "mc",
      "question": "Why does chain-of-thought prompting improve performance on complex tasks?",
      "options": [
        "It gives the model more processing time",
        "It forces the model to generate intermediate reasoning steps as text",
        "It automatically increases the model's temperature",
        "It retrieves more relevant information from training data"
      ],
      "correct": 1,
      "feedback": [
        "Correct. By generating reasoning steps as text, the model creates usable scratch space — each intermediate step feeds into the next, enabling complex multi-step reasoning.",
        "CoT doesn't change timing or temperature. It works by externalizing the reasoning process into text the model can build on."
      ],
      "xp": 10
    },
    {
      "id": "l5-cot-template",
      "type": "info",
      "title": "CoT Template",
      "body": "Task: [describe your task here]\n\nContext: [relevant background information]\n\nQuestion: [your specific question]\n\nThink through this step by step, considering all relevant factors. Then provide your final answer.",
      "xp": 5
    },
    {
      "id": "l5-copy1",
      "type": "copy_action",
      "body": "Copy this chain-of-thought template to use immediately in your own prompts:",
      "sourceStepId": "l5-cot-template"
    },
    {
      "id": "l5-compare1",
      "type": "compare",
      "question": "Take any complex decision you face at work. Write a standard prompt for it. Then write a CoT version. What intermediate reasoning steps does the CoT version surface that the standard prompt misses?"
    },
    {
      "id": "l5-completion",
      "type": "completion",
      "title": "Lesson 5 Complete!",
      "body": "'Think step by step.' is one of the highest-value phrases in prompt engineering. Use it whenever accuracy on complex tasks matters.\n\nNext: system prompts — how to set the model's behavior before the conversation even starts."
    }
  ]$L5$::jsonb);

  INSERT INTO lessons (id, unit_id, order_num, title, est_minutes, steps)
  VALUES (l6_id, u3_id, 2, 'System Prompts & Personas', 13, $L6$[
    {
      "id": "l6-info1",
      "type": "info",
      "title": "The Power of System Prompts",
      "body": "A system prompt is a privileged instruction set given to the model before any user input.\n\nThink of it as the model's job description: it defines who the model is, what it knows, how it should behave, and what it should never do.\n\nGetting this right is the difference between a generic AI assistant and a specialized tool that feels purpose-built for your exact context.",
      "xp": 5
    },
    {
      "id": "l6-scenario1",
      "type": "scenario_card",
      "title": "Real-World Impact",
      "body": "A customer support team replaced their generic AI chatbot with one built on a well-crafted system prompt.\n\nSystem prompt included: company voice and tone, product knowledge base, escalation triggers, things to never say, and response format requirements.\n\nResult: CSAT scores up 34%, escalations down 60%.\n\nSame underlying model. Completely different behavior. The system prompt was the product."
    },
    {
      "id": "l6-example1",
      "type": "example",
      "title": "System Prompt: Before & After",
      "prompt": "BEFORE (generic):\n'You are a helpful assistant.'\n\nAFTER (precise):\n'You are a senior customer success manager at Acme Software. Speak in a warm but concise professional tone. You have deep knowledge of our product line: CRM, Analytics, and API tools. When customers report bugs, collect: browser, OS, steps to reproduce, and expected vs actual behavior. Never promise features or timelines. If you cannot resolve in 3 exchanges, offer to schedule a call with a human specialist.'\n\nEvery sentence in the precise version constrains behavior in a useful way."
    },
    {
      "id": "l6-paste1",
      "type": "paste_capture",
      "body": "Write a system prompt for an AI assistant in your field. Define: the assistant's role, its tone, what it knows, and at least one hard constraint (something it must never do).\n\nPaste it below:",
      "minLength": 50
    },
    {
      "id": "l6-mc1",
      "type": "mc",
      "question": "Which element is most critical in a system prompt for a customer-facing AI?",
      "options": [
        "The model's knowledge cutoff date",
        "Clear role, tone, constraints, and escalation rules",
        "A complete list of competitor products to avoid",
        "The company's full privacy policy verbatim"
      ],
      "correct": 1,
      "feedback": [
        "Correct. Role (who it is), tone (how it sounds), constraints (what it won't do), and escalation rules (when to hand off) are the load-bearing elements of any customer-facing system prompt.",
        "The knowledge cutoff is a model property — you can't set it in a system prompt."
      ],
      "xp": 10
    },
    {
      "id": "l6-reflection1",
      "type": "reflection",
      "questions": [
        {
          "id": "r1",
          "prompt": "What is the single most important constraint you would include in a system prompt for an AI in your industry?",
          "placeholder": "e.g. Never provide specific medical diagnoses; always recommend consulting a licensed physician...",
          "minChars": 20
        },
        {
          "id": "r2",
          "prompt": "What persona or tone would make an AI assistant most effective in your context? Why?",
          "placeholder": "e.g. Formal and precise for legal, warm and patient for healthcare, direct and data-focused for finance...",
          "minChars": 20
        }
      ]
    },
    {
      "id": "l6-completion",
      "type": "completion",
      "title": "Lesson 6 Complete!",
      "body": "System prompts are your most powerful tool for consistent AI behavior.\n\nNext unit: tools and agents — where AI moves from answering questions to taking action in the world."
    }
  ]$L6$::jsonb);

  -- ══════════════════════════════════════════════════════════════════════════
  -- UNIT 4 · TOOLS & AGENTS
  -- Step types introduced: streak_commitment, prompt_generator
  -- ══════════════════════════════════════════════════════════════════════════

  INSERT INTO lessons (id, unit_id, order_num, title, est_minutes, steps)
  VALUES (l7_id, u4_id, 1, 'Function Calling & Tool Use', 11, $L7$[
    {
      "id": "l7-chapter",
      "type": "story_chapter",
      "episode": 4,
      "act": "Unit 4 · Tools & Agents",
      "title": "Function Calling & Tool Use",
      "subtitle": "AI that doesn't just talk — it acts"
    },
    {
      "id": "l7-scene1",
      "type": "story_scene",
      "character": "coach",
      "mood": "excited",
      "scene": "office",
      "dialogue": "So far, the model has been talking to you.\n\nNow we cross a line. We give the model tools — APIs, databases, calendars, calculators — and it can act on your behalf.\n\nThis is where AI goes from smart chatbot to genuine automation partner."
    },
    {
      "id": "l7-info1",
      "type": "info",
      "title": "What Is Tool Use?",
      "body": "Tool use (also called function calling) lets you define functions the model can invoke during a conversation.\n\nYou provide: the function name, description, and parameter schema.\nThe model decides: when to call it and with what arguments.\nYour code runs: the actual function and returns the result.\nThe model continues: incorporating the result into its response.\n\nThis turns a language model into an orchestrator — one that can query databases, call APIs, send emails, and take real-world actions.",
      "xp": 5
    },
    {
      "id": "l7-scenario1",
      "type": "scenario_card",
      "title": "Tool Use in a Sales Workflow",
      "body": "A sales AI with four tools:\n• get_crm_data(customer_id) — pulls deal history and contact info\n• search_knowledge_base(query) — finds product documentation\n• draft_email(to, context) — creates a personalized follow-up\n• schedule_meeting(attendees, preferred_time) — books a slot\n\nIn a single conversation the AI can: research a prospect, find the right product info, draft a personalized email, and book a meeting — without a human touching each step."
    },
    {
      "id": "l7-mc1",
      "type": "mc",
      "question": "In a function-calling setup, who actually executes the function?",
      "options": [
        "The language model executes it internally",
        "A separate AI model handles execution",
        "Your application code runs it and returns the result to the model",
        "The API provider runs it automatically"
      ],
      "correct": 2,
      "feedback": [
        "Correct. The model only decides to call the function and specifies arguments — your application code actually runs it and passes the result back.",
        "The model can't run code directly. It generates a structured call; your code handles execution."
      ],
      "xp": 10
    },
    {
      "id": "l7-tf1",
      "type": "tf",
      "question": "A model with tool access can execute any code on your system without restrictions.",
      "correct": false,
      "feedback": [
        "Correct. Tool use is sandboxed. The model can only call functions you explicitly define and expose — you control all access.",
        "The model is fully sandboxed. It can only invoke functions you've deliberately defined. You determine what is and isn't accessible."
      ],
      "xp": 10
    },
    {
      "id": "l7-goodfit1",
      "type": "good_fit",
      "question": "Using function calling to let an AI draft travel bookings via a travel API, with a human reviewing and confirming each booking before it executes.",
      "correct": "good",
      "feedback": [
        "Yes — human-in-the-loop tool use is the ideal pattern. The AI handles the research and drafting; the human confirms before anything real happens.",
        "This is actually a great pattern. Tool use + human review = the best of both: AI efficiency with human judgment on consequential actions."
      ],
      "xp": 10
    },
    {
      "id": "l7-completion",
      "type": "completion",
      "title": "Lesson 7 Complete!",
      "body": "Tool use bridges language models and the real world.\n\nNext: chaining tools, prompts, and logic into complete AI workflows."
    }
  ]$L7$::jsonb);

  INSERT INTO lessons (id, unit_id, order_num, title, est_minutes, steps)
  VALUES (l8_id, u4_id, 2, 'Building AI Workflows', 15, $L8$[
    {
      "id": "l8-info1",
      "type": "info",
      "title": "From Prompt to Pipeline",
      "body": "A single prompt is a one-shot tool. A workflow is a repeatable system.\n\nAI workflows chain together:\n• Trigger — what starts it\n• Prompts — what the model does at each step\n• Tools — what the model can call\n• Conditions — when to branch or stop\n• Outputs — what gets produced\n\nThe difference between a power user and an operator: the operator builds workflows that run without them.",
      "xp": 5
    },
    {
      "id": "l8-scenario1",
      "type": "scenario_card",
      "title": "Content Repurposing Workflow",
      "body": "1. TRIGGER: Blog post published\n2. PROMPT: Summarize into 3 LinkedIn posts (different angles)\n3. PROMPT: Create 5 Twitter/X thread hooks from the post\n4. TOOL: Schedule posts via social media API\n5. PROMPT: Write email newsletter version\n6. TOOL: Add to email queue\n\nOne blog post → 9 pieces of content → auto-scheduled.\nTime saved: 3–4 hours per post."
    },
    {
      "id": "l8-builder1",
      "type": "builder",
      "fields": [
        { "id": "trigger",  "label": "What triggers your workflow?",          "placeholder": "e.g. New customer signup, file uploaded, form submitted" },
        { "id": "step1",    "label": "Step 1 — What does the AI do?",         "placeholder": "e.g. Classify the customer by industry and company size" },
        { "id": "step2",    "label": "Step 2 — What does the AI do next?",    "placeholder": "e.g. Generate a personalized welcome message" },
        { "id": "output",   "label": "What's the final output?",              "placeholder": "e.g. Email sent, CRM updated, Slack message posted" }
      ],
      "template": "TRIGGER: {trigger}\n\nStep 1: {step1}\n\nStep 2: {step2}\n\nOutput: {output}"
    },
    {
      "id": "l8-promptgen1",
      "type": "prompt_generator",
      "title": "Workflow Prompt Builder",
      "subtitle": "Generate a reusable prompt for any step in your workflow",
      "topic": "AI workflow automation",
      "promptTemplate": "You are an AI assistant in a {workflow_type} workflow. Your task is to {task_description}. The input you receive will be {input_format}. Produce output in the following format: {output_format}. Important constraints: {constraints}. Think step by step before producing your output.",
      "fields": [
        { "id": "workflow_type",   "label": "Type of workflow",      "placeholder": "e.g. content repurposing, customer onboarding" },
        { "id": "task_description","label": "What this step does",   "placeholder": "e.g. classify the topic and extract key points" },
        { "id": "input_format",    "label": "Input format",          "placeholder": "e.g. raw blog post text, up to 2,000 words" },
        { "id": "output_format",   "label": "Output format",         "placeholder": "e.g. JSON: {topic, summary, key_points[]}" },
        { "id": "constraints",     "label": "Constraints",           "placeholder": "e.g. max 200 words, no markdown, professional tone" }
      ],
      "categories": ["Content", "Customer Success", "Sales", "Operations", "Research", "Marketing"]
    },
    {
      "id": "l8-quiz1",
      "type": "quiz",
      "title": "Workflow Knowledge Check",
      "questions": [
        {
          "id": "q1",
          "question": "What makes an AI workflow different from a single prompt?",
          "questionType": "mc",
          "options": [
            "Workflows use a more powerful model",
            "Workflows chain multiple steps, tools, and conditions into a repeatable system",
            "Workflows always require programming skills to build",
            "Workflows can only be run once per day"
          ],
          "correct": 1,
          "feedback": [
            "Correct — it's the chaining and repeatability that defines a workflow. The model can be the same.",
            "The model doesn't determine whether something is a workflow. It's the chaining of steps and conditions that does."
          ]
        },
        {
          "id": "q2",
          "question": "Every AI workflow requires a human to review each step before it completes.",
          "questionType": "tf",
          "correct": false,
          "feedback": [
            "Correct — human-in-the-loop is a design choice, not a requirement. Fully automated workflows are common and appropriate for many tasks.",
            "Human review is optional. Some workflows are fully automated; human oversight is a design choice based on the risk level of the task."
          ]
        },
        {
          "id": "q3",
          "question": "The ___ pattern places a human review step before any AI-initiated real-world action.",
          "questionType": "fillblank",
          "correct": "human-in-the-loop",
          "aliases": ["human in the loop", "hitl", "human in loop", "human-in-loop"],
          "feedback": [
            "Correct! Human-in-the-loop (HITL) — a human checkpoint before consequential actions.",
            "The term is 'human-in-the-loop' (HITL) — a safety pattern where humans review AI decisions before they affect the real world."
          ]
        }
      ],
      "config": {
        "mode": "one_at_a_time",
        "showResultsAfterEach": true,
        "passingThreshold": 67
      }
    },
    {
      "id": "l8-streak1",
      "type": "streak_commitment",
      "commitOptions": [3, 5, 7]
    },
    {
      "id": "l8-completion",
      "type": "completion",
      "title": "Lesson 8 Complete!",
      "body": "You can now design AI workflows. Trigger → Prompt → Tool → Condition → Output.\n\nNext unit: the darker side of AI — hallucination, bias, and responsible use."
    }
  ]$L8$::jsonb);

  -- ══════════════════════════════════════════════════════════════════════════
  -- UNIT 5 · SAFETY & ETHICS
  -- Step types introduced: reminder_setup
  -- ══════════════════════════════════════════════════════════════════════════

  INSERT INTO lessons (id, unit_id, order_num, title, est_minutes, steps)
  VALUES (l9_id, u5_id, 1, 'Hallucination & AI Errors', 11, $L9$[
    {
      "id": "l9-chapter",
      "type": "story_chapter",
      "episode": 5,
      "act": "Unit 5 · Safety & Ethics",
      "title": "Hallucination & AI Errors",
      "subtitle": "When confident AI is confidently wrong"
    },
    {
      "id": "l9-scene1",
      "type": "story_scene",
      "character": "narrator",
      "mood": "shocked",
      "scene": "office",
      "dialogue": "A lawyer submitted a legal brief citing six court cases.\n\nAll six were fabricated. Invented by an AI — complete with plausible case names, jurisdiction levels, and citation formats.\n\nThe lawyer had trusted the AI without verification. The cases did not exist. The judge was not amused.\n\nThis is hallucination. And every prompt engineer needs to understand exactly why it happens."
    },
    {
      "id": "l9-info1",
      "type": "info",
      "title": "What Is Hallucination?",
      "body": "Hallucination is when an AI model generates confident, plausible-sounding, but factually incorrect output.\n\nWhy it happens: LLMs are trained to generate likely-sounding text. In the absence of actual knowledge, they generate text that looks like what an answer should look like.\n\nThe model has no concept of 'I don't know.' It only knows: 'what would a coherent continuation of this text look like?'\n\nDanger zones: facts, citations, statistics, legal/medical/financial information, recent events.",
      "xp": 5
    },
    {
      "id": "l9-highlight1",
      "type": "highlight",
      "body": "Hallucination is not a bug — it's a fundamental property of next-token prediction.\n\nA model trained to always produce fluent text will produce fluent text even when it doesn't 'know' the answer.\n\nThe operator's job: design systems that prevent or catch hallucinations. Grounding (connecting models to real verified data), verification steps, and human review on high-stakes outputs are your primary tools.",
      "highlights": ["not a bug", "fundamental property", "Grounding", "design systems that prevent or catch"],
      "xp": 5
    },
    {
      "id": "l9-tf1",
      "type": "tf",
      "question": "An AI that sounds highly confident is more likely to be factually correct.",
      "correct": false,
      "feedback": [
        "Correct — confidence and accuracy are not correlated in LLMs. Hallucinated content is often delivered with exactly the same confident tone as accurate content.",
        "Critical insight: LLMs can be maximally confident while being completely wrong. Never use confidence as a proxy for accuracy."
      ],
      "xp": 10
    },
    {
      "id": "l9-mc1",
      "type": "mc",
      "question": "What is the most reliable way to reduce hallucination risk in a production system?",
      "options": [
        "Use the largest available model",
        "Ask the model to 'be careful and accurate'",
        "Ground the model with verified retrieved information (RAG)",
        "Lower the temperature to 0"
      ],
      "correct": 2,
      "feedback": [
        "Correct. Retrieval-Augmented Generation (RAG) provides verified facts for the model to reference, dramatically reducing hallucination on factual tasks.",
        "Larger models hallucinate less on some benchmarks but remain unreliable for high-stakes facts. Grounding via RAG is the most effective solution."
      ],
      "xp": 10
    },
    {
      "id": "l9-goodfit1",
      "type": "good_fit",
      "question": "Using AI to summarize a document you have provided, where the summary must only reference information contained in that document.",
      "correct": "good",
      "feedback": [
        "Correct — when the source material is provided in the prompt, the model is grounded. It can check its output against real content rather than drawing on potentially faulty training knowledge.",
        "This is a low-hallucination task. Providing the source document grounds the model in verified content."
      ],
      "xp": 10
    },
    {
      "id": "l9-completion",
      "type": "completion",
      "title": "Lesson 9 Complete!",
      "body": "Hallucination understood. Remember: AI confidence ≠ accuracy. Always verify high-stakes outputs against real sources.\n\nNext: responsible AI use — the principles every operator must understand."
    }
  ]$L9$::jsonb);

  INSERT INTO lessons (id, unit_id, order_num, title, est_minutes, steps)
  VALUES (l10_id, u5_id, 2, 'Responsible AI Use', 12, $L10$[
    {
      "id": "l10-info1",
      "type": "info",
      "title": "The Responsible Operator",
      "body": "AI amplifies what you do. Build a biased system and it biases at scale. Build a misleading one and it misleads thousands.\n\nResponsible AI use isn't just ethics — it's practical risk management.\n\nFour core principles:\n• Transparency — be clear when AI is involved\n• Verification — don't trust AI for high-stakes facts without checking\n• Human oversight — keep humans in the loop for consequential decisions\n• Fairness — audit for bias before deploying in high-stakes contexts",
      "xp": 5
    },
    {
      "id": "l10-scenario1",
      "type": "scenario_card",
      "title": "When Training Data Carries Bias",
      "body": "A hiring AI was trained on 10 years of resumes from a company that had historically hired mostly men.\n\nThe model learned that certain names, extracurricular activities, and universities were associated with past hiring success. It began systematically downranking female applicants — not by design, but because the training data reflected historical bias.\n\nThe company discovered this only after a discrimination complaint.\n\nLesson: AI inherits the biases in its training data. You must actively audit for bias before deploying in any high-stakes context."
    },
    {
      "id": "l10-mc1",
      "type": "mc",
      "question": "What is the correct approach before deploying an AI system for hiring decisions?",
      "options": [
        "Nothing — AI is objective because it's not human",
        "Audit the system across demographic groups for bias",
        "Use the most powerful model to minimize errors",
        "Get legal sign-off from the model provider"
      ],
      "correct": 1,
      "feedback": [
        "Correct. AI systems must be actively tested for bias — they reflect patterns in training data, including historical biases that no one intended.",
        "AI is not inherently objective. It reflects training data, which often contains historical biases."
      ],
      "xp": 10
    },
    {
      "id": "l10-goodfit1",
      "type": "good_fit",
      "question": "Deploying an AI chatbot that answers medical symptom questions with no disclaimer that it is AI and no recommendation to consult a professional.",
      "correct": "notideal",
      "feedback": [
        "Correct — this violates both transparency (users must know it's AI) and safety (medical contexts require professional consultation disclaimers).",
        "This creates real patient safety risk. AI in medical contexts must always be identified as AI and include a clear disclaimer that it cannot replace professional medical advice."
      ],
      "xp": 10
    },
    {
      "id": "l10-quiz1",
      "type": "quiz",
      "title": "Responsible AI Principles",
      "questions": [
        {
          "id": "q1",
          "question": "An AI system can be biased even if its developers had no intention of creating bias.",
          "questionType": "tf",
          "correct": true,
          "feedback": [
            "Correct — bias comes from training data, not intent. Unintentional bias from historical data is common and must be actively detected and addressed.",
            "Bias doesn't require intent. Historical inequities in training data produce biased outputs regardless of what the developers wanted."
          ]
        },
        {
          "id": "q2",
          "question": "In responsible AI deployment, 'human-in-the-loop' means:",
          "questionType": "mc",
          "options": [
            "Humans manually train the model on new data",
            "A human reviews and approves AI output before consequential actions",
            "The AI asks users questions during inference",
            "Humans write all prompts before the model runs"
          ],
          "correct": 1,
          "feedback": [
            "Correct — HITL means a human checkpoint before actions with real-world consequences.",
            "HITL is about review and approval of AI-generated decisions, not about training or prompt writing."
          ]
        },
        {
          "id": "q3",
          "question": "Users always have the right to know when they are interacting with an AI.",
          "questionType": "tf",
          "correct": true,
          "feedback": [
            "Correct — transparency about AI involvement is a foundational responsibility of every operator.",
            "Transparency is non-negotiable. Users have the right to know they are talking to an AI, not a human."
          ]
        }
      ],
      "config": {
        "mode": "one_at_a_time",
        "showResultsAfterEach": true,
        "passingThreshold": 67
      }
    },
    {
      "id": "l10-reminder1",
      "type": "reminder_setup",
      "reminderOptions": ["Daily at 9am", "Daily at 12pm", "Daily at 6pm", "Weekdays at 8am", "Weekends at 10am"]
    },
    {
      "id": "l10-completion",
      "type": "completion",
      "title": "Lesson 10 Complete!",
      "body": "Responsible AI use is part of your job as an operator. Transparency, verification, oversight, fairness — not optional extras. The foundation.\n\nFinal unit: the capstone. Time to build something real."
    }
  ]$L10$::jsonb);

  -- ══════════════════════════════════════════════════════════════════════════
  -- UNIT 6 · CAPSTONE
  -- Step types introduced: badge_unlock, chat (all 23 types now covered)
  -- ══════════════════════════════════════════════════════════════════════════

  INSERT INTO lessons (id, unit_id, order_num, title, est_minutes, steps)
  VALUES (l11_id, u6_id, 1, 'Build Your First AI System', 20, $L11$[
    {
      "id": "l11-chapter",
      "type": "story_chapter",
      "episode": 6,
      "act": "Unit 6 · Capstone",
      "title": "Build Your First AI System",
      "subtitle": "Everything you've learned, in one system"
    },
    {
      "id": "l11-scene1",
      "type": "story_scene",
      "character": "aria",
      "mood": "excited",
      "scene": "lab",
      "dialogue": "This is it. The capstone.\n\nYou've covered how models work, how to prompt them, how to chain tools and workflows, and how to use AI responsibly.\n\nNow we build something real. A complete AI system: system prompt, workflow, and a reusable prompt template.\n\nChoose something from your actual work — the more specific, the better. Let's go."
    },
    {
      "id": "l11-info1",
      "type": "info",
      "title": "What You're Building",
      "body": "Your AI system will have three components:\n\n1. System prompt — defines the AI's role and behavior\n2. Workflow — trigger → process → output\n3. Core prompt — the reusable template for the main task\n\nThree principles:\n• Specific beats vague — vague systems don't get used\n• Constrained beats open-ended — constraints produce reliable output\n• Documented beats tribal knowledge — write it down so others can use it",
      "xp": 5
    },
    {
      "id": "l11-builder1",
      "type": "builder",
      "fields": [
        { "id": "use_case",    "label": "Your use case",                      "placeholder": "e.g. Weekly status report generator for my engineering team" },
        { "id": "role",        "label": "The AI's role in your system",        "placeholder": "e.g. Senior technical writer who knows our team's projects" },
        { "id": "constraints", "label": "Key constraints",                    "placeholder": "e.g. Max 300 words, no jargon, always end with next week's priorities" },
        { "id": "trigger",     "label": "What triggers it?",                  "placeholder": "e.g. Every Friday at 4pm, input: team's Slack updates from the week" },
        { "id": "output",      "label": "Desired output",                     "placeholder": "e.g. Structured report: wins, blockers, next steps — ready to paste into email" }
      ],
      "template": "SYSTEM PROMPT:\nYou are a {role}. {constraints}\n\nWORKFLOW:\nTrigger: {trigger}\nProcess: Analyze input → Generate {output}\n\nUSE CASE: {use_case}"
    },
    {
      "id": "l11-promptgen1",
      "type": "prompt_generator",
      "title": "Generate Your Core Prompt",
      "subtitle": "Build the main reusable prompt for your system",
      "topic": "AI system design",
      "promptTemplate": "You are a {ai_role}.\n\nContext: {context}\n\nTask: {task}\n\nFormat your response as: {format}\n\nConstraints: {constraints}\n\nThink step by step before writing your final output.",
      "fields": [
        { "id": "ai_role",     "label": "AI's role",           "placeholder": "e.g. executive communications specialist" },
        { "id": "context",     "label": "Context it needs",    "placeholder": "e.g. Writing for a B2B SaaS company; audience is C-suite" },
        { "id": "task",        "label": "The specific task",   "placeholder": "e.g. Transform these bullet points into a polished executive summary" },
        { "id": "format",      "label": "Output format",       "placeholder": "e.g. 3 paragraphs: situation, action taken, result" },
        { "id": "constraints", "label": "Constraints",         "placeholder": "e.g. Max 250 words, no jargon, active voice only" }
      ],
      "categories": ["Writing", "Analysis", "Customer Success", "Sales", "Operations", "Research"]
    },
    {
      "id": "l11-compare1",
      "type": "compare",
      "question": "Compare the system prompt you built above with the generic 'You are a helpful assistant.' What specific behaviors does your version produce that the generic one can't? What gaps did you fill?"
    },
    {
      "id": "l11-badge1",
      "type": "badge_unlock",
      "badgeSlug": "prompt_engineer",
      "xp": 50
    },
    {
      "id": "l11-completion",
      "type": "completion",
      "title": "Lesson 11 Complete!",
      "body": "You've built a complete AI system. System prompt ✓  Workflow ✓  Core prompt ✓\n\nOne lesson left: building your ongoing AI practice habit — and earning your final badge."
    }
  ]$L11$::jsonb);

  INSERT INTO lessons (id, unit_id, order_num, title, est_minutes, steps)
  VALUES (l12_id, u6_id, 2, 'Your AI Practice System', 15, $L12$[
    {
      "id": "l12-info1",
      "type": "info",
      "title": "From Student to Practitioner",
      "body": "You've covered everything:\n• How LLMs work (next-token prediction, tokens, temperature)\n• Zero-shot and few-shot prompting\n• Chain-of-thought reasoning\n• System prompts and personas\n• Function calling and AI workflows\n• Hallucination, bias, and responsible use\n\nKnowledge without practice fades. This final lesson is about building the habit that turns these skills into permanent capabilities.",
      "xp": 5
    },
    {
      "id": "l12-match1",
      "type": "match",
      "pairs": [
        { "left": "Zero-shot prompting",   "right": "Specific instruction, no examples" },
        { "left": "Few-shot prompting",    "right": "Show the model the exact pattern you want" },
        { "left": "Chain-of-thought",      "right": "\"Think step by step\" for complex reasoning" },
        { "left": "System prompt",         "right": "Define the AI's role and constraints upfront" },
        { "left": "RAG",                   "right": "Ground the model with verified retrieved data" },
        { "left": "Temperature = 0",       "right": "Deterministic, consistent, reproducible output" }
      ],
      "xp": 20
    },
    {
      "id": "l12-chat1",
      "type": "chat",
      "greeting": "Let's practice! Ask me anything about prompt engineering — or share a prompt you've written and I'll help you improve it.",
      "placeholder": "Type a prompt you want to test, or ask a question about prompt engineering...",
      "systemPrompt": "You are an expert prompt engineering coach. Help the user practice and improve their prompting skills. When they share a prompt, analyze it and suggest specific, actionable improvements. When they ask questions, give concrete answers with examples. Be encouraging and specific. Focus on the techniques covered in this program: zero-shot, few-shot, chain-of-thought, system prompts, tool use, and responsible AI."
    },
    {
      "id": "l12-reflection1",
      "type": "reflection",
      "questions": [
        {
          "id": "r1",
          "prompt": "What is the single most valuable thing you learned in this program? How will you use it in the next week?",
          "placeholder": "Be specific — what will you actually do differently starting tomorrow?",
          "minChars": 30
        },
        {
          "id": "r2",
          "prompt": "What AI system will you build or improve using what you've learned? Describe it in one sentence.",
          "placeholder": "e.g. I'll build a system prompt for my weekly report workflow so it runs in under 10 minutes instead of an hour...",
          "minChars": 20
        }
      ]
    },
    {
      "id": "l12-streak1",
      "type": "streak_commitment",
      "commitOptions": [3, 5, 7]
    },
    {
      "id": "l12-badge1",
      "type": "badge_unlock",
      "badgeSlug": "ai_practitioner",
      "xp": 100
    },
    {
      "id": "l12-completion",
      "type": "completion",
      "title": "Program Complete!",
      "body": "You are now an AI Prompt Engineering practitioner.\n\nYou know how models work, can prompt them from basic to advanced, have built a complete AI system, and understand responsible use.\n\nThe field moves fast. Keep practicing, keep building, and keep asking: 'What would this look like if AI handled it?'"
    }
  ]$L12$::jsonb);

END $$;
