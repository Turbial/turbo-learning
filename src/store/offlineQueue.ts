// ─── Offline write queue ───
// Queues Supabase writes when offline. Flushes on reconnect.

import { create } from "zustand";

export interface QueuedWrite {
  id: string;
  table: string;
  payload: Record<string, unknown>;
  createdAt: number;
}

export interface OfflineQueueStore {
  queue: QueuedWrite[];
  enqueue: (write: Omit<QueuedWrite, "id" | "createdAt">) => void;
  dequeue: (id: string) => void;
  flush: () => QueuedWrite[];
  size: () => number;
}

export const useOfflineQueueStore = create<OfflineQueueStore>((set, get) => ({
  queue: [],

  enqueue: (write) =>
    set((s) => ({
      queue: [
        ...s.queue,
        { ...write, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: Date.now() },
      ],
    })),

  dequeue: (id) =>
    set((s) => ({
      queue: s.queue.filter((w) => w.id !== id),
    })),

  flush: () => {
    const { queue } = get();
    set({ queue: [] });
    return queue;
  },

  size: () => get().queue.length,
}));
