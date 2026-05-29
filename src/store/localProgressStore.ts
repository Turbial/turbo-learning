// ─── Local progress tracker — persists completed unit IDs in AsyncStorage ───
// Works even when Supabase RLS blocks anon reads. Mirrors the DB but locally.
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LocalProgressStore {
  completedUnitIds: string[];
  markCompleted: (unitId: string) => void;
  isCompleted: (unitId: string) => boolean;
  reset: () => void;
}

export const useLocalProgressStore = create<LocalProgressStore>()(
  persist(
    (set, get) => ({
      completedUnitIds: [],

      markCompleted: (unitId: string) =>
        set((s) => {
          if (s.completedUnitIds.includes(unitId)) return s;
          return { completedUnitIds: [...s.completedUnitIds, unitId] };
        }),

      isCompleted: (unitId: string) => get().completedUnitIds.includes(unitId),

      reset: () => set({ completedUnitIds: [] }),
    }),
    {
      name: "local-progress-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
