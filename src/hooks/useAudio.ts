// useAudio — expo-speech wrapper: no auto-play, background playback, speed control,
// pause-on-interact, XP tracking (once per lesson)
import { useCallback, useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";
import { Platform } from "react-native";

interface UseAudioOptions {
  text: string;
  autoPlay?: boolean;
}

interface UseAudioReturn {
  isPlaying: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  hasPlayed: boolean; // tracks if audio has been played at least once in this session
  setOnFirstPlay: (fn: () => void) => void; // register one-shot callback for first play XP
}

export function useAudio({ text, autoPlay = false }: UseAudioOptions): UseAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const speedRef = useRef(1.0);
  const currentWordRef = useRef(0);
  const xpFiredRef = useRef(false);
  // Callback for when audio first plays in a lesson session
  const onFirstPlayRef = useRef<(() => void) | null>(null);

  /** Register a callback that fires once per lesson when audio first plays */
  const setOnFirstPlay = useCallback((fn: () => void) => {
    onFirstPlayRef.current = fn;
  }, []);

  // Keep speedRef in sync
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const play = useCallback(() => {
    if (!text) return;
    // Stop any ongoing speech
    Speech.stop();

    Speech.speak(text, {
      rate: speedRef.current,
      language: "en-US",
      onStart: () => {
        setIsPlaying(true);
        if (!hasPlayed) {
          setHasPlayed(true);
          // Fire the one-time XP callback on first play
          if (!xpFiredRef.current && onFirstPlayRef.current) {
            xpFiredRef.current = true;
            onFirstPlayRef.current();
          }
        }
      },
      onDone: () => {
        setIsPlaying(false);
        currentWordRef.current = 0;
      },
      onStopped: () => {
        setIsPlaying(false);
        currentWordRef.current = 0;
      },
      onPause: () => {
        setIsPlaying(false);
      },
      onResume: () => {
        setIsPlaying(true);
      },
    });
  }, [text]);

  const pause = useCallback(() => {
    Speech.pause();
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    currentWordRef.current = 0;
  }, []);

  const handleSetSpeed = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
    // If currently playing, restart with new speed
    if (isPlaying) {
      const remaining = text.slice(currentWordRef.current);
      Speech.stop();
      if (remaining) {
        Speech.speak(remaining, {
          rate: newSpeed,
          language: "en-US",
          onStart: () => setIsPlaying(true),
          onDone: () => setIsPlaying(false),
          onStopped: () => setIsPlaying(false),
        });
      }
    }
  }, [isPlaying, text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Auto-play if configured
  useEffect(() => {
    if (autoPlay && text) {
      // Small delay to ensure the component is mounted
      const timer = setTimeout(() => play(), 300);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isPlaying,
    speed,
    play,
    pause,
    stop,
    setSpeed: handleSetSpeed,
    hasPlayed,
    setOnFirstPlay,
  };
}
