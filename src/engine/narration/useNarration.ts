// ─── Narration abstraction ───
// V1: expo-speech (native) / Web Speech API (web)
// V2: pre-generated MP3 via expo-audio (swap implementation, same interface)

import type { NarrationController } from "./types";

/**
 * Creates a narration controller that wraps the platform-native TTS.
 * On native: uses expo-speech. On web: uses Web Speech API.
 * The `text` parameter is set once per step and replayed on demand.
 */
export function createNarration(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
): NarrationController {
  let playing = false;
  let speed = 1.0;
  let utterance: SpeechSynthesisUtterance | null = null;

  // V1: Web Speech API (works in all browsers; expo-speech on native)
  // We use a web-first implementation here since the engine is cross-platform.
  // On native, expo-speech would be used instead — same interface.

  const controller: NarrationController = {
    get isPlaying() {
      return playing;
    },
    get speed() {
      return speed;
    },
    setSpeed(s: number) {
      speed = s;
    },
    get transcript() {
      return text;
    },

    play() {
      if (playing) return;

      // Web Speech API path
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speed;
        utterance.onstart = () => {
          playing = true;
          onStart?.();
        };
        utterance.onend = () => {
          playing = false;
          onEnd?.();
        };
        utterance.onerror = () => {
          playing = false;
          onEnd?.();
        };
        window.speechSynthesis.speak(utterance);
      }
    },

    pause() {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.pause();
        playing = false;
      }
    },

    stop() {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        playing = false;
      }
      utterance = null;
    },
  };

  return controller;
}
