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
    const ExpoSpeech = await import("expo-speech");

    const controller: NarrationController = {
      get isPlaying() { return playing; },
      get speed() { return speed; },
      setSpeed(s: number) { speed = s; },
      get transcript() { return text; },

      play() {
        if (playing) return;
        ExpoSpeech.speak(text, {
          rate: speed,
          onStart: () => { playing = true; cbs.onStart?.(); },
          onDone: () => { playing = false; cbs.onEnd?.(); },
          onStopped: () => { playing = false; },
        });
      },

      pause() {
        ExpoSpeech.pause();
        playing = false;
      },

      stop() {
        ExpoSpeech.stop();
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
    // Deferred: start with a web-hybrid stub, swap in native controller when ready.
    // All calls (play/pause/stop) are routed through a targetRef to avoid
    // Object.assign mutation which can trigger Web Speech API on native devices.
    const webStub = createWebNarration(text, cbs);
    let target: NarrationController = webStub;
    let nativeReady = false;

    createNativeNarration(text, cbs).then((native) => {
      // Stop the web stub before swapping to avoid overlapping audio
      webStub.stop();
      target = native;
      nativeReady = true;
    });

    return {
      get isPlaying() { return target.isPlaying; },
      get speed() { return target.speed; },
      setSpeed(s: number) { target.setSpeed(s); },
      get transcript() { return text; },
      play() {
        if (!nativeReady) return; // Don't play web speech on native
        target.play();
      },
      pause() { target.pause(); },
      stop() { target.stop(); },
    };
  }
  return createWebNarration(text, cbs);
}
