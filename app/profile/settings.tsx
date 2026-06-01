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
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {SLOTS.map(s => (
              <Pressable key={s} onPress={() => setSlot(s)} style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center',
                borderRadius: radius.md, borderWidth: 2, borderColor: slot === s ? colors.accent : colors.border, backgroundColor: slot === s ? colors.accentSoft : colors.surface }}>
                <Text style={{ color: slot === s ? colors.accent : colors.text, fontWeight: '600', fontSize: 14 }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <Button title="Sign out" variant="secondary" onPress={signOut} />
    </View>
  );
}
