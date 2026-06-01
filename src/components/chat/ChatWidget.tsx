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

const CONFIG = {
  endpoint: "https://api.deepseek.com/v1/chat/completions",
  apiKey: "sk-3e898d7853f343c087332e0a155059a1",
  model: "deepseek-chat",
  title: "Turbo Assistant",
  welcomeMessage:
    "Hey! 👋 I'm your Turbo Learning assistant. Ask me about the AI Operator course, AI concepts, or anything you're stuck on.",
  systemPrompt:
    "You are the Turbo Learning assistant for the AI Operator course — a 28-day program teaching people to go from AI user → AI operator. Help students with course concepts, explain AI terminology, and keep them motivated. Be concise, warm, and encouraging.",
  theme: "dark" as const,
  position: "bottom-right" as const,
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
