import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

type Props = {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

// Renders the loading / error state; returns null when there is data to show.
export function StatusView({ loading, error, onRetry }: Props) {
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  error: { color: colors.error, textAlign: 'center', fontSize: 16 },
  button: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
