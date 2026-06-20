// ─── Question Bank — normalizes MC + TF steps from all 28 AI Operator days ───

import day1 from "../content/ai_operator/day1.json";
import day2 from "../content/ai_operator/day2.json";
import day3 from "../content/ai_operator/day3.json";
import day4 from "../content/ai_operator/day4.json";
import day5 from "../content/ai_operator/day5.json";
import day6 from "../content/ai_operator/day6.json";
import day7 from "../content/ai_operator/day7.json";
import day8 from "../content/ai_operator/day8.json";
import day9 from "../content/ai_operator/day9.json";
import day10 from "../content/ai_operator/day10.json";
import day11 from "../content/ai_operator/day11.json";
import day12 from "../content/ai_operator/day12.json";
import day13 from "../content/ai_operator/day13.json";
import day14 from "../content/ai_operator/day14.json";
import day15 from "../content/ai_operator/day15.json";
import day16 from "../content/ai_operator/day16.json";
import day17 from "../content/ai_operator/day17.json";
import day18 from "../content/ai_operator/day18.json";
import day19 from "../content/ai_operator/day19.json";
import day20 from "../content/ai_operator/day20.json";
import day21 from "../content/ai_operator/day21.json";
import day22 from "../content/ai_operator/day22.json";
import day23 from "../content/ai_operator/day23.json";
import day24 from "../content/ai_operator/day24.json";
import day25 from "../content/ai_operator/day25.json";
import day26 from "../content/ai_operator/day26.json";
import day27 from "../content/ai_operator/day27.json";
import day28 from "../content/ai_operator/day28.json";

export type BankQuestion = {
  id: string;
  type: "mc" | "tf";
  question: string;
  options?: string[];       // MC only
  correct: number | boolean;
  feedback: string[];       // index 0 = correct, index 1 = wrong
  day: number;
};

const allDays = [
  day1, day2, day3, day4, day5, day6, day7,
  day8, day9, day10, day11, day12, day13, day14,
  day15, day16, day17, day18, day19, day20, day21,
  day22, day23, day24, day25, day26, day27, day28,
];

export const QUESTION_BANK: BankQuestion[] = allDays.flatMap((d, i) => {
  const dayNum = i + 1;
  return (d.steps as any[])
    .filter((step) => step.type === "mc" || step.type === "tf")
    .map((step): BankQuestion => {
      if (step.type === "mc") {
        return {
          id: step.id,
          type: "mc",
          question: step.question,
          options: step.options,
          correct: step.correct,
          feedback: [step.feedback[0], step.feedback[1]],
          day: dayNum,
        };
      } else {
        // tf
        return {
          id: step.id,
          type: "tf",
          question: step.question,
          correct: step.correct,
          feedback: [step.feedback[0], step.feedback[1]],
          day: dayNum,
        };
      }
    });
});
