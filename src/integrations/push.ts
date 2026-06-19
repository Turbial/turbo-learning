// integrations/push.ts — Expo push registration + local notification scheduling.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPush(): Promise<string | null> {
  // On Android, create notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  // Get push token
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}

export async function unregisterPush(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleStreakReminder(hour: number, minute: number = 0): Promise<void> {
  // Cancel existing streak reminders first
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as any)?.type === 'streak_reminder') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
  // Schedule daily reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your streak is waiting 🔥",
      body: "Keep your momentum going — your daily lesson takes just 10 minutes.",
      data: { type: 'streak_reminder' },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    } as any,
  });
}

export async function scheduleStreakAtRiskAlert(expiresInHours: number): Promise<void> {
  const triggerDate = new Date(Date.now() + (expiresInHours - 1) * 3600 * 1000);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your streak expires soon ⚠️",
      body: "Complete today's lesson before midnight to keep your streak alive.",
      data: { type: 'streak_at_risk' },
    },
    trigger: { date: triggerDate } as any,
  });
}
