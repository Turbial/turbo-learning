// LLM calls for the lp_* pipeline (LLM owns meaning; the compiler owns structure).
//
// Provider: DeepSeek (OpenAI-compatible chat completions). Models default to
// deepseek-chat (DeepSeek-V3) and are env-overridable:
//   DEEPSEEK_API_KEY    required
//   DEEPSEEK_BASE_URL   default https://api.deepseek.com
//   LP_GEN_MODEL        ingest generation model (default deepseek-chat)
//   LP_ASK_MODEL        live Ask model          (default deepseek-chat)
//
// DeepSeek exposes no embeddings API — the Ask retrieval embeddings come from a
// separate provider (see lp_embed.ts).

const BASE_URL = Deno.env.get("DEEPSEEK_BASE_URL") ?? "https://api.deepseek.com";
const API_KEY = Deno.env.get("DEEPSEEK_API_KEY") ?? "";
const GEN_MODEL = Deno.env.get("LP_GEN_MODEL") ?? "deepseek-chat";
const ASK_MODEL = Deno.env.get("LP_ASK_MODEL") ?? "deepseek-chat";

interface ChatArgs {
  model: string;
  system: string;
  user: string;
  maxTokens: number;
  temperature: number;
  json?: boolean;
}

async function chat(args: ChatArgs): Promise<string> {
  if (!API_KEY) throw new Error("DEEPSEEK_API_KEY is not set");
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: args.model,
      messages: [
        { role: "system", content: args.system },
        { role: "user", content: args.user },
      ],
      max_tokens: args.maxTokens,
      temperature: args.temperature,
      stream: false,
      ...(args.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`deepseek ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
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
    ? `\n\nYour previous JSON failed compilation with:\n${repairError}\nFix it and return corrected JSON.`
    : "";
  const text = await chat({
    model: GEN_MODEL,
    system: GEN_SYSTEM,
    user: `TITLE: ${title}\nVOICE: ${voice ?? "(none)"}\n\nMATERIAL:\n${sourceText}\n\nReturn the authoring JSON for this one lesson.${repair}`,
    maxTokens: 8000,
    temperature: 0.2,
    json: true, // DeepSeek JSON mode (the prompt mentions JSON, as required)
  });
  return JSON.parse(extractJson(text));
}

// The single live student-facing call. Grounded in retrieved chunks; declines if
// they don't cover the question. Low temperature + concise prompt for fidelity.
export async function answerGrounded(args: {
  question: string;
  chunks: string;
  voice?: string;
}): Promise<string> {
  const { question, chunks, voice } = args;
  const text = await chat({
    model: ASK_MODEL,
    system:
      "You are a course tutor. Answer the student's question using ONLY the lesson excerpts provided. " +
      "If the excerpts do not contain the answer, say you can't find it in this lesson and offer to keep going — never use outside knowledge. " +
      "Be concise (2-4 sentences). Respond with only the final answer: no preamble, no meta-commentary." +
      (voice ? ` Teaching voice: ${voice}.` : ""),
    user: `LESSON EXCERPTS:\n${chunks}\n\nSTUDENT QUESTION: ${question}`,
    maxTokens: 700,
    temperature: 0.3,
  });
  return text.trim();
}
