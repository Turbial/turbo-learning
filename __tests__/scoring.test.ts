import {
  getComboMultiplier, applyCombo, getComboLabel,
  xpToLevel, xpToNextLevel,
  mcScore, tfScore, goodFitScore, fillBlankScore, matchScore,
  defaultScore,
} from "../src/engine/scoring";
import type { McStep, TrueFalseStep, GoodFitStep, FillBlankStep, MatchStep } from "../src/engine/types";

// ─── Combo system ───

describe("getComboMultiplier", () => {
  it("returns 1x for streak 0-1", () => {
    expect(getComboMultiplier(0)).toBe(1.0);
    expect(getComboMultiplier(1)).toBe(1.0);
  });
  it("returns 1.5x for streak 2-3", () => {
    expect(getComboMultiplier(2)).toBe(1.5);
    expect(getComboMultiplier(3)).toBe(1.5);
  });
  it("returns 2x for streak 4-6", () => {
    expect(getComboMultiplier(4)).toBe(2.0);
    expect(getComboMultiplier(6)).toBe(2.0);
  });
  it("returns 2.5x for streak 7-10", () => {
    expect(getComboMultiplier(7)).toBe(2.5);
    expect(getComboMultiplier(10)).toBe(2.5);
  });
  it("returns 3x for streak 11+", () => {
    expect(getComboMultiplier(11)).toBe(3.0);
    expect(getComboMultiplier(99)).toBe(3.0);
  });
});

describe("applyCombo", () => {
  it("applies multiplier and rounds", () => {
    expect(applyCombo(10, 2)).toBe(15);
    expect(applyCombo(10, 4)).toBe(20);
    expect(applyCombo(7, 11)).toBe(21);
  });
  it("returns 0 for 0 base XP", () => {
    expect(applyCombo(0, 5)).toBe(0);
  });
});

describe("getComboLabel", () => {
  it("returns empty for streak < 2", () => {
    expect(getComboLabel(0)).toBe("");
    expect(getComboLabel(1)).toBe("");
  });
  it("returns labels for higher streaks", () => {
    expect(getComboLabel(2)).toBe("Nice!");
    expect(getComboLabel(4)).toBe("Great streak!");
    expect(getComboLabel(7)).toBe("Amazing!");
    expect(getComboLabel(11)).toBe("Unstoppable!");
  });
});

// ─── Level formula ───

describe("xpToLevel", () => {
  it("L1 at 0 XP", () => expect(xpToLevel(0)).toBe(1));
  it("L2 at 100 XP", () => expect(xpToLevel(100)).toBe(2));
  it("L3 at 400 XP", () => expect(xpToLevel(400)).toBe(3));
  it("L5 at 1600 XP", () => expect(xpToLevel(1600)).toBe(5));
  it("L10 at 8100 XP", () => expect(xpToLevel(8100)).toBe(10));
  it("stays at same level just before threshold", () => expect(xpToLevel(99)).toBe(1));
});

describe("xpToNextLevel", () => {
  it("1 XP short of L2 needs 1 more", () => expect(xpToNextLevel(99)).toBe(1));
  it("exactly at L2 needs 300 for L3", () => expect(xpToNextLevel(100)).toBe(300));
  it("at L5 threshold needs 900 for L6", () => expect(xpToNextLevel(1600)).toBe(900));
});

// ─── Step scoring ───

function makeStep<T>(overrides: Partial<T> & { type: string }): T {
  return { xp: 10, ...overrides } as unknown as T;
}

describe("mcScore", () => {
  const step = makeStep<McStep>({ type: "mc", question: "Q", options: ["A", "B"], correct: 1, feedback: [] });
  it("returns base + 5 for correct answer", () => expect(mcScore(step, 1)).toBe(15));
  it("returns 0 for wrong answer", () => expect(mcScore(step, 0)).toBe(0));
});

describe("tfScore", () => {
  const step = makeStep<TrueFalseStep>({ type: "tf", question: "Q", correct: true, feedback: [] });
  it("returns base + 5 for correct", () => expect(tfScore(step, true)).toBe(15));
  it("returns 0 for wrong", () => expect(tfScore(step, false)).toBe(0));
});

describe("goodFitScore", () => {
  const step = makeStep<GoodFitStep>({ type: "good_fit", question: "Q", correct: "notideal", feedback: [] });
  it("returns base + 5 for correct", () => expect(goodFitScore(step, "notideal")).toBe(15));
  it("returns 0 for wrong", () => expect(goodFitScore(step, "good")).toBe(0));
});

describe("fillBlankScore", () => {
  const step = makeStep<FillBlankStep>({
    type: "fillblank", question: "Q", answer: "Paris", aliases: ["paris", "PARIS"], feedback: [],
  });
  it("returns base + 5 for exact match", () => expect(fillBlankScore(step, "Paris")).toBe(15));
  it("is case-insensitive", () => expect(fillBlankScore(step, "paris")).toBe(15));
  it("accepts aliases", () => expect(fillBlankScore(step, "PARIS")).toBe(15));
  it("returns 0 for wrong answer", () => expect(fillBlankScore(step, "London")).toBe(0));
});

describe("matchScore", () => {
  const step = makeStep<MatchStep>({
    type: "match",
    pairs: [{ left: "A", right: "1" }, { left: "B", right: "2" }, { left: "C", right: "3" }],
  });
  it("perfect match returns base + 5", () => expect(matchScore(step, 3)).toBe(15));
  it("partial match returns proportional XP", () => expect(matchScore(step, 1)).toBe(3));
  it("zero correct returns 0", () => expect(matchScore(step, 0)).toBe(0));
});

describe("defaultScore", () => {
  it("returns 0 for non-interactive step types", () => {
    const types = ["info", "scenario_card", "example", "highlight", "completion", "badge_unlock"] as const;
    for (const type of types) {
      expect(defaultScore({ type, id: "x", xp: 20 } as any)).toBe(0);
    }
  });
  it("returns step.xp for interactive types", () => {
    expect(defaultScore({ type: "builder", id: "x", xp: 15, fields: [], template: "" })).toBe(15);
    expect(defaultScore({ type: "reflection", id: "x", xp: 10, questions: [] })).toBe(10);
  });
  it("returns BASE_XP (10) when step.xp is undefined", () => {
    expect(defaultScore({ type: "builder", id: "x", fields: [], template: "" } as any)).toBe(10);
  });
});
