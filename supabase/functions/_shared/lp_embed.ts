// Embeddings helper — provider-agnostic (Anthropic has no embeddings API, so the
// Ask retrieval path uses a separate embeddings provider). Defaults to OpenAI's
// text-embedding-3-small (1536 dims), which matches lp_lesson_chunks.embedding
// vector(1536) in the preview schema. Override via env to use Voyage etc.
//
// Env:
//   LP_EMBED_URL        default https://api.openai.com/v1/embeddings
//   LP_EMBED_MODEL      default text-embedding-3-small  (1536 dims)
//   LP_EMBED_API_KEY    (falls back to OPENAI_API_KEY)

const EMBED_URL = Deno.env.get("LP_EMBED_URL") ?? "https://api.openai.com/v1/embeddings";
const EMBED_MODEL = Deno.env.get("LP_EMBED_MODEL") ?? "text-embedding-3-small";
const EMBED_KEY = Deno.env.get("LP_EMBED_API_KEY") ?? Deno.env.get("OPENAI_API_KEY") ?? "";

export async function embed(texts: string[]): Promise<number[][]> {
  if (!EMBED_KEY) throw new Error("LP_EMBED_API_KEY (or OPENAI_API_KEY) is not set");
  const res = await fetch(EMBED_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${EMBED_KEY}` },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });
  if (!res.ok) throw new Error(`embeddings ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.data as Array<{ embedding: number[] }>).map((d) => d.embedding);
}

export async function embedOne(text: string): Promise<number[]> {
  const [v] = await embed([text]);
  return v;
}
