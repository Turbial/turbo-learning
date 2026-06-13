// lp-ask — the ONLY live student-facing LLM call (the escape hatch).
// embed question → pgvector search lp_lesson_chunks → if below threshold, decline
// with NO model call → else answer grounded in the retrieved chunks.
//
// Client contract matches src/messenger/ask.ts: POST {question, content_version,
// lesson_id?} → {grounded, answer}. Set EXPO_PUBLIC_LP_ASK_URL to this function's
// URL to flip the messenger's Ask from local retrieval to real RAG.
//
// PREVIEW: requires the lp_ tables + lp_match_chunks RPC (learning/migrations) —
// not applied until §8 is approved.
import { createClient } from "npm:@supabase/supabase-js";
import { embedOne } from "../_shared/lp_embed.ts";
import { answerGrounded } from "../_shared/lp_llm.ts";
import { json, preflight } from "../_shared/cors.ts";

const MIN_SIMILARITY = Number(Deno.env.get("LP_ASK_MIN_SIMILARITY") ?? "0.25");
const TOP_K = Number(Deno.env.get("LP_ASK_TOP_K") ?? "5");

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const DECLINE =
  "That's a great question, but it isn't covered in this lesson — so I won't guess. " +
  "Want to keep going, or rephrase it around what we just learned?";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  try {
    const { question, content_version, lesson_id, voice, profile_prompt } = await req.json();
    if (!question || !content_version) return json({ error: "question and content_version required" }, 400);

    const queryEmbedding = await embedOne(question);

    // lp_match_chunks(query_embedding, match_version, match_count) →
    //   { chunk_text, similarity } ordered by similarity desc
    const { data: chunks, error } = await supabase.rpc("lp_match_chunks", {
      query_embedding: queryEmbedding,
      match_version: content_version,
      match_count: TOP_K,
    });
    if (error) throw error;

    const top = chunks?.[0]?.similarity ?? 0;
    if (!chunks?.length || top < MIN_SIMILARITY) {
      return json({ grounded: false, answer: DECLINE }); // threshold short-circuit: no model call
    }

    const context = chunks.map((c: { chunk_text: string }) => c.chunk_text).join("\n---\n");
    const answer = await answerGrounded({ question, chunks: context, voice, profilePrompt: profile_prompt });
    return json({ grounded: true, answer });
  } catch (e) {
    console.error("lp-ask error", e);
    return json({ grounded: false, answer: DECLINE, error: String(e) }, 200);
  }
});
