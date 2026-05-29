// ─── Haptic feedback wrapper — expo-haptics abstraction ───
// Provides typed helper functions and a useHaptics() hook for component use.
// All interactive components should import from here rather than expo-haptics directly.

import { useCallback } from "react";
import * as Haptics from "expo-haptics";

// ─── Direct helper functions ───

/** Success pulse — correct answer, milestone reached */
export function successTap() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** Error warning — wrong answer, action rejected */
export function errorTap() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/** Warning tap — soft caution (e.g. combo almost lost) */
export function warningTap() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

/** Light tap — selection, toggle, UI interaction */
export function lightTap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Medium tap — button press, card selection */
export function mediumTap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/** Heavy tap — important action, confirmation */
export function heavyTap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

/** Selection feedback — picker, scroll tick */
export function selectionTap() {
  Haptics.selectionAsync();
}

// ─── React hook ───

export function useHaptics() {
  const onSuccess = useCallback(() => successTap(), []);
  const onError = useCallback(() => errorTap(), []);
  const onWarning = useCallback(() => warningTap(), []);
  const onLight = useCallback(() => lightTap(), []);
  const onMedium = useCallback(() => mediumTap(), []);
  const onHeavy = useCallback(() => heavyTap(), []);
  const onSelection = useCallback(() => selectionTap(), []);

  return {
    success: onSuccess,
    error: onError,
    warning: onWarning,
    light: onLight,
    medium: onMedium,
    heavy: onHeavy,
    selection: onSelection,
  };
}
