// ─── ReminderSetupStep — request push permission + schedule daily lesson reminder ───

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { StepProps } from "../../stepRegistry";
import type { ReminderStep } from "../../types";

const NOTIFICATION_ID = "daily_lesson_reminder";

const TIME_MAP: Record<string, { hour: number; minute: number; label: string }> = {
  Morning: { hour: 8, minute: 0, label: "8:00 AM" },
  Afternoon: { hour: 13, minute: 0, label: "1:00 PM" },
  Evening: { hour: 20, minute: 0, label: "8:00 PM" },
};

export default function ReminderSetupStep({ step, onAnswer }: StepProps) {
  const s = step as ReminderStep;
  const options: string[] = s.reminderOptions ?? ["Morning", "Afternoon", "Evening"];

  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "denied">("idle");

  const handleSelect = async (option: string) => {
    if (status === "loading" || status === "done") return;
    setSelected(option);
    setStatus("loading");

    // Web: no native push — skip scheduling but still advance
    if (Platform.OS === "web") {
      setStatus("done");
      onAnswer({ time: option, scheduled: false, reason: "web" });
      return;
    }

    try {
      const { status: permStatus } = await Notifications.requestPermissionsAsync();

      if (permStatus !== "granted") {
        setStatus("denied");
        onAnswer({ time: option, scheduled: false, reason: "permission_denied" });
        return;
      }

      // Cancel any previous daily reminder before scheduling the new one
      await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID).catch(() => {});

      const time = TIME_MAP[option] ?? TIME_MAP["Evening"];

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_ID,
        content: {
          title: "Time to learn! 🔥",
          body: "Your daily lesson is waiting. Keep your streak alive!",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: time.hour,
          minute: time.minute,
        } as Notifications.DailyTriggerInput,
      });

      setStatus("done");
      onAnswer({ time: option, scheduled: true });
    } catch (err) {
      console.warn("ReminderSetupStep: scheduling failed", err);
      setStatus("done");
      onAnswer({ time: option, scheduled: false, reason: "error" });
    }
  };

  const timeLabel = selected ? (TIME_MAP[selected]?.label ?? selected) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔔</Text>
      <Text style={styles.title}>Set your daily reminder</Text>
      <Text style={styles.subtitle}>
        The best learners show up at the same time every day. Pick yours.
      </Text>

      <View style={styles.options}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.option,
              selected === opt && styles.optionSelected,
              (status === "loading" || status === "done") && styles.optionDisabled,
            ]}
            onPress={() => handleSelect(opt)}
            activeOpacity={0.7}
            disabled={status === "loading" || status === "done"}
          >
            <Text style={styles.optionIcon}>
              {opt === "Morning" ? "🌅" : opt === "Afternoon" ? "☀️" : "🌙"}
            </Text>
            <Text style={[styles.optionLabel, selected === opt && styles.optionLabelSelected]}>
              {opt}
            </Text>
            {TIME_MAP[opt] && (
              <Text style={[styles.optionTime, selected === opt && styles.optionTimeSelected]}>
                {TIME_MAP[opt].label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {status === "loading" && (
        <Text style={styles.statusText}>Setting up your reminder…</Text>
      )}

      {status === "done" && (
        <View style={styles.confirmation}>
          <Text style={styles.confirmEmoji}>✅</Text>
          <Text style={styles.confirmText}>
            {Platform.OS === "web"
              ? `Got it — ${timeLabel} is your time.`
              : `Reminder set for ${timeLabel} every day.`}
          </Text>
        </View>
      )}

      {status === "denied" && (
        <View style={styles.deniedBox}>
          <Text style={styles.deniedText}>
            Notifications are blocked. You can enable them in your device Settings any time.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2D241C",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B5E50",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  options: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  option: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e8e2d9",
    backgroundColor: "#FDFBF8",
    minWidth: 90,
  },
  optionSelected: {
    borderColor: "#059669",
    backgroundColor: "#ecfdf5",
  },
  optionDisabled: { opacity: 0.6 },
  optionIcon: { fontSize: 24, marginBottom: 6 },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D241C",
    marginBottom: 2,
  },
  optionLabelSelected: { color: "#047857" },
  optionTime: { fontSize: 11, color: "#A09484", fontWeight: "600" },
  optionTimeSelected: { color: "#059669" },
  statusText: {
    fontSize: 14,
    color: "#A09484",
    fontStyle: "italic",
  },
  confirmation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    maxWidth: 300,
  },
  confirmEmoji: { fontSize: 22 },
  confirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#047857",
    flex: 1,
    lineHeight: 22,
  },
  deniedBox: {
    backgroundColor: "#fef3c7",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
    maxWidth: 300,
  },
  deniedText: {
    fontSize: 14,
    color: "#92400e",
    textAlign: "center",
    lineHeight: 20,
  },
});
