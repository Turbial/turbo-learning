import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LocalProgressStore {
  completedUnitIds: string[]
  markCompleted: (unitId: string) => void
  isCompleted: (unitId: string) => boolean
  reset: () => void
}

export const useLocalProgressStore = create<LocalProgressStore>()(
  persist(
    (set, get) => ({
      completedUnitIds: [],

      markCompleted: (unitId: string) =>
        set((s) => {
          if (s.completedUnitIds.includes(unitId)) return s
          return { completedUnitIds: [...s.completedUnitIds, unitId] }
        }),

      isCompleted: (unitId: string) => get().completedUnitIds.includes(unitId),

      reset: () => set({ completedUnitIds: [] }),
    }),
    {
      name: 'local-progress-storage',
    },
  ),
)
