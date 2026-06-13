// ─── Messenger module barrel ───
export { default as ChatPlayer } from "./ChatPlayer";
export type { ChatPlayerProps } from "./ChatPlayer";
export { loadMessengerLesson, MESSENGER_LESSON_IDS } from "./lessons";
export type { LoadedLesson } from "./lessons";
export { getEntry, getItem, resolveTap } from "./resolve";
export { askQuestion } from "./ask";
export { messengerBackendEnabled, backendStart, backendTap, backendProgress, backendNextAdaptive } from "./backend";
export { weakestConcept, targetDifficulty, pickAdaptiveItem } from "./adaptive";
export { useLearnerProfile, hasProfile, profileSummary, profilePrompt, INDUSTRIES, SKILL_LEVELS } from "./profile";
export type { LearnerProfile, SkillLevel } from "./profile";
export { default as PersonalizeSheet } from "./PersonalizeSheet";
export * from "./types";
