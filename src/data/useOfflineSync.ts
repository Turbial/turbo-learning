// ─── Offline sync hook — flushes queued writes on reconnect ───

import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { supabase } from "./supabase";
import { useOfflineQueueStore } from "../store/offlineQueue";

export function useOfflineSync() {
  const { queue, flush, size } = useOfflineQueueStore();
  const flushingRef = useRef(false);

  const processQueue = async () => {
    if (flushingRef.current || size() === 0) return;
    flushingRef.current = true;

    const writes = flush();
    let succeeded = 0;
    let failed = 0;

    for (const write of writes) {
      try {
        const { error } = await supabase
          .from(write.table as any)
          .insert(write.payload);

        if (error) {
          console.warn("Offline flush failed for", write.table, error.message);
          failed++;
        } else {
          succeeded++;
        }
      } catch (err) {
        console.warn("Offline flush error:", err);
        failed++;
      }
    }

    if (failed > 0) {
      console.log(`Offline flush: ${succeeded} succeeded, ${failed} failed`);
    }

    flushingRef.current = false;
  };

  // Flush when app comes to foreground
  useEffect(() => {
    const handleChange = (nextState: AppStateStatus) => {
      if (nextState === "active" && size() > 0) {
        processQueue();
      }
    };

    const sub = AppState.addEventListener("change", handleChange);
    return () => sub.remove();
  }, []);

  // Also flush periodically while active
  useEffect(() => {
    const interval = setInterval(() => {
      if (size() > 0) processQueue();
    }, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { queueSize: queue.length, isFlushing: flushingRef.current, flushNow: processQueue };
}
