// useLessonStore — Per-lesson state: correct streak, combo, knowledge score, audio
import { create } from "zustand";

interface AudioState {
  isPlaying: boolean;
  speed: number;
  hasPlayed: boolean;
}

interface LessonStore {
  // State
  correctStreak: number;
  combo: number;
  knowledgeScore: number;   // 0–100 running score for the current lesson
  audio: AudioState;
  totalQuestions: number;
  correctAnswers: number;

  // Actions
  recordCorrectAnswer: () => void;
  recordWrongAnswer: () => void;
  setAudio: (state: Partial<AudioState>) => void;
  reset: () => void;
  getComboBonus: () => number;
}

export const useLessonStore = create<LessonStore>((set, get) => ({
  correctStreak: 0,
  combo: 0,
  knowledgeScore: 0,
  audio: { isPlaying: false, speed: 1, hasPlayed: false },
  totalQuestions: 0,
  correctAnswers: 0,

  recordCorrectAnswer: () => {
    const state = get();
    const newStreak = state.correctStreak + 1;
    const newCombo = state.combo + 1;
    const newTotal = state.totalQuestions + 1;
    const newCorrect = state.correctAnswers + 1;

    // Knowledge score = running average
    const newScore = Math.round((newCorrect / newTotal) * 100);

    // Combo: every 3 correct = +5 bonus
    const bonus = newCombo % 3 === 0 ? 5 : 0;

    set({
      correctStreak: newStreak,
      combo: newCombo,
      knowledgeScore: newScore,
      totalQuestions: newTotal,
      correctAnswers: newCorrect,
    });

    return bonus;
  },

  recordWrongAnswer: () => {
    set((state) => {
      const newTotal = state.totalQuestions + 1;
      const newScore = Math.round((state.correctAnswers / newTotal) * 100);
      return {
        correctStreak: 0, // Reset streak on wrong answer
        totalQuestions: newTotal,
        knowledgeScore: newScore,
      };
    });
  },

  setAudio: (audioState: Partial<AudioState>) => {
    set((state) => ({
      audio: { ...state.audio, ...audioState },
    }));
  },

  reset: () => {
    set({
      correctStreak: 0,
      combo: 0,
      knowledgeScore: 0,
      audio: { isPlaying: false, speed: 1, hasPlayed: false },
      totalQuestions: 0,
      correctAnswers: 0,
    });
  },

  getComboBonus: () => {
    return Math.floor(get().combo / 3) * 5;
  },
}));
