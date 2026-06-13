# FORMATTING PROMPT — raw text → authoring JSON

This is the "tool." Drop raw text in, get the simple authoring JSON out. The LLM
ONLY produces content + arc. It does NOT wire pointers, uuids, menus, or feedback
steps — the compiler does all of that deterministically. Keeping the model's job
small is what makes it reliable.

You can run this two ways:
- **One-shot:** paste a whole rough doc, get the whole course JSON.
- **Per-lesson:** format one lesson at a time (better for long content; less for
  the model to hold, fewer errors).

---

## System prompt

```
You convert raw teaching material into a structured course authoring JSON.

You produce CONTENT ONLY. You do NOT create navigation, button pointers, ids,
menus, or feedback wiring — a separate compiler adds those. Your job is meaning:
the arc of lessons, the concepts, and good quiz/scenario/flashcard seeds.

RULES
- Use ONLY the provided material. Do not invent facts, statistics, testimonials,
  outcomes, or requirements not present in the text.
- Decide the ARC: order lessons so each builds toward the course destination.
- Per lesson, extract 1-6 concepts. Each concept tag is snake_case.
- Write quiz seeds: a question, 2-4 options, exactly one correct, short honest
  feedback per option. Spread difficulty 1 (recall) to 4 (application).
- Write 0-2 scenario seeds: an in-character setup and 2-3 choices, each with a
  consequence + coaching. Mark strong choices good:true.
- Write 0-2 flashcards: front prompt, back reveal.
- Keep questions and bot text tight. No filler.
- Match the course voice if one is given.

Output ONLY valid JSON matching the authoring schema. No markdown fences, no prose.
```

## User prompt

```
COURSE TITLE (if known): {{title}}
COURSE DESTINATION (what the student can DO at the end, if known): {{destination}}
VOICE (optional): {{voice}}

RAW MATERIAL:
{{raw_text}}

Return the authoring JSON: { "course": {...}, "lessons": [...] }.
```

---

## Why this is the optimal shape

- **The model's output is flat and easy to get right.** No graph to wire means
  far fewer structural errors. A wrong `to` pointer can't happen here because
  there are no pointers in this format.
- **It's human-readable.** When the model writes a weak quiz, you open the JSON
  and fix that one quiz by eye. You never debug a state machine.
- **The compiler guarantees structure.** Pointers, menus, feedback steps, version
  hashing, and validation are deterministic code — the same MightyMax discipline
  (LLM generates content, code does assembly + gating).
- **The course can format itself.** An OpenClaw agent can fill this JSON from a
  Notion doc or a transcript with no human in the loop, then the compiler + your
  preview catch any problems before students see them.

## Pipeline

```
raw text ──[this formatting prompt]──► authoring JSON ──[compile.js]──► playable items ──► runtime
                  (LLM, content)          (you can hand-edit)   (code, structure)
```
