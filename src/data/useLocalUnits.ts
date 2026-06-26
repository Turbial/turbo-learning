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
    "AI for Customer Support", "Automation Auditing",
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

// ─── DUO: Marriage Platform — 28 days ───

const DUO_UNITS: Unit[] = Array.from({ length: 28 }, (_, i) => ({
  id: `local-duo-unit-${i + 1}`,
  programId: "duo-program-id",
  orderNum: i + 1,
  label: `Day ${i + 1}`,
  title: [
    "The Honest Starting Line", "Why Couples Drift Apart", "The Foundation Audit",
    "The Connection Check", "The Household Reality", "The Repair Reflex",
    "Your Marriage Blueprint", "Creating Safety — Part 1", "Creating Safety — Part 2",
    "Vulnerability as Strength", "The Emotional Bank Account", "Fighting Fair",
    "Listening to Understand", "Sharing Deeply", "The Gratitude Loop",
    "Physical Connection Plans", "Rituals That Bind", "The Forgiveness Protocol",
    "Trust Rebuilding", "Intimacy Inventory", "Money Without War", "Parenting as a Team",
    "External Pressure Shield", "Growth Without Drifting", "The Weekly Marriage Meeting",
    "Your Partnership Vision", "The Commitment Ceremony", "Graduation: Your Marriage 2.0",
  ][i] ?? `Day ${i + 1}`,
  theme: "#8b5cf6",
}));

// ─── AI For Everyone — 28 days ───

const AI_FOR_EVERYONE_UNITS: Unit[] = Array.from({ length: 28 }, (_, i) => ({
  id: `local-ai-for-everyone-unit-${i + 1}`,
  programId: "ai-for-everyone-program-id",
  orderNum: i + 1,
  label: `Day ${i + 1}`,
  title: [
    "Why AI Matters Now", "How AI Tools Actually Work",
    "AI for Writing & Communication", "AI for Research & Learning",
    "AI for Problem Solving", "AI for Creative Work",
    "Week 1 Review", "AI in Your Daily Workflow",
    "Prompting That Gets Results", "AI for Email & Messaging",
    "AI for Planning & Organisation", "AI for Data & Spreadsheets",
    "AI for Customer Support", "AI for Social Media",
    "Building Simple Automations", "AI Tools Comparison",
    "Staying Safe with AI", "AI Ethics & Bias",
    "AI at Work", "AI in Your Industry",
    "Week 3 Review", "AI for Small Business",
    "AI for Side Projects", "Staying Current with AI",
    "AI Myths Busted", "Building Your AI Habit",
    "Your AI Action Plan", "Graduation: Your AI Journey",
  ][i] ?? `Day ${i + 1}`,
  theme: "#4A8ED4",
}));

export const LOCAL_UNITS: Record<string, Unit[]> = {
  "ai-operator": AI_OPERATOR_UNITS,
  "ai_for_everyone": AI_FOR_EVERYONE_UNITS,
  "duo": DUO_UNITS,
};
