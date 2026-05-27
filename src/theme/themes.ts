// theme/themes.ts — one theme per product. A product is a THEME OBJECT, not a fork.
// The active theme is chosen by the enrolled program's slug. Same components,
// different tokens → distinct identity, shared engine.
import type { Theme } from './tokens';

export const aiForEveryone: Theme = {            // warm, friendly, reassuring
  name: 'ai_for_everyone',
  colors: {
    light: { background:'#FFFFFF', surface:'#FFFFFF', surfaceAlt:'#F9FAFB', border:'#E5E7EB',
             text:'#111827', textMuted:'#6B7280', accent:'#F97316', accentText:'#FFFFFF',
             accentSoft:'#FFF7ED', success:'#16A34A', error:'#DC2626' },
    dark:  { background:'#0B0B0F', surface:'#16161D', surfaceAlt:'#1F1F29', border:'#2A2A36',
             text:'#F3F4F6', textMuted:'#9CA3AF', accent:'#FB923C', accentText:'#111827',
             accentSoft:'#2A1C0E', success:'#22C55E', error:'#F87171' },
  },
};

export const aiOperator: Theme = {               // sharper, premium
  name: 'ai_operator',
  colors: {
    light: { background:'#FFFFFF', surface:'#FFFFFF', surfaceAlt:'#F8FAFC', border:'#E2E8F0',
             text:'#0F172A', textMuted:'#64748B', accent:'#4F46E5', accentText:'#FFFFFF',
             accentSoft:'#EEF2FF', success:'#15803D', error:'#DC2626' },
    dark:  { background:'#070A12', surface:'#0F1626', surfaceAlt:'#172033', border:'#26314A',
             text:'#E2E8F0', textMuted:'#94A3B8', accent:'#818CF8', accentText:'#0F172A',
             accentSoft:'#1A1F3A', success:'#22C55E', error:'#F87171' },
  },
};

export const duo: Theme = {                       // soft, relational
  name: 'duo',
  colors: {
    light: { background:'#FFFBFB', surface:'#FFFFFF', surfaceAlt:'#FFF1F2', border:'#FBD5DA',
             text:'#1F2937', textMuted:'#9F7A82', accent:'#E11D48', accentText:'#FFFFFF',
             accentSoft:'#FFF1F2', success:'#16A34A', error:'#DC2626' },
    dark:  { background:'#120A0D', surface:'#1E1217', surfaceAlt:'#2A1A20', border:'#3D2730',
             text:'#F5EDEF', textMuted:'#C9A6AE', accent:'#FB7185', accentText:'#1F2937',
             accentSoft:'#2A1A20', success:'#22C55E', error:'#F87171' },
  },
};

export const filmAssist: Theme = {                // cinematic, warm-charcoal + gold
  name: 'filmassist',
  colors: {
    light: { background:'#FAFAF9', surface:'#FFFFFF', surfaceAlt:'#F5F5F4', border:'#E7E5E4',
             text:'#1C1917', textMuted:'#78716C', accent:'#D97706', accentText:'#FFFFFF',
             accentSoft:'#FEF3C7', success:'#15803D', error:'#B91C1C' },
    dark:  { background:'#0C0A09', surface:'#1C1917', surfaceAlt:'#292524', border:'#3F3A36',
             text:'#F5F5F4', textMuted:'#A8A29E', accent:'#F59E0B', accentText:'#1C1917',
             accentSoft:'#2A2008', success:'#22C55E', error:'#F87171' },
  },
};

export const creditSmith: Theme = {               // trustworthy, financial
  name: 'creditsmith',
  colors: {
    light: { background:'#FFFFFF', surface:'#FFFFFF', surfaceAlt:'#F0FDFA', border:'#CCFBF1',
             text:'#0F172A', textMuted:'#5E7C77', accent:'#0D9488', accentText:'#FFFFFF',
             accentSoft:'#F0FDFA', success:'#15803D', error:'#DC2626' },
    dark:  { background:'#06100E', surface:'#0E1A18', surfaceAlt:'#13211F', border:'#1F302D',
             text:'#ECFDF5', textMuted:'#8FB3AD', accent:'#2DD4BF', accentText:'#06100E',
             accentSoft:'#0C211D', success:'#22C55E', error:'#F87171' },
  },
};

export const themes = {
  ai_for_everyone: aiForEveryone,
  ai_operator: aiOperator,
  duo,
  filmassist: filmAssist,
  creditsmith: creditSmith,
} as const;

export const defaultTheme = aiForEveryone;
export const themeForSlug = (slug?: string): Theme =>
  (slug && (themes as Record<string, Theme>)[slug]) || defaultTheme;
