// app/programs/index.tsx — browse + enroll in programs.
import { View, Text, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/data/supabase';
import { useProgramCatalog } from '../../src/data/useProgramCatalog';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Skeleton } from '../../src/components/ui/LoadingSkeleton';
import { useTheme } from '../../src/theme/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../src/theme/tokens';

export default function Programs({ userId }: { userId?: string }) {
  const { colors } = useTheme(); const router = useRouter();
  const { data, isLoading, refetch } = useProgramCatalog(userId);
  const enroll = async (programId: string) => {
    await supabase.from('enrollments').upsert({ user_id: userId, program_id: programId }, { onConflict: 'user_id,program_id' });
    refetch(); router.push('/home');
  };
  if (isLoading) return <View style={{ padding: spacing.xl, gap: spacing.md }}>{[0,1,2].map(i => <Skeleton key={i} height={88} />)}</View>;
  return (
    <FlatList
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}
      data={data ?? []}
      ListEmptyComponent={<EmptyState title="No programs yet" message="Check back soon." />}
      renderItem={({ item }) => (
        <Card>
          <Text style={{ color: colors.text, fontSize: fontSize.subtitle, fontWeight: fontWeight.bold }}>{item.title}</Text>
          {item.subtitle ? <Text style={{ color: colors.textMuted }}>{item.subtitle}</Text> : null}
          <Button title={item.enrolled ? 'Continue' : 'Enroll'} onPress={() => item.enrolled ? router.push('/home') : enroll(item.id)} />
        </Card>
      )}
      keyExtractor={i => i.id}
    />
  );
}
