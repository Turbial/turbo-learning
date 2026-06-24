// ─── Messenger lesson registry (Phase 1: local compiled graphs) ───
// Maps a route id → a compiled lesson graph, in course order so lessons can chain
// (a "Next lesson →" button on completion). In Phase 2 this is replaced by a
// Supabase serve query over lp_lesson_items; the route + ChatPlayer stay the same.

import type { CompiledCourse, CompiledLesson } from "./types";
import aiOperatorDay1 from "../../learning/courses/ai_operator/day1.compiled.json";
import aiOperatorDay2 from "../../learning/courses/ai_operator/day2.compiled.json";
import aiOperatorDay3 from "../../learning/courses/ai_operator/day3.compiled.json";

const COURSES: Record<string, CompiledCourse> = {
  "ai-operator-day1": aiOperatorDay1 as unknown as CompiledCourse,
  "ai-operator-day2": aiOperatorDay2 as unknown as CompiledCourse,
  "ai-operator-day3": aiOperatorDay3 as unknown as CompiledCourse,
};

// Ordered tracks → drives the "Next lesson" hand-off between days.
const TRACKS: Record<string, string[]> = {
  "ai-operator": ["ai-operator-day1", "ai-operator-day2", "ai-operator-day3"],
};

function nextLessonId(lessonId: string): string | undefined {
  for (const ids of Object.values(TRACKS)) {
    const i = ids.indexOf(lessonId);
    if (i >= 0 && i < ids.length - 1) return ids[i + 1];
  }
  return undefined;
}

export interface LoadedLesson {
  lesson: CompiledLesson;
  courseTitle: string;
  nextLessonId?: string;
}

export function loadMessengerLesson(lessonId: string): LoadedLesson | null {
  const course = COURSES[lessonId];
  if (!course || !course.lessons.length) return null;
  return {
    lesson: course.lessons[0],
    courseTitle: course.course.title,
    nextLessonId: nextLessonId(lessonId),
  };
}

export const MESSENGER_LESSON_IDS = Object.keys(COURSES);
