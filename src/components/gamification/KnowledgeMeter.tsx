// components/gamification/KnowledgeMeter.tsx — circular gauge showing % correct on MC/TF/scenario questions
import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors, fontSize, fontWeight, spacing } from "../../theme/tokens";

const R = 52;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * R;

function getLabel(pct: number): { label: string; color: string; emoji: string } {
  if (pct >= 0.9) return { label: "Expert", color: colors.xp, emoji: "🧠" };
  if (pct >= 0.75) return { label: "Solid", color: "#3b82f6", emoji: "💡" };
  if (pct >= 0.5) return { label: "Getting There", color: colors.warning, emoji: "📖" };
  return { label: "Keep Learning", color: colors.error, emoji: "🌱" };
}

export function KnowledgeMeter({
  correct,
  total,
  animated = true,
}: {
  correct: number;
  total: number;
  animated?: boolean;
}) {
  const pct = total > 0 ? correct / total : 0;
  const { label, color, emoji } = getLabel(pct);
  const [displayPct, setDisplayPct] = useState(animated ? 0 : Math.round(pct * 100));
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!animated) {
      setDisplayPct(Math.round(pct * 100));
      return;
    }
    const target = Math.round(pct * 100);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40)); // ~40 frames over 1200ms
    animRef.current = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplayPct(current);
      if (current >= target && animRef.current) {
        clearInterval(animRef.current);
      }
    }, 30);
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [pct, animated]);

  const offset = CIRCUMFERENCE - (displayPct / 100) * CIRCUMFERENCE;
  const center = R + STROKE;

  return (
    <View style={styles.container}>
      <View style={styles.ringWrapper}>
        <Svg width={center * 2} height={center * 2}>
          {/* Background track */}
          <Circle
            cx={center}
            cy={center}
            r={R}
            stroke={colors.surfaceBorder}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Progress arc */}
          <Circle
            cx={center}
            cy={center}
            r={R}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${center}, ${center}`}
          />
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={styles.pctText}>{displayPct}%</Text>
          <Text style={styles.accuracyLabel}>accuracy</Text>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.levelLabel, { color }]}>{label}</Text>
      </View>
      <Text style={styles.detail}>
        {correct}/{total} correct
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  ringWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 140,
  },
  centerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  pctText: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
  },
  accuracyLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
  },
  emoji: {
    fontSize: 20,
  },
  levelLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  detail: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
});
