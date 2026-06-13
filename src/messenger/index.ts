// ─── Messenger module barrel ───
export { default as ChatPlayer } from "./ChatPlayer";
export type { ChatPlayerProps } from "./ChatPlayer";
export { loadMessengerLesson, MESSENGER_LESSON_IDS } from "./lessons";
export type { LoadedLesson } from "./lessons";
export { getEntry, getItem, resolveTap } from "./resolve";
export { askQuestion } from "./ask";
export { messengerBackendEnabled, backendStart, backendTap, backendProgress, backendNextAdaptive } from "./backend";
export { weakestConcept, targetDifficulty, pickAdaptiveItem } from "./adaptive";
export * from "./types";
