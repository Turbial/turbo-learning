// app/profile/settings.tsx — notifications, reminder time, account.
import { useState } from 'react';

import { View, Text, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/data/supabase';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../src/theme/tokens';

const SLOTS = ['Morning', 'Afternoon', 'Evening'] as const;

export default function Settings() {
  const { colors } = useTheme(); const router = useRouter();
  const [notif, setNotif] = useState(true); const [slot, setSlot] = useState<string>('Morning');
  const signOut = async () => { await supabase.auth.signOut(); router.replace('/auth/login'); };
  return (
    <View style={{ flex: 1, padding: spacing.xl, gap: spacing.lg, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: fontSize.title, fontWeight: fontWeight.bold }}>Settings</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontSize: fontSize.bodyLg }}>Daily reminders</Text>
        <Switch value={notif} onValueChange={setNotif} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.body }}>Reminder time</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {SLOTS.map(s => (
            <Pressable key={s} onPress={() => setSlot(s)} style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center',
              borderRadius: radius.md, borderWidth: 2, borderColor: slot === s ? colors.accent : colors.border }}>
              <Text style={{ color: slot === s ? colors.accent : colors.text }}>{s}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <Button title="Sign out" variant="secondary" onPress={signOut} />
    </View>
  );
}
