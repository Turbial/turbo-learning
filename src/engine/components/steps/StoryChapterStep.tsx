// Story Phase — cinematic chapter/episode title card.
// Full-screen blackout with staggered text reveal. Auto-advances after 3.2s
// (or user taps anywhere to skip). Gives the "next episode" feel.

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Modal, TouchableWithoutFeedback, StyleSheet,
  Animated, Dimensions, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Line } from 'react-native-svg';
import type { StepProps } from '../../stepRegistry';
import type { StoryChapterStep as StoryChapterStepType } from '../../types';

const { width: W } = Dimensions.get('window');
const AUTO_ADVANCE_MS = 3200;

// Animated SVG line component
const AnimatedLine = Animated.createAnimatedComponent(Line);

export default function StoryChapterStep({ step, onAnswer, onContinue }: StepProps<StoryChapterStepType>) {
  // ── Animation values ────────────────────────────────────────────────────
  const bgOpacity   = useRef(new Animated.Value(0)).current;

  const actOpacity  = useRef(new Animated.Value(0)).current;
  const actY        = useRef(new Animated.Value(-14)).current;

  const lineWidth   = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(28)).current;
  const titleScale   = useRef(new Animated.Value(0.88)).current;

  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY       = useRef(new Animated.Value(16)).current;

  const episodeOpacity = useRef(new Animated.Value(0)).current;
  const episodeScale   = useRef(new Animated.Value(1.4)).current;

  const footerOpacity = useRef(new Animated.Value(0)).current;

  // ── Haptics helper ──────────────────────────────────────────────────────
  const haptic = useCallback(() => {
    if (Platform.OS === 'web') return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch (_) {}
  }, []);

  // ── Reveal sequence ─────────────────────────────────────────────────────
  useEffect(() => {
    haptic();

    // 0ms — bg fade in
    Animated.timing(bgOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    // 150ms — episode number scales down into place (from large to normal)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(episodeScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(episodeOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    }, 150);

    // 420ms — act label slides down + fades in
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(actY, { toValue: 0, tension: 100, friction: 10, useNativeDriver: true }),
        Animated.timing(actOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    }, 420);

    // 640ms — divider line grows from center outward
    setTimeout(() => {
      Animated.timing(lineWidth, { toValue: 1, duration: 500, useNativeDriver: false }).start();
    }, 640);

    // 800ms — title springs up
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(titleY,     { toValue: 0, tension: 55, friction: 7, useNativeDriver: true }),
        Animated.spring(titleScale, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]).start();
    }, 800);

    // 1100ms — subtitle fades in
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(subtitleY, { toValue: 0, tension: 90, friction: 9, useNativeDriver: true }),
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]).start();
    }, 1100);

    // 1500ms — footer "tap to skip" appears
    setTimeout(() => {
      Animated.timing(footerOpacity, { toValue: 0.6, duration: 400, useNativeDriver: true }).start();
    }, 1500);

    // Auto-advance
    const tid = setTimeout(() => {
      onAnswer('seen');
      onContinue();
    }, AUTO_ADVANCE_MS);

    return () => clearTimeout(tid);
  }, []);

  const handleTap = useCallback(() => {
    onAnswer('seen');
    onContinue();
  }, [onAnswer, onContinue]);

  // Line width from 0 → full
  const lineX1 = lineWidth.interpolate({ inputRange: [0, 1], outputRange: [W / 2, 24] });
  const lineX2 = lineWidth.interpolate({ inputRange: [0, 1], outputRange: [W / 2, W - 24] });

  const epNum = step.episode ? String(step.episode).padStart(2, '0') : null;

  return (
    <Modal visible transparent statusBarTranslucent animationType="none">
      <TouchableWithoutFeedback onPress={handleTap}>
        <Animated.View style={[styles.root, { opacity: bgOpacity }]}>

          {/* Scanline overlay for cinematic feel */}
          <View style={styles.scanlines} pointerEvents="none" />

          {/* Episode number — top center, scales in large then settles */}
          {epNum && (
            <Animated.View style={[
              styles.episodeWrap,
              { opacity: episodeOpacity, transform: [{ scale: episodeScale }] },
            ]}>
              <Text style={styles.episodeLabel}>EPISODE</Text>
              <Text style={styles.episodeNum}>{epNum}</Text>
            </Animated.View>
          )}

          {/* Center content block */}
          <View style={styles.center}>

            {/* Act label */}
            {step.act && (
              <Animated.Text style={[
                styles.actLabel,
                { opacity: actOpacity, transform: [{ translateY: actY }] },
              ]}>
                {step.act.toUpperCase()}
              </Animated.Text>
            )}

            {/* Animated divider line */}
            <View style={styles.lineWrap} pointerEvents="none">
              <Svg width={W} height={2}>
                <AnimatedLine
                  x1={lineX1 as any}
                  y1={1} x2={lineX2 as any} y2={1}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth={1}
                />
              </Svg>
            </View>

            {/* Chapter title — big, dramatic */}
            <Animated.Text style={[
              styles.title,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleY }, { scale: titleScale }],
              },
            ]}>
              {step.title}
            </Animated.Text>

            {/* Subtitle */}
            {step.subtitle && (
              <Animated.Text style={[
                styles.subtitle,
                { opacity: subtitleOpacity, transform: [{ translateY: subtitleY }] },
              ]}>
                {step.subtitle}
              </Animated.Text>
            )}
          </View>

          {/* Bottom: tap to skip */}
          <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
            <Text style={styles.footerText}>Tap anywhere to continue</Text>
          </Animated.View>

        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 52 : 36,
  },
  scanlines: {
    ...StyleSheet.absoluteFill,
    opacity: 0.04,
    // Pure CSS scanlines aren't doable in RN without an image,
    // but the dark overlay still softens the pure black.
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  episodeWrap: {
    alignItems: 'center',
    gap: 2,
  },
  episodeLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 3.5,
  },
  episodeNum: {
    fontSize: 64,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.08)',
    letterSpacing: 4,
    lineHeight: 72,
  },
  center: {
    alignItems: 'center',
    width: '100%',
    gap: 20,
    paddingHorizontal: 28,
  },
  actLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 3,
  },
  lineWrap: {
    width: W,
    height: 2,
    marginVertical: -4,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(200,215,235,0.55)',
    textAlign: 'center',
    letterSpacing: 0.4,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.6,
  },
});
