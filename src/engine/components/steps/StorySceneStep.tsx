// Story Mode — cinematic character dialogue scene.
// Renders a dark immersive panel with animated character + typewriter text.
// Tap once to skip typewriter; tap again (or Continue button) to advance.

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Dimensions, Platform,
} from 'react-native';
import type { StepProps } from '../../stepRegistry';
import type { StorySceneStep as StorySceneStepType } from '../../types';

const { width } = Dimensions.get('window');

// ─── Scene backgrounds (dark immersive palettes) ─────────────────────────────

const SCENES: Record<string, { bg: string; accent: string; skyGlow: string }> = {
  office:    { bg: '#0d1b2e', accent: '#4a90d9', skyGlow: '#1e3a5f' },
  lab:       { bg: '#0d0621', accent: '#8b5cf6', skyGlow: '#1a0a3b' },
  space:     { bg: '#05080d', accent: '#60a5fa', skyGlow: '#0a1a2e' },
  city:      { bg: '#0a1520', accent: '#34d399', skyGlow: '#1a3040' },
  classroom: { bg: '#100800', accent: '#f59e0b', skyGlow: '#2d1b00' },
};

// ─── Character definitions ────────────────────────────────────────────────────

const CHARACTERS: Record<string, { emoji: string; name: string; color: string; glow: string }> = {
  aria:     { emoji: '🤖', name: 'Aria',        color: '#10b981', glow: 'rgba(16,185,129,0.25)' },
  coach:    { emoji: '👨‍🏫', name: 'Coach',       color: '#3b82f6', glow: 'rgba(59,130,246,0.25)' },
  villain:  { emoji: '🦹',  name: 'Prometheus', color: '#ef4444', glow: 'rgba(239,68,68,0.25)' },
  narrator: { emoji: '📖',  name: 'Narrator',   color: '#a78bfa', glow: 'rgba(167,139,250,0.25)' },
};

// ─── Mood overlays ────────────────────────────────────────────────────────────

const MOOD_EMOJI: Record<string, string> = {
  excited: '🤩', thinking: '🤔', shocked: '😱', surprised: '😮', happy: '😊',
};

// ─── Decorative star particles (static, deterministic positions) ──────────────

const STARS = [
  { x: '8%', y: '12%', size: 2 }, { x: '18%', y: '5%', size: 1.5 },
  { x: '30%', y: '18%', size: 2.5 }, { x: '55%', y: '8%', size: 1.5 },
  { x: '72%', y: '15%', size: 2 }, { x: '85%', y: '6%', size: 1 },
  { x: '92%', y: '20%', size: 2.5 }, { x: '42%', y: '25%', size: 1 },
  { x: '65%', y: '3%', size: 1.5 }, { x: '78%', y: '28%', size: 1 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StorySceneStep({
  step,
  onAnswer,
  onContinue,
}: StepProps<StorySceneStepType>) {
  const sceneKey = step.scene ?? 'lab';
  const scene = SCENES[sceneKey] ?? SCENES.lab;
  const char = CHARACTERS[step.character] ?? CHARACTERS.aria;
  const mood = step.mood && step.mood !== 'neutral' ? MOOD_EMOJI[step.mood] : null;

  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [charReady, setCharReady] = useState(false);

  const charScale = useRef(new Animated.Value(0.3)).current;
  const charOpacity = useRef(new Animated.Value(0)).current;
  const bubbleY = useRef(new Animated.Value(24)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // Character entrance → bubble slide-in → start typewriter
  useEffect(() => {
    Animated.parallel([
      Animated.spring(charScale, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
      Animated.timing(charOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.spring(bubbleY, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
        Animated.timing(bubbleOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start(() => setCharReady(true));
    });
  }, []);

  // Typewriter
  useEffect(() => {
    if (!charReady) return;
    let i = 0;
    const len = step.dialogue.length;
    const msPerChar = len > 120 ? 14 : len > 60 ? 18 : 22;
    const timer = setInterval(() => {
      i++;
      setDisplayedText(step.dialogue.slice(0, i));
      if (i >= len) { clearInterval(timer); setTypingDone(true); }
    }, msPerChar);
    return () => clearInterval(timer);
  }, [charReady, step.dialogue]);

  // Cursor blink when typing
  useEffect(() => {
    if (typingDone) return;
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [typingDone]);

  const handleTap = () => {
    if (!typingDone) {
      setDisplayedText(step.dialogue);
      setTypingDone(true);
    } else {
      onAnswer('seen');
      onContinue();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: scene.bg }]}
      onPress={handleTap}
      activeOpacity={1}
    >
      {/* Sky gradient layer */}
      <View style={[styles.skyGlow, { backgroundColor: scene.skyGlow }]} />

      {/* Decorative stars */}
      {STARS.map((s, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              left: s.x as any,
              top: s.y as any,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              backgroundColor: scene.accent,
              opacity: 0.5,
            },
          ]}
        />
      ))}

      {/* Story Mode badge */}
      <View style={styles.header}>
        <View style={[styles.badge, { borderColor: char.color + '60' }]}>
          <Text style={[styles.badgeText, { color: char.color }]}>🎬 Story Mode</Text>
        </View>
      </View>

      {/* Character area */}
      <View style={styles.charArea}>
        <Animated.View
          style={[
            styles.charWrapper,
            { opacity: charOpacity, transform: [{ scale: charScale }] },
          ]}
        >
          {/* Glow ring */}
          <View style={[styles.glowRing, { backgroundColor: char.glow, shadowColor: char.color }]} />
          {/* Emoji */}
          <Text style={styles.charEmoji}>{char.emoji}</Text>
          {/* Mood overlay */}
          {mood && (
            <View style={styles.moodBubble}>
              <Text style={styles.moodEmoji}>{mood}</Text>
            </View>
          )}
        </Animated.View>

        {/* Name tag */}
        <Animated.View style={[styles.nameTag, { backgroundColor: char.color, opacity: charOpacity }]}>
          <Text style={styles.nameTagText}>{char.name}</Text>
        </Animated.View>
      </View>

      {/* Dialogue bubble */}
      <Animated.View
        style={[
          styles.bubble,
          {
            opacity: bubbleOpacity,
            transform: [{ translateY: bubbleY }],
            borderColor: char.color + '35',
          },
        ]}
      >
        {/* Triangle pointer pointing up at character */}
        <View style={[styles.bubblePointer, { borderBottomColor: 'rgba(255,255,255,0.07)' }]} />

        <Text style={styles.dialogueText}>
          {displayedText}
          {!typingDone && (
            <Animated.Text style={[styles.cursor, { color: char.color, opacity: cursorOpacity }]}>
              {' '}▋
            </Animated.Text>
          )}
        </Text>
      </Animated.View>

      {/* Continue hint */}
      <View style={styles.footer}>
        {typingDone ? (
          <Text style={[styles.continueHint, { color: char.color }]}>Tap to continue →</Text>
        ) : (
          <Text style={[styles.skipHint, { color: char.color + '80' }]}>Tap to skip</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    // Negative margins cancel the stepArea's padding: 20 so we go edge-to-edge
    margin: -20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    paddingBottom: 20,
    minHeight: 480,
  },
  skyGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '52%',
    opacity: 0.55,
  },
  star: {
    position: 'absolute',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
    zIndex: 2,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  charArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  charWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  glowRing: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 10,
  },
  charEmoji: {
    fontSize: 76,
    lineHeight: 96,
    zIndex: 1,
  },
  moodBubble: {
    position: 'absolute',
    top: -4,
    right: -18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 14,
    padding: 4,
    zIndex: 2,
  },
  moodEmoji: { fontSize: 20 },
  nameTag: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  nameTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    width: width - 52,
    position: 'relative',
    marginBottom: 4,
  },
  bubblePointer: {
    position: 'absolute',
    top: -9,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  dialogueText: {
    color: '#e8edf2',
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  cursor: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueHint: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  skipHint: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
