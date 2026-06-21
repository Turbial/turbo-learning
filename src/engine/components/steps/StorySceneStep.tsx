// Story Mode — full-screen cinematic character scene.
// Renders in a Modal so it truly covers the entire screen (nav bar, status bar, all).
// Tap once to skip typewriter; tap again to advance.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Modal, TouchableWithoutFeedback, StyleSheet,
  Animated, Dimensions, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Polygon } from 'react-native-svg';
import type { StepProps } from '../../stepRegistry';
import type { StorySceneStep as StorySceneStepType } from '../../types';

const { width: W, height: H } = Dimensions.get('window');

// ─── Scene palettes ───────────────────────────────────────────────────────────

const SCENES: Record<string, { bg: string; sky: string; accent: string; accentRgb: string }> = {
  lab:       { bg: '#09041a', sky: '#150b30', accent: '#8b5cf6', accentRgb: '139,92,246' },
  space:     { bg: '#020810', sky: '#061224', accent: '#38bdf8', accentRgb: '56,189,248' },
  office:    { bg: '#0b1525', sky: '#1a2e4a', accent: '#60a5fa', accentRgb: '96,165,250' },
  city:      { bg: '#071510', sky: '#0d2820', accent: '#34d399', accentRgb: '52,211,153' },
  classroom: { bg: '#160b00', sky: '#2e1800', accent: '#fbbf24', accentRgb: '251,191,36' },
};

// ─── Characters ───────────────────────────────────────────────────────────────

const CHARS: Record<string, { emoji: string; name: string; color: string; rgb: string }> = {
  aria:     { emoji: '🤖', name: 'ARIA',        color: '#10b981', rgb: '16,185,129' },
  coach:    { emoji: '👨‍🏫', name: 'COACH',       color: '#60a5fa', rgb: '96,165,250' },
  villain:  { emoji: '🦹',  name: 'PROMETHEUS', color: '#f87171', rgb: '248,113,113' },
  narrator: { emoji: '📖',  name: 'NARRATOR',   color: '#c084fc', rgb: '192,132,252' },
};

const MOOD_BADGE: Record<string, string> = {
  excited: '🤩', thinking: '🤔', shocked: '😱', surprised: '😮', happy: '😊',
};

// ─── Particle definitions (deterministic, pixel-based) ────────────────────────

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  x:        ((i * 113 + 29) % (W - 30)) + 15,
  y:        ((i * 79  + 55) % (H * 0.55)) + H * 0.08,
  travel:   70 + (i * 27 % 90),
  size:     2 + (i % 3),
  delay:    i * 280,
  duration: 3200 + (i * 450 % 2200),
}));

// ─── Main component ───────────────────────────────────────────────────────────

export default function StorySceneStep({ step, onAnswer, onContinue, state }: StepProps<StorySceneStepType>) {
  const scene  = SCENES[step.scene ?? 'lab'] ?? SCENES.lab;
  const char   = CHARS[step.character]       ?? CHARS.aria;
  const mood   = step.mood ?? 'neutral';
  const moodBadge = mood !== 'neutral' ? MOOD_BADGE[mood] : null;

  // ── Animation refs ────────────────────────────────────────────────────────
  const bgOpacity    = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const charScale    = useRef(new Animated.Value(0.1)).current;
  const charOpacity  = useRef(new Animated.Value(0)).current;
  const charY        = useRef(new Animated.Value(0)).current;   // mood bounce
  const charX        = useRef(new Animated.Value(0)).current;   // shocked shake
  const charRotate   = useRef(new Animated.Value(0)).current;   // thinking tilt

  const glowScale    = useRef(new Animated.Value(1)).current;
  const glowOpacity  = useRef(new Animated.Value(0.5)).current;

  const nameTagY     = useRef(new Animated.Value(16)).current;
  const nameTagOp    = useRef(new Animated.Value(0)).current;

  const bubbleY      = useRef(new Animated.Value(32)).current;
  const bubbleOp     = useRef(new Animated.Value(0)).current;
  const bubbleScale  = useRef(new Animated.Value(0.92)).current;

  const cursorOp     = useRef(new Animated.Value(1)).current;
  const continueScale = useRef(new Animated.Value(1)).current;

  // Particles — each has a 0→1 progress value
  const particleAnims = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  // ── State ─────────────────────────────────────────────────────────────────
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone]       = useState(false);
  const [bubbleReady, setBubbleReady]     = useState(false);

  // ── Haptics helper ────────────────────────────────────────────────────────
  const haptic = useCallback((type: 'light' | 'medium' | 'success') => {
    if (Platform.OS === 'web') return;
    try {
      if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
  }, []);

  // ── Scene entry sequence ──────────────────────────────────────────────────
  useEffect(() => {
    haptic('medium');

    // 1. Fade in background
    Animated.timing(bgOpacity, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    Animated.timing(contentOpacity, { toValue: 1, duration: 200, delay: 150, useNativeDriver: true } as any).start();

    // 2. Character springs in
    Animated.sequence([
      Animated.delay(300) as any,
      Animated.parallel([
        Animated.spring(charScale,   { toValue: 1, tension: 70, friction: 6, useNativeDriver: true }),
        Animated.timing(charOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();

    // 3. Name tag slides in
    Animated.sequence([
      Animated.delay(520) as any,
      Animated.parallel([
        Animated.spring(nameTagY, { toValue: 0, tension: 90, friction: 8, useNativeDriver: true }),
        Animated.timing(nameTagOp, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
    ]).start();

    // 4. Bubble springs in → start typewriter
    Animated.sequence([
      Animated.delay(680) as any,
      Animated.parallel([
        Animated.spring(bubbleY,    { toValue: 0,   tension: 75, friction: 7, useNativeDriver: true }),
        Animated.spring(bubbleScale,{ toValue: 1,   tension: 75, friction: 7, useNativeDriver: true }),
        Animated.timing(bubbleOp,   { toValue: 1, duration: 280, useNativeDriver: true }),
      ]),
    ]).start(() => setBubbleReady(true));

    // 5. Glow ring breathe (loop)
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(glowScale,   { toValue: 1.22, duration: 1600, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 1.0,  duration: 1600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(glowScale,   { toValue: 0.95, duration: 1600, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.45, duration: 1600, useNativeDriver: true }),
      ]),
    ])).start();

    // 6. Particles — staggered rising loops
    PARTICLES.forEach((p, i) => {
      const tid = setTimeout(() => {
        Animated.loop(
          Animated.timing(particleAnims[i], { toValue: 1, duration: p.duration, useNativeDriver: true })
        ).start();
      }, p.delay);
      return () => clearTimeout(tid);
    });
  }, []);

  // ── Mood-reactive character animation ────────────────────────────────────
  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;

    if (mood === 'shocked') {
      anim = Animated.loop(Animated.sequence([
        Animated.timing(charX, { toValue: -7, duration: 55, useNativeDriver: true }),
        Animated.timing(charX, { toValue:  7, duration: 55, useNativeDriver: true }),
        Animated.timing(charX, { toValue: -5, duration: 55, useNativeDriver: true }),
        Animated.timing(charX, { toValue:  5, duration: 55, useNativeDriver: true }),
        Animated.timing(charX, { toValue:  0, duration: 55, useNativeDriver: true }),
        Animated.timing(charX, { toValue:  0, duration: 1400, useNativeDriver: true }), // pause
      ]));
    } else if (mood === 'excited') {
      anim = Animated.loop(Animated.sequence([
        Animated.timing(charY, { toValue: -14, duration: 320, useNativeDriver: true }),
        Animated.timing(charY, { toValue:   0, duration: 320, useNativeDriver: true }),
        Animated.timing(charY, { toValue: -10, duration: 280, useNativeDriver: true }),
        Animated.timing(charY, { toValue:   0, duration: 280, useNativeDriver: true }),
        Animated.timing(charY, { toValue:   0, duration: 200, useNativeDriver: true }), // rest
      ]));
    } else if (mood === 'thinking') {
      // gentle float + slow tilt
      anim = Animated.loop(Animated.sequence([
        Animated.parallel([
          Animated.timing(charY,      { toValue: -6,  duration: 1100, useNativeDriver: true }),
          Animated.timing(charRotate, { toValue:  5,  duration: 1100, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(charY,      { toValue: 0,  duration: 1100, useNativeDriver: true }),
          Animated.timing(charRotate, { toValue: -5, duration: 1100, useNativeDriver: true }),
        ]),
        Animated.timing(charRotate,   { toValue: 0,  duration: 300,  useNativeDriver: true }),
      ]));
    } else {
      // default: calm bob
      anim = Animated.loop(Animated.sequence([
        Animated.timing(charY, { toValue: -7, duration: 800, useNativeDriver: true }),
        Animated.timing(charY, { toValue:  0, duration: 800, useNativeDriver: true }),
      ]));
    }
    anim.start();
    return () => anim?.stop();
  }, [mood]);

  // ── Typewriter ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!bubbleReady) return;
    let i = 0;
    const len = step.dialogue.length;
    const ms  = len > 130 ? 13 : len > 70 ? 17 : 22;
    const timer = setInterval(() => {
      i++;
      setDisplayedText(step.dialogue.slice(0, i));
      if (i >= len) {
        clearInterval(timer);
        setTypingDone(true);
        haptic('success');
      }
    }, ms);
    return () => clearInterval(timer);
  }, [bubbleReady, step.dialogue]);

  // ── Cursor blink ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typingDone) { cursorOp.setValue(0); return; }
    const blink = Animated.loop(Animated.sequence([
      Animated.timing(cursorOp, { toValue: 0, duration: 380, useNativeDriver: true }),
      Animated.timing(cursorOp, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]));
    blink.start();
    return () => blink.stop();
  }, [typingDone]);

  // ── Continue hint pulse ───────────────────────────────────────────────────
  useEffect(() => {
    if (!typingDone) return;
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(continueScale, { toValue: 1.06, duration: 550, useNativeDriver: true }),
      Animated.timing(continueScale, { toValue: 1.00, duration: 550, useNativeDriver: true }),
    ]));
    pulse.start();
    return () => pulse.stop();
  }, [typingDone]);

  // ── Tap handler ───────────────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    if (!typingDone) {
      setDisplayedText(step.dialogue);
      setTypingDone(true);
      haptic('success');
    } else {
      haptic('light');
      onAnswer('seen');
      onContinue();
    }
  }, [typingDone, step.dialogue, onAnswer, onContinue]);

  // ── Derived values ────────────────────────────────────────────────────────
  const rotateStr = charRotate.interpolate({ inputRange: [-10, 0, 10], outputRange: ['-10deg', '0deg', '10deg'] });

  return (
    <Modal visible transparent statusBarTranslucent animationType="none">
      <TouchableWithoutFeedback onPress={handleTap}>
        <Animated.View style={[styles.root, { opacity: bgOpacity, backgroundColor: scene.bg }]}>

          {/* Sky gradient layer */}
          <View style={[styles.sky, { backgroundColor: scene.sky }]} />

          {/* Floating SVG particles */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {PARTICLES.map((p, i) => {
              const opacity = particleAnims[i].interpolate({
                inputRange: [0, 0.15, 0.80, 1],
                outputRange: [0, 0.7, 0.7, 0],
              });
              const translateY = particleAnims[i].interpolate({
                inputRange: [0, 1],
                outputRange: [0, -p.travel],
              });
              return (
                <Animated.View
                  key={i}
                  style={{
                    position: 'absolute',
                    left: p.x,
                    top:  p.y,
                    opacity,
                    transform: [{ translateY }],
                  }}
                >
                  <Svg width={p.size * 2} height={p.size * 2}>
                    <Circle
                      cx={p.size} cy={p.size} r={p.size}
                      fill={scene.accent}
                    />
                  </Svg>
                </Animated.View>
              );
            })}
          </View>

          {/* Header: story badge + lesson context */}
          <Animated.View style={[styles.header, { opacity: contentOpacity }]}>
            <View style={[styles.storyBadge, { borderColor: char.color + '55' }]}>
              <Text style={[styles.storyBadgeText, { color: char.color }]}>🎬 STORY MODE</Text>
            </View>
            {state.lessonTitle && (
              <Text style={styles.lessonLabel} numberOfLines={1}>{state.lessonTitle}</Text>
            )}
          </Animated.View>

          {/* Character */}
          <Animated.View style={[styles.charArea, { opacity: contentOpacity }]}>
            <Animated.View style={{
              transform: [
                { scale: charScale },
                { translateY: Animated.add(charY, new Animated.Value(0)) },
                { translateX: charX },
                { rotate: rotateStr },
              ],
              opacity: charOpacity,
              alignItems: 'center',
            }}>
              {/* Glow ring */}
              <Animated.View style={[
                styles.glowRing,
                {
                  backgroundColor: `rgba(${char.rgb},0.18)`,
                  shadowColor: char.color,
                  transform: [{ scale: glowScale }],
                  opacity: glowOpacity,
                },
              ]} />

              {/* Outer accent ring */}
              <View style={[styles.accentRing, { borderColor: char.color + '40' }]} />

              {/* Character emoji */}
              <Text style={styles.charEmoji}>{char.emoji}</Text>

              {/* Mood badge */}
              {moodBadge && (
                <View style={styles.moodBadge}>
                  <Text style={styles.moodBadgeText}>{moodBadge}</Text>
                </View>
              )}
            </Animated.View>

            {/* Name tag */}
            <Animated.View style={[
              styles.nameTag,
              { backgroundColor: char.color, transform: [{ translateY: nameTagY }], opacity: nameTagOp },
            ]}>
              <Text style={styles.nameTagText}>{char.name}</Text>
            </Animated.View>
          </Animated.View>

          {/* Dialogue bubble */}
          <Animated.View style={[
            styles.bubble,
            {
              borderColor: char.color + '40',
              opacity: bubbleOp,
              transform: [{ translateY: bubbleY }, { scale: bubbleScale }],
            },
          ]}>
            {/* Bubble pointer — SVG triangle pointing upward */}
            <View style={styles.pointerWrap} pointerEvents="none">
              <Svg width={18} height={10}>
                <Polygon
                  points="9,0 18,10 0,10"
                  fill="rgba(255,255,255,0.07)"
                  stroke={char.color + '40'}
                  strokeWidth={1}
                />
              </Svg>
            </View>

            {/* Dialogue text */}
            <Text style={styles.dialogueText}>
              {displayedText}
              {!typingDone && (
                <Animated.Text style={[styles.cursor, { color: char.color, opacity: cursorOp }]}>
                  {'  ▋'}
                </Animated.Text>
              )}
            </Text>
          </Animated.View>

          {/* Continue indicator */}
          <View style={styles.footer}>
            {typingDone ? (
              <Animated.View style={{ transform: [{ scale: continueScale }] }}>
                <Text style={[styles.continueText, { color: char.color }]}>Tap to continue →</Text>
              </Animated.View>
            ) : (
              <Text style={[styles.skipText, { color: char.color + '70' }]}>Tap to skip</Text>
            )}
          </View>

        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  sky: {
    ...StyleSheet.absoluteFill,
    height: '55%',
    top: 0,
    opacity: 0.6,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    alignItems: 'center',
    gap: 8,
  },
  storyBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  storyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  lessonLabel: {
    fontSize: 11,
    color: 'rgba(200,210,230,0.5)',
    fontWeight: '600',
    letterSpacing: 0.4,
    maxWidth: W - 60,
  },
  charArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  glowRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 12,
  },
  accentRing: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1.5,
  },
  charEmoji: {
    fontSize: 80,
    lineHeight: 96,
    zIndex: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  moodBadge: {
    position: 'absolute',
    top: -4,
    right: -16,
    backgroundColor: 'rgba(5,5,15,0.75)',
    borderRadius: 14,
    padding: 4,
    zIndex: 2,
  },
  moodBadgeText: { fontSize: 22 },
  nameTag: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 5,
  },
  nameTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderRadius: 22,
    padding: 22,
    marginHorizontal: 18,
    width: W - 36,
    position: 'relative',
  },
  pointerWrap: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
  },
  dialogueText: {
    color: '#dde8f5',
    fontSize: 16.5,
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  cursor: {
    fontSize: 14,
    fontWeight: '800',
  },
  footer: {
    paddingBottom: 8,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  skipText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
