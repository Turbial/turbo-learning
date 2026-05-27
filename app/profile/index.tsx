// app/profile/index.tsx — edit name, avatar, goal, daily mins, learn time.
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { supabase } from '../../src/data/supabase';
import { Field } from '../../src/components/ui/Field';
import { Button } from '../../src/components/ui/Button';
import { Avatar } from '../../src/components/ui/Avatar';
import { useToast } from '../../src/components/feedback/Toast';
import { useTheme } from '../../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../src/theme/tokens';

export default function Profile() {
  const { colors } = useTheme(); const toast = useToast();
  const [name, setName] = useState(''); const [goal, setGoal] = useState('');
  const save = async () => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update({ name, goal }).eq('id', u.user?.id);
    toast(error ? error.message : 'Profile saved', error ? 'error' : 'success');
  };
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, backgroundColor: colors.background }}>
      <View style={{ alignItems: 'center', gap: spacing.sm }}>
        <Avatar name={name} size={72} />
        <Text style={{ color: colors.text, fontSize: fontSize.title, fontWeight: fontWeight.bold }}>Your profile</Text>
      </View>
      <Field value={name} onChangeText={setName} placeholder="Display name" />
      <Field value={goal} onChangeText={setGoal} placeholder="Your goal" multiline />
      <Button title="Save changes" onPress={save} />
    </ScrollView>
  );
}
