// ─── ask — the free-text escape hatch (the ONLY live student-facing call) ───
//
// Contract from learning_platform ARCHITECTURE.md / COST_CONTROL.md:
//   embed question → retrieve lesson chunks → if below similarity threshold,
//   honestly decline with NO model call → else answer grounded in the chunks.
//
// Phase 1 has no backend, so this stays faithful WITHOUT an LLM:
//   - If EXPO_PUBLIC_LP_ASK_URL is configured, POST to that grounded Ask endpoint.
//   - Otherwise, do lightweight LOCAL retrieval over the lesson's source_text and
//     either surface the most relevant passage (grounded) or honestly decline
//     ("not covered in this lesson"). This preserves the "grounded or decline"
//     guarantee and the threshold short-circuit — and costs zero calls.
//
// The threshold + grounding behaviour is the part that matters for the product;
// swapping local retrieval for the real RAG+LLM endpoint is a Phase 2 drop-in.

import type { CompiledLesson } from "./types";

const ASK_URL = process.env.EXPO_PUBLIC_LP_ASK_URL;

// Below this overlap score we decline rather than answer off-topic.
const MIN_SIMILARITY = 0.12;

export interface AskResult {
  grounded: boolean; // false = honest decline (off-lesson) or backend error
  answer: string;
}

const STOP = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be", "to", "of",
  "in", "on", "for", "it", "this", "that", "with", "as", "at", "by", "from", "i",
  "you", "your", "my", "we", "do", "does", "can", "what", "why", "how", "when",
  "which", "who", "if", "so", "about", "into", "they", "them", "not", "no",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// Jaccard-ish overlap of question tokens against a candidate passage.
function score(qTokens: string[], passage: string): number {
  if (qTokens.length === 0) return 0;
  const pTokens = new Set(tokenize(passage));
  if (pTokens.size === 0) return 0;
  let hits = 0;
  for (const t of qTokens) if (pTokens.has(t)) hits++;
  return hits / qTokens.length;
}

function localGroundedAnswer(lesson: CompiledLesson, question: string): AskResult {
  const qTokens = tokenize(question);
  const sentences = splitSentences(lesson.source_text || "");
  let best = { text: "", s: 0 };
  for (const sent of sentences) {
    const s = score(qTokens, sent);
    if (s > best.s) best = { text: sent, s };
  }
  if (best.s < MIN_SIMILARITY || !best.text) {
    return {
      grounded: false,
      answer:
        "That's a great question, but it isn't covered in this lesson — so I won't guess. " +
        "Want to keep going, or rephrase it around what we just learned?",
    };
  }
  return {
    grounded: true,
    answer: `Here's what the lesson says about that:\n\n“${best.text}”`,
  };
}

export async function askQuestion(args: {
  lesson: CompiledLesson;
  question: string;
}): Promise<AskResult> {
  const { lesson, question } = args;
  const q = question.trim();
  if (!q) return { grounded: false, answer: "Type a question and I'll ground it in the lesson." };

  if (ASK_URL) {
    try {
      const res = await fetch(ASK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          content_version: lesson.content_version,
          lesson_title: lesson.title,
        }),
      });
      if (!res.ok) throw new Error(`Ask endpoint ${res.status}`);
      const data = (await res.json()) as Partial<AskResult>;
      return {
        grounded: data.grounded ?? true,
        answer: data.answer ?? "I couldn't find a grounded answer for that.",
      };
    } catch {
      // Fall through to local retrieval rather than show an error.
      return localGroundedAnswer(lesson, q);
    }
  }

  return localGroundedAnswer(lesson, q);
}
