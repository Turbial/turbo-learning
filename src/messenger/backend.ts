// ─── Optional Supabase backend for the messenger (feature-flagged) ───
//
// Phase 1 serves the state machine locally (resolve.ts over compiled JSON) and is
// the default. When EXPO_PUBLIC_LP_SERVE_URL is set (after §8 / Phase 2 deploy),
// these call the lp-serve Edge Function over lp_lesson_items instead — same shapes
// as resolve.ts, so ChatPlayer's logic is unchanged when it's swapped to async.
//
// The Ask escape hatch is wired separately and already live-or-local: ask.ts uses
// EXPO_PUBLIC_LP_ASK_URL when present. This module covers the serve path.

import type { CompiledItem, ItemButton } from "./types";

const SERVE_URL = process.env.EXPO_PUBLIC_LP_SERVE_URL;

/** True when the messenger should source its state machine from Supabase. */
export const messengerBackendEnabled = Boolean(SERVE_URL);

async function post<T>(body: unknown): Promise<T> {
  const res = await fetch(SERVE_URL as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`lp-serve ${res.status}`);
  return (await res.json()) as T;
}

/** Fetch the entry (menu) item for a lesson. */
export async function backendStart(lessonId: string): Promise<CompiledItem> {
  const { item } = await post<{ item: CompiledItem }>({ op: "start", lesson_id: lessonId });
  return item;
}

/** Resolve a button tap server-side. Returns the next item, or escape=true. */
export async function backendTap(args: {
  userId: string;
  lessonId: string;
  current: CompiledItem;
  button: ItemButton;
}): Promise<{ next?: CompiledItem; escape?: boolean }> {
  const { userId, lessonId, current, button } = args;
  return post<{ next?: CompiledItem; escape?: boolean }>({
    op: "tap",
    user_id: userId,
    lesson_id: lessonId,
    current_item_id: current.id,
    action: button.action,
    to: button.to,
    correct: button.correct,
  });
}
