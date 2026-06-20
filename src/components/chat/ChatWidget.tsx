/**
 * ChatWidget — control the LLM Chat Widget from React.
 *
 * Web-only: loads LLMChatWidget global (must be in HTML via <script src="/widget/chat-widget.js">).
 * Native: no-op.
 *
 * Usage:
 *   <ChatWidget />              // show on this screen
 *   <ChatWidget hidden />       // don't show on this screen
 */

import { useEffect, useRef } from "react";
import { Platform } from "react-native";

declare global {
  interface Window {
    LLMChatWidget?: any;
    __LLMChatReady?: boolean;
  }
}

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://afgmlkduuapquqkcqdsk.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZ21sa2R1dWFwcXVxa2NxZHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDA2NzYsImV4cCI6MjA5MzkxNjY3Nn0.-WQ34Jxy9CmI-SsQfcMNWPZi5AfZCzv9jZHDQ6ccEWc";

const CONFIG = {
  endpoint: `${SUPABASE_URL}/functions/v1/chat`,
  apiKey: SUPABASE_ANON_KEY,
  model: "claude-haiku",
  title: "Turbo Assistant",
  welcomeMessage:
    "Hey! 👋 I'm your Turbo Learning assistant. Ask me about the AI Operator course, AI concepts, or anything you're stuck on.",
  systemPrompt:
    "You are the Turbo Learning assistant for the AI Operator course — a 28-day program teaching people to go from AI user → AI operator. Help students with course concepts, explain AI terminology, and keep them motivated. Be concise, warm, and encouraging.",
  theme: "dark" as const,
  position: "bottom-left" as const,
};

let globalInstance: any = null; // singleton — one widget at a time

interface Props {
  hidden?: boolean;
}

export default function ChatWidget({ hidden = false }: Props) {
  const destroyedRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (hidden) {
      // Destroy if visible
      if (globalInstance) {
        try { globalInstance.destroy(); } catch (_) {}
        globalInstance = null;
        console.log("[ChatWidget] Hidden — destroyed");
      }
      return;
    }

    destroyedRef.current = false;

    // Wait for widget script to load
    function tryInit(attempts: number) {
      if (destroyedRef.current) return;

      const W = window.LLMChatWidget;
      if (W) {
        // Destroy previous if any
        if (globalInstance) {
          try { globalInstance.destroy(); } catch (_) {}
          globalInstance = null;
        }
        globalInstance = W.init(CONFIG);
        console.log("[ChatWidget] Initialized on this page");
        return;
      }

      if (attempts < 50) {
        setTimeout(() => tryInit(attempts + 1), 200);
      } else {
        console.warn("[ChatWidget] LLMChatWidget not available after 10s — giving up");
      }
    }

    tryInit(0);

    return () => {
      destroyedRef.current = true;
      // Note: we DON'T destroy on unmount here — the widget stays visible
      // across React navigation. It only gets destroyed when hidden=true is set.
    };
  }, [hidden]);

  return null;
}
