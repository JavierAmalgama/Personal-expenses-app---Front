import { Text, View, type ViewStyle } from 'react-native';
import { Eyebrow } from '@/components/ui';
import { fonts, makeStyles } from '@/theme';

type Props = { label: string; value: string; sub?: string; hero?: boolean; style?: ViewStyle };

export function Kpi({ label, value, sub, hero, style }: Props) {
  const s = useStyles();
  return (
    <View style={[s.kpi, hero && s.hero, style]}>
      <Eyebrow inverted={hero}>{label}</Eyebrow>
      <Text style={[s.value, hero && s.heroValue]}>{value}</Text>
      {sub ? <Text style={[s.sub, hero && s.heroSub]}>{sub}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  kpi: {
    backgroundColor: c.surface,
    borderColor: c.line,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
    minWidth: 0,
  },
  hero: { backgroundColor: c.accent, borderColor: c.accent },
  value: { fontFamily: fonts.display, fontSize: 22, color: c.ink, letterSpacing: -0.2, fontVariant: ['tabular-nums'] },
  heroValue: { fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 38, color: c.accentInk },
  sub: { fontFamily: fonts.body, fontSize: 12.5, color: c.muted },
  heroSub: { color: c.accentInk, opacity: 0.78 },
}));
