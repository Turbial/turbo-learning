// supabase/functions/chat — AI tutor proxy using Anthropic Claude
// Body: { messages: [{role, content}], systemPrompt?: string }
// Returns OpenAI-compatible response so both ChatStep and ChatWidget can consume it.
// Set ANTHROPIC_API_KEY in Supabase project secrets; gracefully degrades without it.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 500;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  systemPrompt?: string;
  // OpenAI-compat fields (ignored, kept for widget compatibility)
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const body: ChatRequest = await req.json();
    const { messages, systemPrompt } = body;

    if (!messages || messages.length === 0) {
      return json({ error: "messages is required" }, 400);
    }

    if (!ANTHROPIC_API_KEY) {
      console.warn("ANTHROPIC_API_KEY not set — returning placeholder");
      return json(openAiReply("I'm your AI tutor! In production, I'll answer your questions about the lesson in real time. (API key not configured yet.)"), 200);
    }

    // Collect system prompt: explicit systemPrompt param wins, else extract from messages
    const systemMessages = messages.filter((m) => m.role === "system");
    const system = systemPrompt ?? systemMessages.map((m) => m.content).join("\n") ??
      "You are a helpful AI learning assistant. Answer questions concisely and warmly.";

    // Only pass user/assistant turns to Anthropic (no system role in messages array)
    const anthropicMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages: anthropicMessages,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic API error:", res.status, err);
      throw new Error(`Anthropic ${res.status}: ${err}`);
    }

    const data = await res.json();
    const reply = data.content?.[0]?.text ?? "Sorry, I couldn't generate a response.";
    return json(openAiReply(reply), 200);
  } catch (err) {
    console.error("chat function error:", err);
    return json({ error: String(err) }, 500);
  }
});

function openAiReply(content: string) {
  return {
    choices: [{ message: { role: "assistant", content } }],
  };
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}
