// app/profile/settings.tsx — notifications, reminder time, account.
import { useState, useEffect } from 'react';

import { View, Text, Switch, Pressable, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/data/supabase';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../src/theme/tokens';
import { useProfile, useUpdateProfile } from '../../src/data/queries';
import { scheduleStreakReminder } from '../../src/integrations/push';

const SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;
type Slot = typeof SLOTS[number];

const SLOT_HOURS: Record<string, number> = {
  Morning: 8,
  Afternoon: 13,
  Evening: 18,
  Night: 21,
};

export default function Settings() {
  const { colors } = useTheme();
  const router = useRouter();

  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [notif, setNotif] = useState(true);
  const [slot, setSlot] = useState<string>('Morning');
  const [saved, setSaved] = useState(false);

  // Populate state from loaded profile
  useEffect(() => {
    if (profile) {
      if (profile.learnTime && (SLOTS as readonly string[]).includes(profile.learnTime)) {
        setSlot(profile.learnTime);
      }
      if (typeof profile.notificationsEnabled === 'boolean') {
        setNotif(profile.notificationsEnabled);
      }
    }
  }, [profile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/login');
  };

  const savePreferences = async () => {
    await updateProfile.mutateAsync({ learnTime: slot, notificationsEnabled: notif });
    if (notif) {
      const hour = SLOT_HOURS[slot] ?? 8;
      await scheduleStreakReminder(hour);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteAccount = () => {
    Alert.alert(
      'Delete account',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.functions.invoke('delete-account');
              if (error) throw error;
            } catch {
              // Edge function unavailable — fall back to sign out
            }
            await supabase.auth.signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, backgroundColor: colors.background, flexGrow: 1 }}>
      <Text style={{ color: colors.text, fontSize: fontSize.title, fontWeight: fontWeight.bold, textAlign: 'center' }}>Settings</Text>
      <View style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.md,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontSize: fontSize.bodyLg, fontWeight: '600' }}>Daily reminders</Text>
          <Switch value={notif} onValueChange={setNotif} />
        </View>
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Reminder time</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {SLOTS.map(s => (
              <Pressable key={s} onPress={() => setSlot(s)} style={{ flex: 1, minWidth: 70, minHeight: 48, alignItems: 'center', justifyContent: 'center',
                borderRadius: radius.md, borderWidth: 2, borderColor: slot === s ? colors.accent : colors.border, backgroundColor: slot === s ? colors.accentSoft : colors.surface }}>
                <Text style={{ color: slot === s ? colors.accent : colors.text, fontWeight: '600', fontSize: 14 }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <Button
        title={updateProfile.isPending ? 'Saving…' : 'Save preferences'}
        onPress={savePreferences}
      />
      {saved && (
        <Text style={{ color: colors.accent, textAlign: 'center', fontSize: fontSize.sm, fontWeight: '600' }}>Saved!</Text>
      )}

      <View style={{ flex: 1, minHeight: spacing.xl }} />

      <Button title="Sign out" variant="secondary" onPress={signOut} />

      <Pressable
        onPress={deleteAccount}
        style={{ alignItems: 'center', paddingVertical: spacing.md }}
      >
        <Text style={{ color: '#ef4444', fontSize: fontSize.body, fontWeight: '600' }}>Delete account</Text>
      </Pressable>
    </ScrollView>
  );
}
