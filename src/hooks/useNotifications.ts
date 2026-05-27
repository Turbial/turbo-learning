// useNotifications — expo-notifications wrapper for reminder scheduling
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

interface UseNotificationsOptions {
  userId?: string;
  enabled?: boolean;
}

interface UseNotificationsReturn {
  token: string | null;
  permissionsGranted: boolean;
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  scheduleReminder: (hour: number, minute: number, title?: string, body?: string) => Promise<string | null>;
  cancelAllReminders: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

export function useNotifications({ userId, enabled = false }: UseNotificationsOptions = {}): UseNotificationsReturn {
  const [token, setToken] = useState<string | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isEnabled, setIsEnabled] = useState(enabled);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web") return false;
    try {
      const Notifications = require("expo-notifications");
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        const granted = newStatus === "granted";
        setPermissionsGranted(granted);
        return granted;
      }
      setPermissionsGranted(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Register for push token
  useEffect(() => {
    if (!isEnabled || !userId || Platform.OS === "web") return;

    let mounted = true;
    const register = async () => {
      try {
        const granted = await requestPermissions();
        if (!granted || !mounted) return;

        const Notifications = require("expo-notifications");
        const Constants = require("expo-constants");
        const expoConfig = Constants.default.expoConfig ?? Constants.default.manifest;

        if (expoConfig?.extra?.eas?.projectId) {
          const { data: token } = await Notifications.getExpoPushTokenAsync({
            projectId: expoConfig.extra.eas.projectId,
          });
          if (mounted) setToken(token);
        }
      } catch {
        // Silently fail — notifications are optional
      }
    };
    register();
    return () => { mounted = false; };
  }, [isEnabled, userId]);

  const scheduleReminder = useCallback(async (
    hour: number,
    minute: number,
    title: string = "Time to learn!",
    body: string = "Your daily lesson is waiting. Keep your streak going! 🔥",
  ): Promise<string | null> => {
    if (Platform.OS === "web") return null;
    try {
      const Notifications = require("expo-notifications");
      const id = await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
      return id;
    } catch {
      return null;
    }
  }, []);

  const cancelAllReminders = useCallback(async () => {
    if (Platform.OS === "web") return;
    try {
      const Notifications = require("expo-notifications");
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      // Silently fail
    }
  }, []);

  return {
    token,
    permissionsGranted,
    enabled: isEnabled,
    setEnabled: setIsEnabled,
    scheduleReminder,
    cancelAllReminders,
    requestPermissions,
  };
}
