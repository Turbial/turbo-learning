// integrations/push.ts — Expo push registration (no-op on web).
import { Platform } from 'react-native';
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';

export async function registerForPush(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  // const { status } = await Notifications.requestPermissionsAsync();
  // if (status !== 'granted') return null;
  // const token = (await Notifications.getExpoPushTokenAsync()).data;
  // return token;
  return null; // TODO: enable once expo-notifications is installed + configured
}
export async function unregisterPush(): Promise<void> { /* remove token server-side */ }
