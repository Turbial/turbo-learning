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
// Lazy-imported to avoid web bundling issues.
// expo-speech v56 exposes top-level speak/stop/pause/resume (iOS/web for pause/resume).

async function createNativeNarration(
  text: string,
  cbs: NarrationCallbacks,
  initialSpeed: number,
): Promise<NarrationController> {
  let playing = false;
  let speed = initialSpeed;

  try {
    const {
      speak: speechSpeak,
      stop: speechStop,
      pause: speechPause,
      resume: speechResume,
    } = await import("expo-speech");

    const controller: NarrationController = {
      get isPlaying() { return playing; },
      get speed() { return speed; },
      setSpeed(s: number) {
        speed = s;
        // If currently playing, restart with new rate
        if (playing) {
          speechStop();
          playing = false;
          speechSpeak(text, {
            rate: speed,
            onStart: () => { playing = true; cbs.onStart?.(); },
            onDone: () => { playing = false; cbs.onEnd?.(); },
            onStopped: () => { playing = false; },
          });
        }
      },
      get transcript() { return text; },

      play() {
        if (playing) return;
        speechSpeak(text, {
          rate: speed,
          onStart: () => { playing = true; cbs.onStart?.(); },
          onDone: () => { playing = false; cbs.onEnd?.(); },
          onStopped: () => { playing = false; },
        });
      },

      pause() {
        speechPause();
        playing = false;
      },

      resume() {
        speechResume();
        playing = true;
      },

      stop() {
        speechStop();
        playing = false;
      },
    };

    return controller;
  } catch {
    // expo-speech not available, fall through to web (won't work on real native
    // but prevents crash during development / testing on web)
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

    resume() {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.resume();
      playing = true;
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
    // Deferred loading: start with a null-target proxy, swap in the native
    // controller once expo-speech is loaded. Queue play() calls so they
    // aren't silently dropped during the async load window.
    let target: NarrationController | null = null;
    let nativeReady = false;
    let playQueued = false;
    let pendingSpeed: number | null = null;

    // Kick off the native load immediately
    createNativeNarration(text, cbs, pendingSpeed ?? 1.0).then((native) => {
      // Apply any speed that was set before native loaded
      if (pendingSpeed !== null) {
        native.setSpeed(pendingSpeed);
      }
      target = native;
      nativeReady = true;

      // Replay any queued play() call
      if (playQueued) {
        playQueued = false;
        native.play();
      }
    });

    return {
      get isPlaying() {
        return target?.isPlaying ?? false;
      },
      get speed() {
        return target?.speed ?? pendingSpeed ?? 1.0;
      },
      setSpeed(s: number) {
        pendingSpeed = s;
        if (nativeReady && target) {
          target.setSpeed(s);
        }
      },
      get transcript() {
        return text;
      },

      play() {
        if (!nativeReady || !target) {
          // Queue the play intent — it will replay once native is ready
          playQueued = true;
          return;
        }
        target.play();
      },

      pause() {
        target?.pause();
      },

      resume() {
        target?.resume();
      },

      stop() {
        playQueued = false;
        target?.stop();
      },
    };
  }

  return createWebNarration(text, cbs);
}
