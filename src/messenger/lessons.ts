// ─── Messenger lesson registry (Phase 1: local compiled graphs) ───
// Maps a route id → a compiled lesson graph. In Phase 2 this is replaced by a
// Supabase serve query over lp_lesson_items; the route + ChatPlayer stay the same.

import type { CompiledCourse, CompiledLesson } from "./types";
import aiOperatorDay1 from "../../learning/courses/ai_operator/day1.compiled.json";

const COURSES: Record<string, CompiledCourse> = {
  "ai-operator-day1": aiOperatorDay1 as unknown as CompiledCourse,
};

export interface LoadedLesson {
  lesson: CompiledLesson;
  courseTitle: string;
}

export function loadMessengerLesson(lessonId: string): LoadedLesson | null {
  const course = COURSES[lessonId];
  if (!course || !course.lessons.length) return null;
  return { lesson: course.lessons[0], courseTitle: course.course.title };
}

export const MESSENGER_LESSON_IDS = Object.keys(COURSES);
