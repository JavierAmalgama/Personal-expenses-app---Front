import { Pressable, Text, View } from 'react-native';
import { fmtMoney } from '@/utils/format';
import { fonts, makeStyles } from '@/theme';

type Props = { label: string; value: number; max: number; share: number; onPress?: () => void };

export function HBar({ label, value, max, share, onPress }: Props) {
  const s = useStyles();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={s.row}>
      <Text style={s.label} numberOfLines={1}>{label}</Text>
      <View style={s.track}>
        <View style={[s.fill, { width: `${max ? (value / max) * 100 : 0}%` }]} />
      </View>
      <Text style={s.value}>
        {fmtMoney(value)}
        <Text style={s.share}>  {Math.round(share * 100)}%</Text>
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { width: 120, fontFamily: fonts.body, fontSize: 13.5, color: c.ink2 },
  track: { flex: 1, height: 14, backgroundColor: c.surface2, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', minWidth: 2, backgroundColor: c.bar, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  value: { fontFamily: fonts.body, fontSize: 13.5, color: c.ink, fontVariant: ['tabular-nums'], textAlign: 'right' },
  share: { fontSize: 12, color: c.muted },
}));
