// Claude calls for the lp_* pipeline (LLM owns meaning; the compiler owns structure).
//
// Uses the official Anthropic SDK. Model defaults to claude-opus-4-8 and is
// env-overridable so the §8 "model split" (e.g. a cheaper model for generation /
// simple Ask, a stronger one for complex answers) can be set WITHOUT code changes:
//   ANTHROPIC_API_KEY   required
//   LP_GEN_MODEL        ingest generation model (default claude-opus-4-8)
//   LP_ASK_MODEL        live Ask model          (default claude-opus-4-8)
//
// NOTE: pin the SDK version at deploy time (e.g. npm:@anthropic-ai/sdk@<ver>);
// left unpinned here so it resolves the current release in the Deno sandbox.
import Anthropic from "npm:@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
const GEN_MODEL = Deno.env.get("LP_GEN_MODEL") ?? "claude-opus-4-8";
const ASK_MODEL = Deno.env.get("LP_ASK_MODEL") ?? "claude-opus-4-8";

function textOf(content: Array<{ type: string; text?: string }>): string {
  return content.filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
}

// Strip ```json fences / leading prose and isolate the first JSON object.
function extractJson(s: string): string {
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : s;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON object in model output");
  return body.slice(start, end + 1);
}

// One lesson of CONTENT-ONLY authoring JSON. The compiler wires + validates after.
const GEN_SYSTEM = `You convert raw teaching material into structured course-authoring JSON.
You produce CONTENT ONLY — never ids, button pointers, menus, or feedback wiring (a deterministic compiler adds all of that).
RULES:
- Use ONLY the provided material. Do not invent facts, statistics, or outcomes.
- Extract 3-6 teachable concepts; each "tag" is snake_case.
- Quiz seeds: a question, 2-4 options, EXACTLY ONE correct, short honest feedback per option. Spread difficulty 1 (recall) to 4 (application).
- 0-2 scenario seeds: an in-character "setup" and 2-3 "choices", each with an "outcome" (consequence + coaching); mark strong choices good:true.
- 0-2 flashcards: "front" prompt, "back" reveal.
Output ONLY valid JSON for ONE lesson, no prose, no markdown fences:
{"title":str,"source_text":str,"concepts":[{"tag":str,"label":str}],"quizzes":[{"concept":str,"difficulty":int,"question":str,"options":[{"text":str,"correct":bool,"feedback":str}]}],"scenarios":[{"concept":str,"setup":str,"choices":[{"text":str,"good":bool,"outcome":str}]}],"flashcards":[{"concept":str,"front":str,"back":str}]}`;

export async function generateAuthoringLesson(args: {
  title: string;
  sourceText: string;
  voice?: string;
  repairError?: string;
}): Promise<unknown> {
  const { title, sourceText, voice, repairError } = args;
  const repair = repairError
    ? `\n\nYour previous output failed compilation with:\n${repairError}\nFix it and return corrected JSON.`
    : "";
  const resp = await client.messages.create({
    model: GEN_MODEL,
    max_tokens: 8000,
    system: GEN_SYSTEM,
    messages: [
      {
        role: "user",
        content: `TITLE: ${title}\nVOICE: ${voice ?? "(none)"}\n\nMATERIAL:\n${sourceText}\n\nReturn the authoring JSON for this one lesson.${repair}`,
      },
    ],
  });
  return JSON.parse(extractJson(textOf(resp.content as any)));
}

// The single live student-facing call. Grounded in retrieved chunks; declines if
// they don't cover the question. effort:"low" + adaptive keeps it low-latency.
export async function answerGrounded(args: {
  question: string;
  chunks: string;
  voice?: string;
}): Promise<string> {
  const { question, chunks, voice } = args;
  const resp = await client.messages.create({
    model: ASK_MODEL,
    max_tokens: 700,
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    system:
      "You are a course tutor. Answer the student's question using ONLY the lesson excerpts provided. " +
      "If the excerpts do not contain the answer, say you can't find it in this lesson and offer to keep going — never use outside knowledge. " +
      "Be concise (2-4 sentences). Respond with only the final answer: no preamble, no meta-commentary." +
      (voice ? ` Teaching voice: ${voice}.` : ""),
    messages: [{ role: "user", content: `LESSON EXCERPTS:\n${chunks}\n\nSTUDENT QUESTION: ${question}` }],
  });
  if (resp.stop_reason === "refusal") {
    return "I can't answer that one. Want to keep going with the lesson?";
  }
  return textOf(resp.content as any).trim();
}
