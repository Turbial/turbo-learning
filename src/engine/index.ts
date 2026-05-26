// ─── Engine barrel — single import for the engine core ───

export { default as LessonPlayer } from "./LessonPlayer";
export type { LessonPlayerProps, LessonPlayerState } from "./LessonPlayer";
export { stepRegistry } from "./stepRegistry";
export type { StepProps, StepHandler } from "./stepRegistry";
export { lessonReducer, createInitialState, isLastStep, completionScore } from "./lessonMachine";
export type { MachineAction } from "./lessonMachine";
export * from "./scoring";
export * from "./types";
export { createNarration } from "./narration/useNarration";
