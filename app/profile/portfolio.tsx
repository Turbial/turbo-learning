// app/profile/portfolio.tsx — All deliverables & responses across lessons

import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  StyleSheet, Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/data/useAuth';
import { usePortfolioResponses } from '../../src/data/queries';
import { colors, spacing, radius } from '../../src/theme/tokens';

type PortfolioItem = {
  id: string;
  step_id: string;
  lesson_id: string | null;
  response: unknown;
  created_at: string;
};

const STEP_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  builder:          { label: 'AI Prompt Built',    emoji: '🏗️' },
  reflection:       { label: 'Reflection',          emoji: '💭' },
  paste_capture:    { label: 'Capture',             emoji: '📋' },
  prompt_generator: { label: 'Prompt Generated',   emoji: '⚡' },
};

function getStepType(stepId: string): string {
  const lower = stepId.toLowerCase();
  if (lower.includes('builder'))    return 'builder';
  if (lower.includes('reflection')) return 'reflection';
  if (lower.includes('paste'))      return 'paste_capture';
  if (lower.includes('prompt'))     return 'prompt_generator';
  return 'other';
}

function responseToText(response: unknown): string | null {
  if (typeof response === 'string' && response.trim().length > 10) return response.trim();
  if (typeof response === 'object' && response !== null) {
    // Builder/prompt responses are often objects like { prompt: "...", context: "..." }
    const entries = Object.entries(response as Record<string, unknown>)
      .filter(([, v]) => typeof v === 'string' && (v as string).length > 5)
      .map(([k, v]) => `**${k}**: ${v}`);
    if (entries.length > 0) return entries.join('\n\n');
  }
  return null;
}

function formatDayLabel(stepId: string): string {
  const match = stepId.match(/d(\d+)/i);
  if (match) return `Day ${match[1]}`;
  return stepId.split('-').slice(0, 2).join(' ').replace(/\b\w/g, c => c.toUpperCase());
}

function groupByDate(items: PortfolioItem[]): Record<string, PortfolioItem[]> {
  const groups: Record<string, PortfolioItem[]> = {};
  for (const item of items) {
    const date = item.created_at.slice(0, 10);
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  }
  return groups;
}

export default function PortfolioScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: raw = [], isLoading } = usePortfolioResponses(user?.id);
  const [copied, setCopied] = useState<string | null>(null);

  // Filter to portfolio-worthy responses (text/object, from deliverable step types)
  const items: PortfolioItem[] = raw.filter(item => {
    const type = getStepType(item.step_id);
    if (type === 'other') return false;
    return responseToText(item.response) !== null;
  });

  const grouped = groupByDate(items);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleCopy = async (text: string, id: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleShare = async (text: string, stepId: string) => {
    await Share.share({ message: `${formatDayLabel(stepId)}\n\n${text}` });
  };

  return (
    <SafeAreaView style={p.safe}>
      <ScrollView contentContainerStyle={p.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={p.header}>
          <TouchableOpacity onPress={() => router.back()} style={p.back}>
            <Text style={p.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={p.title}>My Portfolio</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Summary */}
        <View style={p.summaryCard}>
          <Text style={p.summaryNum}>{items.length}</Text>
          <Text style={p.summarySub}>deliverable{items.length !== 1 ? 's' : ''} across your journey</Text>
        </View>

        {isLoading ? (
          <View style={p.emptyState}>
            <Text style={p.emptyEmoji}>⏳</Text>
            <Text style={p.emptyTitle}>Loading…</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={p.emptyState}>
            <Text style={p.emptyEmoji}>📄</Text>
            <Text style={p.emptyTitle}>Nothing here yet</Text>
            <Text style={p.emptyBody}>
              Complete Builder, Reflection, and Prompt lessons to build your AI portfolio.
            </Text>
          </View>
        ) : (
          dates.map(date => (
            <View key={date}>
              <Text style={p.dateLabel}>
                {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
              <View style={p.dateGroup}>
                {grouped[date].map((item, i) => {
                  const type  = getStepType(item.step_id);
                  const meta  = STEP_TYPE_LABELS[type] ?? { label: 'Response', emoji: '📝' };
                  const text  = responseToText(item.response)!;
                  const isCopied = copied === item.id;
                  return (
                    <View key={item.id} style={[p.itemCard, i < grouped[date].length - 1 && p.itemCardBorder]}>
                      <View style={p.itemHeader}>
                        <View style={p.itemTypeBadge}>
                          <Text style={p.itemTypeEmoji}>{meta.emoji}</Text>
                          <Text style={p.itemTypeLabel}>{meta.label}</Text>
                        </View>
                        <Text style={p.itemDay}>{formatDayLabel(item.step_id)}</Text>
                      </View>
                      <Text style={p.itemText} numberOfLines={6}>{text}</Text>
                      <View style={p.itemActions}>
                        <TouchableOpacity
                          style={[p.actionBtn, isCopied && p.actionBtnCopied]}
                          onPress={() => handleCopy(text, item.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={[p.actionBtnText, isCopied && p.actionBtnTextCopied]}>
                            {isCopied ? '✓ Copied' : '📋 Copy'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={p.actionBtn}
                          onPress={() => handleShare(text, item.step_id)}
                          activeOpacity={0.7}
                        >
                          <Text style={p.actionBtnText}>↗ Share</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const p = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: spacing.lg, paddingBottom: 48, gap: spacing.md },

  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  back:     { paddingVertical: 8, paddingRight: 16 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  title:    { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },

  summaryCard: {
    backgroundColor: '#0d0621', borderRadius: radius.lg,
    padding: 20, alignItems: 'center', gap: 4,
  },
  summaryNum: { fontSize: 48, fontWeight: '900', color: '#fff' },
  summarySub: { fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },

  dateLabel: { fontSize: 12, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.5, marginBottom: 6, marginTop: 4 },
  dateGroup: { backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: '#e5e7eb' },

  itemCard:       { padding: 16, gap: 10 },
  itemCardBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTypeBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  itemTypeEmoji:  { fontSize: 14 },
  itemTypeLabel:  { fontSize: 12, fontWeight: '700', color: '#059669' },
  itemDay:        { fontSize: 12, color: '#9ca3af', fontWeight: '600' },
  itemText:       { fontSize: 14, color: '#374151', lineHeight: 20 },
  itemActions:    { flexDirection: 'row', gap: 8 },
  actionBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb' },
  actionBtnCopied:{ backgroundColor: '#ecfdf5', borderColor: '#059669' },
  actionBtnText:  { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  actionBtnTextCopied: { color: '#059669' },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  emptyBody:  { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
});
