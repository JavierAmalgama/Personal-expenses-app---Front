import { StyleSheet, Text, View } from 'react-native';
import { checkHealth } from '@/api/client';
import { StatusView } from '@/components/StatusView';
import { API_URL } from '@/config';
import { useFetch } from '@/hooks/useFetch';
import { colors } from '@/theme';

export default function HomeScreen() {
  const { data, error, loading, reload } = useFetch(checkHealth);

  if (!data) return <StatusView loading={loading} error={error} onRetry={reload} />;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Seguimiento de gastos</Text>
        <Text style={styles.ok}>API conectada</Text>
        <Text style={styles.muted}>{API_URL}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  ok: { fontSize: 16, color: colors.success, fontWeight: '600' },
  muted: { fontSize: 14, color: colors.muted },
});
