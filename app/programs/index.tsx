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
import { spacing, fontSize, fontWeight, radius } from '../../src/theme/tokens';
import { trackEvent } from '../../src/integrations/analytics';
import type { CatalogItem } from '../../src/data/useProgramCatalog';

export default function Programs({ userId }: { userId?: string }) {
  const { colors } = useTheme(); const router = useRouter();
  const { data, isLoading, refetch } = useProgramCatalog(userId);
  const enroll = async (item: CatalogItem) => {
    await supabase.from('enrollments').upsert({ user_id: userId, program_id: item.id }, { onConflict: 'user_id,program_id' });
    trackEvent({ name: 'program_enrolled', programSlug: item.slug });
    refetch(); router.push('/home');
  };
  if (isLoading) return <View style={{ padding: spacing.xl, gap: spacing.md }}>{[0,1,2].map(i => <Skeleton key={i} height={88} />)}</View>;

  // Sort: enrolled/available first, coming-soon last
  const sorted = [...(data ?? [])].sort((a, b) => {
    if (a.comingSoon === b.comingSoon) return 0;
    return a.comingSoon ? 1 : -1;
  });

  return (
    <FlatList
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}
      data={sorted}
      ListHeaderComponent={
        <Text style={{ color: colors.text, fontSize: fontSize.title, fontWeight: fontWeight.bold, textAlign: 'center', marginBottom: spacing.sm }}>
          Programs
        </Text>
      }
      ListEmptyComponent={<EmptyState title="No programs yet" message="Check back soon." />}
      renderItem={({ item }) => (
        <View style={{ opacity: item.comingSoon ? 0.6 : 1 }}>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ color: colors.text, fontSize: fontSize.subtitle, fontWeight: fontWeight.bold, textAlign: 'center' }}>{item.title}</Text>
              {item.comingSoon && (
                <View style={{
                  backgroundColor: colors.textMuted,
                  borderRadius: radius.full ?? 999,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}>
                  <Text style={{ color: colors.surface, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Coming Soon</Text>
                </View>
              )}
            </View>
            {item.subtitle ? <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 4 }}>{item.subtitle}</Text> : null}
            <View style={{ marginTop: spacing.md }}>
              {item.comingSoon ? (
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 10,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}>
                  <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: fontSize.body }}>Coming Soon</Text>
                </View>
              ) : (
                <Button title={item.enrolled ? 'Continue' : 'Enroll'} onPress={() => item.enrolled ? router.push('/home') : enroll(item)} />
              )}
            </View>
          </Card>
        </View>
      )}
      keyExtractor={i => i.id}
    />
  );
}
