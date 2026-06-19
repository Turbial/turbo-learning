// ─── Learner profile (personalization) ───
// Industry / skill level / goal, persisted locally. Drives Phase 4 personalization:
// the AI frames its Ask answers to the learner's context. The lessons themselves
// don't change — and crucially this rides the EXISTING Ask call, so it adds ZERO
// LLM calls. Mirrors the lp_users.industry/skill_level/goal columns for Phase 2.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface LearnerProfile {
  industry?: string;
  skillLevel?: SkillLevel;
  goal?: string;
}

export const INDUSTRIES = [
  "Contractor / trades",
  "Restaurant / food",
  "Church / ministry",
  "Real estate",
  "Healthcare",
  "Marketing / agency",
  "Retail / e-commerce",
  "Coaching / consulting",
];

export const SKILL_LEVELS: SkillLevel[] = ["beginner", "intermediate", "advanced"];

interface LearnerProfileStore {
  profile: LearnerProfile;
  set: (patch: Partial<LearnerProfile>) => void;
  clear: () => void;
}

export const useLearnerProfile = create<LearnerProfileStore>()(
  persist(
    (set) => ({
      profile: {},
      set: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      clear: () => set({ profile: {} }),
    }),
    { name: "lp-learner-profile", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** True when there's at least one personalization signal. */
export function hasProfile(p: LearnerProfile): boolean {
  return Boolean(p.industry || p.skillLevel || (p.goal && p.goal.trim()));
}

/** One-line human summary, e.g. "Contractor / trades · beginner". */
export function profileSummary(p: LearnerProfile): string {
  return [p.industry, p.skillLevel].filter(Boolean).join(" · ");
}

/** Compact instruction injected into the Ask prompt (rides the existing call). */
export function profilePrompt(p: LearnerProfile): string {
  const bits: string[] = [];
  if (p.industry) bits.push(`works in ${p.industry}`);
  if (p.skillLevel) bits.push(`is a ${p.skillLevel}-level learner`);
  if (p.goal && p.goal.trim()) bits.push(`wants to ${p.goal.trim()}`);
  if (bits.length === 0) return "";
  return `The student ${bits.join(", ")}. Frame the answer to their context with a concrete, relevant example where natural.`;
}
