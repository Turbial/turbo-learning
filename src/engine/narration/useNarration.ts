// ─── Narration abstraction — platform-aware TTS ───
// Native: expo-speech. Web: Web Speech API.
// V2: pre-generated MP3 via expo-audio (swap implementation, same interface)

import { Platform } from "react-native";
import type { NarrationController } from "../types";

type NarrationCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
};

// ═══ Native: expo-speech ═══
// Lazy-imported to avoid web bundling issues

async function createNativeNarration(
  text: string,
  cbs: NarrationCallbacks,
): Promise<NarrationController> {
  let playing = false;
  let speed = 1.0;

  try {
    const { Speech } = await import("expo-speech");

    const controller: NarrationController = {
      get isPlaying() { return playing; },
      get speed() { return speed; },
      setSpeed(s: number) { speed = s; },
      get transcript() { return text; },

      play() {
        if (playing) return;
        Speech.speak(text, {
          rate: speed,
          onStart: () => { playing = true; cbs.onStart?.(); },
          onDone: () => { playing = false; cbs.onEnd?.(); },
          onStopped: () => { playing = false; },
        });
      },

      pause() {
        Speech.pause();
        playing = false;
      },

      stop() {
        Speech.stop();
        playing = false;
      },
    };

    return controller;
  } catch {
    // expo-speech not available, fall through to web
    return createWebNarration(text, cbs);
  }
}

// ═══ Web: Web Speech API ═══

function createWebNarration(
  text: string,
  cbs: NarrationCallbacks,
): NarrationController {
  let playing = false;
  let speed = 1.0;
  let utterance: SpeechSynthesisUtterance | null = null;

  const controller: NarrationController = {
    get isPlaying() { return playing; },
    get speed() { return speed; },
    setSpeed(s: number) { speed = s; },
    get transcript() { return text; },

    play() {
      if (playing || typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.onstart = () => { playing = true; cbs.onStart?.(); };
      utterance.onend = () => { playing = false; cbs.onEnd?.(); };
      utterance.onerror = () => { playing = false; cbs.onEnd?.(); };
      window.speechSynthesis.speak(utterance);
    },

    pause() {
      window.speechSynthesis?.pause();
      playing = false;
    },

    stop() {
      window.speechSynthesis?.cancel();
      playing = false;
      utterance = null;
    },
  };

  return controller;
}

// ═══ Factory ═══

export function createNarration(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
): NarrationController {
  const cbs: NarrationCallbacks = { onStart, onEnd };
  if (Platform.OS !== "web") {
    // Return a sync stub; native impl resolves async
    const stub = createWebNarration(text, cbs);
    createNativeNarration(text, cbs).then((native) => {
      // Swap in native controller via object mutation
      Object.assign(stub, native);
    });
    return stub;
  }
  return createWebNarration(text, cbs);
}
