import { lessonReducer, createInitialState, isLastStep, completionScore } from "../src/engine/lessonMachine";

describe("lessonReducer", () => {
  const initial = createInitialState("lesson-1");

  it("ADVANCE increments stepIndex", () => {
    const next = lessonReducer(initial, { type: "ADVANCE" });
    expect(next.stepIndex).toBe(1);
  });

  it("BACK decrements stepIndex but never below 0", () => {
    expect(lessonReducer(initial, { type: "BACK" }).stepIndex).toBe(0);
    const at2 = { ...initial, stepIndex: 2 };
    expect(lessonReducer(at2, { type: "BACK" }).stepIndex).toBe(1);
  });

  it("ANSWER with correct=true increments correctCount and totalGraded", () => {
    const next = lessonReducer(initial, {
      type: "ANSWER", stepId: "s1", response: 0, xp: 10, correct: true, comboStreak: 1,
    });
    expect(next.correctCount).toBe(1);
    expect(next.totalGraded).toBe(1);
    expect(next.sessionXp).toBe(10);
  });

  it("ANSWER with correct=false increments totalGraded but not correctCount", () => {
    const next = lessonReducer(initial, {
      type: "ANSWER", stepId: "s1", response: 1, xp: 0, correct: false, comboStreak: 0,
    });
    expect(next.correctCount).toBe(0);
    expect(next.totalGraded).toBe(1);
  });

  it("ANSWER with correct=undefined does not increment totalGraded (subjective step)", () => {
    const next = lessonReducer(initial, {
      type: "ANSWER", stepId: "s1", response: { field: "value" }, xp: 10, correct: undefined, comboStreak: 3,
    });
    expect(next.totalGraded).toBe(0);
    expect(next.sessionXp).toBe(10);
    expect(next.comboStreak).toBe(3);
  });

  it("ANSWER accumulates responses by stepId", () => {
    const s1 = lessonReducer(initial, { type: "ANSWER", stepId: "s1", response: "a", xp: 5, correct: true, comboStreak: 1 });
    const s2 = lessonReducer(s1, { type: "ANSWER", stepId: "s2", response: "b", xp: 5, correct: false, comboStreak: 0 });
    expect(s2.responses).toEqual({ s1: "a", s2: "b" });
  });

  it("RESTORE replaces state fields", () => {
    const next = lessonReducer(initial, {
      type: "RESTORE",
      payload: { stepIndex: 5, sessionXp: 80, responses: { s1: true }, correctCount: 3, totalGraded: 4, comboStreak: 2 },
    });
    expect(next.stepIndex).toBe(5);
    expect(next.sessionXp).toBe(80);
    expect(next.comboStreak).toBe(2);
  });

  it("RESET returns to initial state with same lessonId", () => {
    const modified = { ...initial, stepIndex: 5, sessionXp: 100 };
    const reset = lessonReducer(modified, { type: "RESET" });
    expect(reset.stepIndex).toBe(0);
    expect(reset.sessionXp).toBe(0);
    expect(reset.lessonId).toBe("lesson-1");
  });
});

describe("isLastStep", () => {
  it("returns true when stepIndex equals totalSteps - 1", () => {
    expect(isLastStep(4, 5)).toBe(true);
  });
  it("returns true when stepIndex exceeds totalSteps - 1", () => {
    expect(isLastStep(5, 5)).toBe(true);
  });
  it("returns false otherwise", () => {
    expect(isLastStep(3, 5)).toBe(false);
  });
});

describe("completionScore", () => {
  it("returns 0 when totalGraded is 0", () => {
    expect(completionScore({ ...createInitialState("x"), totalGraded: 0 })).toBe(0);
  });
  it("returns ratio of correct to graded", () => {
    const state = { ...createInitialState("x"), correctCount: 3, totalGraded: 4 };
    expect(completionScore(state)).toBeCloseTo(0.75);
  });
  it("returns 1 for perfect score", () => {
    const state = { ...createInitialState("x"), correctCount: 5, totalGraded: 5 };
    expect(completionScore(state)).toBe(1);
  });
});
