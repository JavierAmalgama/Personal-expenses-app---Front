import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '@/components/ui';
import { fonts, makeStyles, useColors } from '@/theme';

type Props = {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

// Renders the loading / error state; returns null when there is data to show.
export function StatusView({ loading, error, onRetry }: Props) {
  const s = useStyles();
  const c = useColors();
  if (error) {
    return (
      <View style={s.center}>
        <Text style={s.error}>{error}</Text>
        <Button label="Reintentar" onPress={onRetry} small />
      </View>
    );
  }
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }
  return null;
}

const useStyles = makeStyles((c) => ({
  center: { alignItems: 'center', justifyContent: 'center', padding: 36, gap: 16 },
  error: { color: c.danger, textAlign: 'center', fontSize: 15, fontFamily: fonts.body, maxWidth: 420 },
}));
