// lp-serve — the button-action state machine (LLM-FREE). Server mirror of
// src/messenger/resolve.ts, reading lp_lesson_items and recording progress.
//
//   POST {op:"start", lesson_id}                         → entry item
//   POST {op:"tap", user_id, lesson_id, current_item_id,
//         action, to, correct?}                          → {next, mastery?}
//
// Every tap writes lp_progress_events (mastery + served-tracking). No model call
// fires here — that is the whole point. The escape action returns {escape:true}
// and the client hands off to lp-ask.
//
// PREVIEW: requires lp_ tables — not applied until §8 is approved. Auth here uses
// the service role + a body user_id; wire real JWT/RLS when activating.
import { createClient } from "npm:@supabase/supabase-js";
import { json, preflight } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function getItem(id: string) {
  const { data, error } = await supabase
    .from("lp_lesson_items")
    .select("id,lesson_id,item_type,concept_tag,difficulty,bot_text,buttons,is_entry,content_version")
    .eq("id", id)
    .eq("status", "live")
    .single();
  if (error) throw error;
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  try {
    const body = await req.json();

    if (body.op === "start") {
      const { data, error } = await supabase
        .from("lp_lesson_items")
        .select("id,lesson_id,item_type,concept_tag,difficulty,bot_text,buttons,is_entry,content_version")
        .eq("lesson_id", body.lesson_id)
        .eq("is_entry", true)
        .eq("status", "live")
        .single();
      if (error) throw error;
      return json({ item: data });
    }

    if (body.op === "tap") {
      const { user_id, lesson_id, current_item_id, action, to, correct } = body;
      const current = await getItem(current_item_id);
      const wasCorrect = action === "answer" && typeof correct === "boolean" ? correct : null;

      // Record the tap (mastery + no-repeat served-tracking).
      await supabase.from("lp_progress_events").insert({
        user_id, lesson_id, item_id: current_item_id,
        concept_tag: current.concept_tag, was_correct: wasCorrect,
      });

      // Bump per-concept mastery on graded answers.
      if (action === "answer" && current.concept_tag && typeof correct === "boolean") {
        await supabase.rpc("lp_bump_mastery", {
          p_user: user_id, p_lesson: lesson_id, p_concept: current.concept_tag, p_correct: correct,
        });
      }

      if (action === "escape") return json({ escape: true });

      const next = to ? await getItem(to) : null;
      return json({ next });
    }

    return json({ error: "unknown op" }, 400);
  } catch (e) {
    console.error("lp-serve error", e);
    return json({ error: String(e) }, 500);
  }
});
