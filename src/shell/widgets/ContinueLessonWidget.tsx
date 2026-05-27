// shell/widgets/ContinueLessonWidget.tsx — REFERENCE widget (demonstrates WidgetProps).
// THIS is point #2 in action: it fetches its OWN data keyed by the active
// program (from config or enrollment), and navigates into the LINEAR lesson
// route. Swapping programs = changing config; no hard-coded "first incomplete".
import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import type { WidgetProps } from '../types';
// import { useContinueLesson } from '../../data/queries'; // self-contained data hook

export const ContinueLessonWidget: React.FC<WidgetProps> = ({ config, navigate }) => {
  const programSlug = (config?.programSlug as string | undefined); // else resolve from enrollment
  // const { data, isLoading } = useContinueLesson(programSlug);
  const isLoading = false;
  const data = { lessonId: 'TODO', unitLabel: 'Day 1', title: 'Your First Useful Question' };

  if (isLoading) return <ActivityIndicator />;
  if (!data) return null; // nothing to continue → render nothing (or an enroll CTA)

  return (
    <View style={{ padding: 20, borderRadius: 16, gap: 6, backgroundColor: '#FFF7ED' }}>
      <Text style={{ fontSize: 13, color: '#9A3412' }}>{data.unitLabel}</Text>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>{data.title}</Text>
      <Pressable
        onPress={() => navigate('/lesson/[id]', { id: data.lessonId })}  // → linear lesson flow
        accessibilityRole="button"
        style={{ minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F97316', marginTop: 8 }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Continue</Text>
      </Pressable>
    </View>
  );
};
