// ─── Offline write queue ───
// Queues Supabase writes when offline. Flushes on reconnect.
// Persisted across app restarts via AsyncStorage.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface QueuedWrite {
  id: string;
  table: string;
  payload: Record<string, unknown>;
  createdAt: number;
}

export interface OfflineQueueStore {
  queue: QueuedWrite[];
  enqueue: (write: Omit<QueuedWrite, "id" | "createdAt">) => void;
  remove: (id: string) => void;
  peek: () => QueuedWrite[];
  size: () => number;
}

export const useOfflineQueueStore = create<OfflineQueueStore>()(
  persist(
    (set, get) => ({
      queue: [],

      enqueue: (write) =>
        set((s) => ({
          queue: [
            ...s.queue,
            { ...write, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: Date.now() },
          ],
        })),

      remove: (id) =>
        set((s) => ({
          queue: s.queue.filter((w) => w.id !== id),
        })),

      peek: () => get().queue,

      size: () => get().queue.length,
    }),
    {
      name: "offline-queue-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
