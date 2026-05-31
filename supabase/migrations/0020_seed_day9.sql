-- PREVIEW SEED — review & approve before applying with the service key.
-- Program: ai_for_everyone  Unit 9 (Day 9)  Lesson 1
-- AI Research Assistant — Deep research, fact-checking, and source validation

insert into programs (slug, title, subtitle, unit_label, artifact_label)
values ('ai_for_everyone', 'AI for Everyone', '28 days to AI confidence', 'Day', 'Artifact')
on conflict (slug) do nothing;

insert into units (program_id, order_num, label, title, theme)
select id, 9, 'Day 9', 'AI Research Assistant', ''
from programs where slug = 'ai_for_everyone'
on conflict (program_id, order_num) do nothing;

insert into lessons (unit_id, order_num, title, est_minutes, steps)
select u.id, 1, 'Deep Research with AI', 20, $json$[
  {
    "id": "d9_s1",
    "type": "info",
    "title": "Welcome to Day 9 — Research Mode",
    "body": "AI is often treated as a chatbot. Today you will use it as a research department. The key difference: researchers verify sources, synthesize across documents, and produce cited summaries. You can do all of this with AI if you ask the right way.",
    "audioUrl": null,
    "primaryButton": "Let's research",
    "xp": 3
  },
  {
    "id": "d9_s2",
    "type": "scenario_card",
    "title": "Your research brief",
    "body": "Your manager asks: 'I need to understand the electric vehicle market in Southeast Asia by Friday. Give me competitors, market size, regulatory landscape, and key players — with sources.' Doing this manually would take 6-8 hours. With AI research techniques, you can deliver in 1 hour.",
    "audioUrl": null,
    "primaryButton": "Show me how",
    "xp": 3
  },
  {
    "id": "d9_s3",
    "type": "info",
    "title": "The AI research protocol",
    "body": "Research with AI follows a specific protocol:\n\n1. Break your question into sub-questions\n2. Ask AI to search each sub-question\n3. Ask AI to draw connections across answers\n4. Request specific citations and sources\n5. Fact-check key claims manually\n\nAI is fast and broad. You are accurate and deep. Together you are unstoppable.",
    "audioUrl": null,
    "primaryButton": "I understand the protocol",
    "xp": 3
  },
  {
    "id": "d9_s4",
    "type": "mc",
    "title": "Best research question structure",
    "question": "Which is the best way to start a research query with AI?",
    "options": [
      "'Tell me everything about electric vehicles.'",
      "'Research the EV market in Southeast Asia. Break it into: market size, top competitors, government regulations, and recent trends. Provide sources for each.'",
      "'Is the EV market big in Asia?'"
    ],
    "correct": 1,
    "feedback": [
      "Too broad — AI will give you surface-level information.",
      "Yes. Structured questions with sub-topics produce depth. Requesting sources adds credibility.",
      "Too vague for meaningful research."
    ],
    "xp": 10
  },
  {
    "id": "d9_s5",
    "type": "info",
    "title": "Source validation rules",
    "body": "Not everything AI tells you is true. Follow these rules:\n\n1. Ask for specific sources, not just 'recent studies'\n2. Verify date — old data in fast-moving fields is dangerous\n3. Cross-check critical claims with a manual search\n4. Know AI's cutoff date — it cannot know recent events\n5. Use AI that can browse the web for live fact-checking\n\nRule of thumb: AI is great for structure and synthesis. You are the fact-checker.",
    "audioUrl": null,
    "primaryButton": "I will verify sources",
    "xp": 3
  },
  {
    "id": "d9_s6",
    "type": "tf",
    "title": "True or false?",
    "question": "If AI sounds confident and provides many details, you can trust the information without verifying it.",
    "correct": false,
    "feedback": [
      "Correct. AI confidence does not equal accuracy. Always verify critical facts.",
      "False. AI can be confidently wrong. Always verify important information from external sources."
    ],
    "xp": 5
  },
  {
    "id": "d9_s7",
    "type": "highlight",
    "title": "Find the research tasks AI can help with",
    "body": "You need to produce a market research report on sustainable fashion. Tasks include: finding industry reports, interviewing experts, analyzing competitor websites, comparing pricing strategies, and verifying supplier sustainability claims.",
    "highlights": [
      "finding industry reports",
      "analyzing competitor websites",
      "comparing pricing strategies"
    ],
    "xp": 6
  },
  {
    "id": "d9_s8",
    "type": "good_fit",
    "title": "Good fit for AI?",
    "question": "Conduct a confidential interview with a company insider about their revenue numbers.",
    "correct": "notideal",
    "feedback": [
      "Exactly. AI cannot conduct real human interviews — that requires personal interaction and trust.",
      "Right. Interviews need real human connection. AI can help prepare questions, but not conduct the conversation."
    ],
    "xp": 5
  },
  {
    "id": "d9_s9",
    "type": "info",
    "title": "The multi-source synthesis technique",
    "body": "AI's superpower is reading multiple sources and finding patterns:\n\n- Upload 3 industry reports → ask for common themes\n- Give AI 5 articles → ask for contradictions\n- Provide data from 2 years → ask for trends\n\nPrompt formula: 'I have [sources]. Synthesize them into [format]. Highlight [specific aspect]. Note any [contradictions/gaps].'",
    "audioUrl": null,
    "primaryButton": "That is powerful",
    "xp": 3
  },
  {
    "id": "d9_s10",
    "type": "good_fit",
    "title": "Good fit for AI?",
    "question": "Summarize five academic papers on climate policy and identify the three most common recommendations across all papers.",
    "correct": "good",
    "feedback": [
      "Yes. Synthesizing across multiple documents is one of AI's strongest research skills.",
      "Right. AI is excellent at reading many sources and finding patterns humans might miss."
    ],
    "xp": 5
  },
  {
    "id": "d9_s11",
    "type": "builder",
    "title": "Plan your research brief",
    "fields": [
      {
        "id": "topic",
        "label": "What topic do you want to research?",
        "placeholder": "AI in healthcare market 2025"
      },
      {
        "id": "subtopics",
        "label": "What 3-5 sub-topics will you ask about?",
        "placeholder": "market size, key players, regulations, recent innovations, challenges"
      },
      {
        "id": "audience",
        "label": "Who is this research for?",
        "placeholder": "My team for a strategy meeting"
      }
    ],
    "template": "Research brief plan:\n- Topic: {{topic}}\n- Sub-topics: {{subtopics}}\n- Audience: {{audience}}",
    "primaryButton": "Save my research plan",
    "xp": 20
  },
  {
    "id": "d9_s12",
    "type": "mc",
    "title": "Handling AI hallucinations in research",
    "question": "AI tells you a statistic but you cannot find the source. What should you do?",
    "options": [
      "Use it anyway since AI is usually right",
      "Ask AI for the exact source again, then verify it manually",
      "Ignore the statistic and remove it from your research"
    ],
    "correct": 1,
    "feedback": [
      "Never trust unverifiable claims — hallucinated stats damage your credibility.",
      "Yes. Ask AI to clarify the source, then manually verify before including it.",
      "That works, but it is better to try to verify first — the data might be valid."
    ],
    "xp": 10
  },
  {
    "id": "d9_s13",
    "type": "paste_capture",
    "title": "Paste a research finding snippet",
    "body": "Find a real article about a topic you are interested in. Paste a paragraph here. In the next step you will transform it with AI.",
    "minLength": 50,
    "xp": 8
  },
  {
    "id": "d9_s14",
    "type": "info",
    "title": "Research deliverable format",
    "body": "A professional research brief has four parts:\n\n1. Executive Summary — 3 bullets of key findings\n2. Deep Dive — Expanded section on each sub-topic\n3. Key Insights — What this means for you\n4. Sources — Every claim linked to its source\n\nAsk AI to format in this structure. It produces presentation-ready output.",
    "audioUrl": null,
    "primaryButton": "I have the format",
    "xp": 3
  },
  {
    "id": "d9_s15",
    "type": "reflection",
    "title": "Your research approach",
    "questions": [
      {
        "id": "research_shift",
        "type": "single_choice",
        "label": "What will change most about how you do research with AI?",
        "options": [
          "I will research topics I would have skipped before",
          "I will produce better structured reports",
          "I will be faster at gathering information",
          "I will fact-check more carefully"
        ]
      },
      {
        "id": "research_focus",
        "type": "textarea",
        "label": "What is one topic you want to research deeply using what you learned today?"
      }
    ],
    "xp": 15
  },
  {
    "id": "d9_s16",
    "type": "compare",
    "title": "Compare your research process",
    "question": "Compare your old research process (Google → read → take notes → write) to your new AI-assisted process. How much faster is it? What quality improvements do you see?",
    "primaryButton": "I see the improvement",
    "xp": 10
  },
  {
    "id": "d9_s17",
    "type": "completion",
    "title": "Day 9 complete!",
    "body": "You now have a research protocol: break questions into sub-questions, use AI to gather and synthesize, verify sources, and structure into professional briefs. You are no longer just asking AI questions — you are directing a research team. Tomorrow: Business strategy with AI.",
    "primaryButton": "On to Day 10"
  }
]$json$::jsonb
from units u join programs p on p.id = u.program_id
where p.slug = 'ai_for_everyone' and u.order_num = 9
on conflict (unit_id, order_num) do nothing;
