# Turbo Academy — Lesson Content Template

Use this template to create lesson content. Fill it in, save as a `.md` file, and run:

```
npx tsx tools/ingest/convert.ts --input my-lesson.md --program ai_operator --day 15
```

---

## META
program: ai_operator
day: 15
title: Day 15: Your Lesson Title Here
estMinutes: 20
unitLabel: Day 15

---

## STEP: info
id: d15-intro
title: Welcome to Day 15
body: >
  Your intro text here. Explain what the learner will accomplish today.
  Use multiple paragraphs if needed — separate with a blank line.

  This is a second paragraph. It works the same way.

xp: 5

---

## STEP: highlight
id: d15-hl1
body: >
  Your key insight text here.

  Use **bold** to mark phrases that should be highlighted.
  Put each highlighted phrase on its own line preceded by **.

  The engine will automatically extract these as highlights.

xp: 5

---

## STEP: mc
id: d15-mc1
question: What is the correct answer to this question?
options:
  - First option (wrong)
  - Second option (correct!)
  - Third option (wrong)
  - Fourth option (wrong)
correct: 1
feedback:
  - Correct! Here's why this is right and some additional context.
  - Not quite. Here's why the right answer is better.
xp: 10

---

## STEP: tf
id: d15-tf1
question: True or false: this statement is being tested.
correct: true
feedback:
  - Correct! Here's why it's true.
  - Actually, this is true. Here's the explanation.
xp: 10

---

## STEP: fillblank
id: d15-fb1
question: The AI operator mindset means you don't just use AI — you _____ it.
answer: direct
aliases:
  - command
  - guide
  - control
feedback:
  - Correct! You direct AI — you don't just use it.
  - Close. The key word is "direct" — you command the AI, you don't just ask it.
xp: 10

---

## STEP: good_fit
id: d15-gf1
question: Using AI to write a single email but doing everything else manually.
correct: notideal
feedback:
  - That's right — this is Layer 1 usage, not operating.
  - Think bigger. Operators build systems, not one-off prompts.
xp: 10

---

## STEP: scenario_card
id: d15-sc1
title: The Real-World Application
body: >
  Describe a scenario or story here.

  This step type is for immersive, narrative-driven learning moments.
  It has a distinct visual style (card with accent border).

---

## STEP: example
id: d15-ex1
title: A Concrete Example
prompt: >
  Show a real example, template, or code snippet here.

  This step type is for concrete demonstrations of what was just explained.

---

## STEP: reflection
id: d15-ref1
questions:
  - id: r1
    type: textarea
    label: What's one thing you learned today that changes how you think about AI?
  - id: r2
    type: textarea
    label: How will you apply this tomorrow?

---

## STEP: completion
id: d15-end
title: Day 15 Complete!
body: >
  Summarize what was learned today.

  Preview what's coming tomorrow. Keep them excited.

---

## QUICK REFERENCE: All Step Types

| Type | Use For | Required Fields |
|------|---------|----------------|
| `info` | Reading / explanation | `id, title, body` |
| `highlight` | Key insight with bold phrases | `id, body` (bold phrases auto-extracted) |
| `mc` | Multiple choice quiz | `id, question, options[], correct, feedback[]` |
| `tf` | True/false quiz | `id, question, correct(bool), feedback[]` |
| `fillblank` | Fill in the blank | `id, question, answer, aliases[], feedback[]` |
| `good_fit` | "Is this a good fit?" judgment | `id, question, correct("good"\|"notideal"), feedback[]` |
| `match` | Match pairs (left vs right) | `id, pairs[{left, right}][]` |
| `quiz` | Multiple questions at once | `id, questions[{id, question, options[], correct}][]` |
| `builder` | Multi-field form builder | `id, fields[{id, label, placeholder}][]` |
| `scenario_card` | Narrative scenario | `id, title, body` |
| `example` | Concrete example / template | `id, title, prompt` |
| `reflection` | Open-ended reflection | `id, questions[{id, type, label}][]` |
| `completion` | Day/lesson complete screen | `id, title, body` |

## Tips

- **Keep paragraphs short** — 2-3 sentences max. Mobile reading is different from desktop.
- **One concept per info step** — don't overload a single step with multiple ideas.
- **Quiz every 2-3 steps** — test understanding before moving on.
- **Use `highlight` for key takeaways** — bold the most important phrases.
- **End with `reflection` + `completion`** — cement the learning and close the loop.
- **Step IDs** — use consistent prefixes like `d15-` for day 15 so they're unique across lessons.
