// lp-ingest — the batch pipeline (the only place generation cost lives).
//
//   POST {lesson_id} → reads lp_lessons.content, then:
//   1. hash content → content_version; if unchanged, no-op (cache key)
//   2. chunk + embed source → lp_lesson_chunks         (for Ask retrieval)
//   3. LLM generates content-only authoring JSON        (1 call, +1 retry on compile fail)
//   4. compileLesson wires + VALIDATES the graph        (deterministic; hard gate)
//   5. insert lp_lesson_items, retire prior version
//
// ≤3 LLM calls/job by design (generation + at most one repair; embeddings are a
// separate provider). Serve-time stays LLM-free.
//
// PREVIEW: requires lp_ tables — not applied until §8 is approved.
import { createClient } from "npm:@supabase/supabase-js";
import { embed } from "../_shared/lp_embed.ts";
import { generateAuthoringLesson } from "../_shared/lp_llm.ts";
import { compileLesson, type AuthoringLesson } from "../_shared/lp_compile.ts";
import { json, preflight } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ~500-token chunks (≈2000 chars) with light overlap, split on paragraph breaks.
function chunk(text: string, size = 2000, overlap = 200): string[] {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const out: string[] = [];
  let buf = "";
  for (const p of paras) {
    if ((buf + "\n\n" + p).length > size && buf) {
      out.push(buf);
      buf = buf.slice(Math.max(0, buf.length - overlap)) + "\n\n" + p;
    } else {
      buf = buf ? buf + "\n\n" + p : p;
    }
  }
  if (buf) out.push(buf);
  return out;
}

async function sha256(s: string): Promise<string> {
  const norm = (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(norm));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  try {
    const { lesson_id } = await req.json();
    if (!lesson_id) return json({ error: "lesson_id required" }, 400);

    const { data: lesson, error: lErr } = await supabase
      .from("lp_lessons")
      .select("id,title,content,content_version,key_concepts")
      .eq("id", lesson_id)
      .single();
    if (lErr) throw lErr;

    const content_version = await sha256(lesson.content ?? "");
    if (content_version === lesson.content_version) {
      return json({ status: "unchanged", content_version }); // cache hit — nothing to do
    }

    // 2) chunk + embed for Ask
    const chunks = chunk(lesson.content ?? "");
    if (chunks.length) {
      const vectors = await embed(chunks);
      await supabase.from("lp_lesson_chunks").delete().eq("lesson_id", lesson_id);
      await supabase.from("lp_lesson_chunks").insert(
        chunks.map((chunk_text, i) => ({
          lesson_id, content_version, chunk_index: i, chunk_text, embedding: vectors[i],
        })),
      );
    }

    // 3) generate → 4) compile (retry once on a compile failure)
    let compiled;
    let authoring = (await generateAuthoringLesson({ title: lesson.title, sourceText: lesson.content ?? "" })) as AuthoringLesson;
    try {
      compiled = await compileLesson(authoring);
    } catch (e1) {
      authoring = (await generateAuthoringLesson({
        title: lesson.title, sourceText: lesson.content ?? "", repairError: String(e1),
      })) as AuthoringLesson;
      compiled = await compileLesson(authoring); // throws → nothing published
    }

    // 5) insert items at the new version, retire the old
    await supabase.from("lp_lesson_items")
      .update({ status: "retired" })
      .eq("lesson_id", lesson_id)
      .neq("content_version", content_version);

    const rows = compiled.items.map((it) => ({ ...it, lesson_id }));
    const { error: iErr } = await supabase.from("lp_lesson_items").insert(rows);
    if (iErr) throw iErr;

    await supabase.from("lp_lessons")
      .update({ content_version, key_concepts: compiled.key_concepts, items_generated_at: new Date().toISOString() })
      .eq("id", lesson_id);

    return json({ status: "ingested", content_version, items: rows.length, concepts: compiled.key_concepts.length });
  } catch (e) {
    console.error("lp-ingest error", e);
    return json({ error: String(e) }, 500);
  }
});
