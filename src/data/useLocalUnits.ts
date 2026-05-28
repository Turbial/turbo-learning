// ─── Local fallback units — used when Supabase RLS blocks anon reads during dev ───

import type { Unit } from "../engine/types";

// AI Operator: 28 days, units 1-28 (matching Supabase seed)
const AI_OPERATOR_UNITS: Unit[] = Array.from({ length: 28 }, (_, i) => ({
  id: `local-ai-operator-unit-${i + 1}`,
  programId: "606f3fa5-f5b6-4bdf-8935-3f6aecf5ed2b",
  orderNum: i + 1,
  label: `Day ${i + 1}`,
  title: [
    "What AI Actually Is", "Building Your First AI Automation",
    "The Operator's Toolkit", "Your First Pipeline",
    "Prompt Engineering Mastery", "Multi-Tool Workflows",
    "Quality Control Systems", "Scaling Your Workflows",
    "Team AI Onboarding", "Advanced Prompt Patterns",
    "API Integration Basics", "Building AI Assistants",
    "Data-Driven Decisions", "Automation Auditing",
    "Client-Facing AI", "Security & Privacy",
    "Measuring AI ROI", "Workflow Optimization",
    "Cross-Platform AI", "Enterprise AI Patterns",
    "AI Ethics in Practice", "Building AI Teams",
    "Advanced System Design", "The AI-Enabled Business",
    "Future-Proofing Your Stack", "Capstone: Design",
    "Capstone: Build", "Capstone: Launch",
  ][i] ?? `Day ${i + 1}`,
  theme: "#059669",
}));

export const LOCAL_UNITS: Record<string, Unit[]> = {
  "ai-operator": AI_OPERATOR_UNITS,
  "ai_for_everyone": [],
  "duo": [],
};
