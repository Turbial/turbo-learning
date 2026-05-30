// ─── Narration abstraction — platform-aware audio ───
// V1: expo-speech (native) / Web Speech API (web) — real-time TTS
// V2: pre-generated MP3 via expo-av — swap implementation, same interface
//
// Priority: pre-generated MP3 (audioUrl) > expo-speech > Web Speech API

import { Platform } from "react-native";
import type { NarrationController } from "../types";

type NarrationCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
};

// ═══ MP3 Narration (expo-av) ═══
// Uses pre-generated audio files. Requires expo-av package.

async function createMp3Narration(
  audioUrl: string,
  text: string,
  cbs: NarrationCallbacks,
): Promise<NarrationController> {
  let playing = false;
  let speed = 1.0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sound: any = null;
  let statusCheckInterval: ReturnType<typeof setInterval> | null = null;

  const cleanup = async () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      statusCheckInterval = null;
    }
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch {
        // Sound may already be unloaded
      }
      sound = null;
    }
  };

  try {
    const { Audio } = await import("expo-av");

    // Configure audio mode for background playback
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch {
      // Audio mode setting can fail in some environments; non-fatal
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: false, rate: 1.0 },
      (status) => {
        if (status.isLoaded && status.didJustFinish) {
          playing = false;
          cbs.onEnd?.();
        }
      },
    );

    sound = newSound;

    const controller: NarrationController = {
      get isPlaying() { return playing; },
      get speed() { return speed; },
      setSpeed(s: number) {
        speed = s;
        // Apply rate change immediately if playing
        if (sound && playing) {
          sound.setRateAsync(s, true).catch(() => {});
        }
      },
      get transcript() { return text; },

      async play() {
        if (playing || !sound) return;
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            if (status.didJustFinish) {
              await sound.setPositionAsync(0);
            }
            await sound.setRateAsync(speed, true);
            await sound.playAsync();
            playing = true;
            cbs.onStart?.();

            // Poll for completion as backup to onPlaybackStatusUpdate
            statusCheckInterval = setInterval(async () => {
              if (!sound) return;
              try {
                const s = await sound.getStatusAsync();
                if (s.isLoaded && s.didJustFinish) {
                  playing = false;
                  cbs.onEnd?.();
                  if (statusCheckInterval) {
                    clearInterval(statusCheckInterval);
                    statusCheckInterval = null;
                  }
                }
              } catch {
                // ignore polling errors
              }
            }, 500);
          }
        } catch (err) {
          console.warn("MP3 play failed:", err);
          playing = false;
        }
      },

      async pause() {
        if (!sound) return;
        try {
          await sound.pauseAsync();
          playing = false;
        } catch {
          // ignore
        }
      },

      async stop() {
        playing = false;
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          statusCheckInterval = null;
        }
        if (sound) {
          try {
            await sound.stopAsync();
          } catch {
            // ignore
          }
        }
      },
    };

    return controller;
  } catch (err) {
    console.warn("MP3 narration unavailable, falling back to expo-speech:", err);
    await cleanup();
    // Fall through to native TTS below
    return createNativeNarration(text, cbs);
  }
}

// ═══ Native: expo-speech ═══

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
      setSpeed(s: number) {
        speed = s;
        // expo-speech doesn't support live rate change — restart if playing
        if (playing) {
          ExpoSpeech.stop();
          playing = false;
          ExpoSpeech.speak(text, {
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
    setSpeed(s: number) {
      speed = s;
      // Web Speech API doesn't support live rate change — restart if playing
      if (playing && utterance) {
        window.speechSynthesis?.cancel();
        utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speed;
        utterance.onstart = () => { playing = true; cbs.onStart?.(); };
        utterance.onend = () => { playing = false; cbs.onEnd?.(); };
        utterance.onerror = () => { playing = false; cbs.onEnd?.(); };
        window.speechSynthesis?.speak(utterance);
      }
    },
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
  audioUrl?: string | null,
  onStart?: () => void,
  onEnd?: () => void,
): NarrationController {
  const cbs: NarrationCallbacks = { onStart, onEnd };

  // V2 path: pre-generated MP3
  if (audioUrl) {
    // Deferred promise pattern — return stub immediately, swap when MP3 loads
    const fallback = createWebNarration(text, cbs);
    let target: NarrationController = fallback;
    let mp3Ready = false;

    createMp3Narration(audioUrl, text, cbs).then((mp3) => {
      fallback.stop();
      target = mp3;
      mp3Ready = true;
    });

    return {
      get isPlaying() { return target.isPlaying; },
      get speed() { return target.speed; },
      setSpeed(s: number) { target.setSpeed(s); },
      get transcript() { return text; },
      play() {
        if (!mp3Ready) return; // Don't play web fallback when MP3 is loading
        target.play();
      },
      pause() { target.pause(); },
      stop() { target.stop(); },
    };
  }

  // V1 path: no audioUrl — use real-time TTS
  if (Platform.OS !== "web") {
    const webStub = createWebNarration(text, cbs);
    let target: NarrationController = webStub;
    let nativeReady = false;

    createNativeNarration(text, cbs).then((native) => {
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
        if (!nativeReady) return;
        target.play();
      },
      pause() { target.pause(); },
      stop() { target.stop(); },
    };
  }

  return createWebNarration(text, cbs);
}
