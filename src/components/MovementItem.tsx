import { Pressable, Text, View } from 'react-native';
import type { Movement } from '@/api/types';
import { fmtDate, fmtMoney, paymentLabel } from '@/utils/format';
import { fonts, makeStyles } from '@/theme';

export function MovementItem({ movement, onPress, first }: { movement: Movement; onPress: () => void; first?: boolean }) {
  const s = useStyles();
  const income = movement.kind === 'income';
  const meta = [movement.subcategory ?? movement.category ?? 'Sin categoría', paymentLabel(movement), fmtDate(movement.date)]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed, hovered }) => [s.item, !first && s.divider, (pressed || hovered) && s.itemActive]}
    >
      <View style={[s.av, income && s.avIncome]}>
        <Text style={[s.avText, income && s.income]}>{movement.description.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={s.body}>
        <Text style={s.title} numberOfLines={1}>{movement.description}</Text>
        <Text style={s.meta} numberOfLines={1}>{meta}</Text>
      </View>
      <View>
        <Text style={[s.amount, income && s.income]}>
          {income ? '+' : ''}
          {fmtMoney(movement.amount, movement.currency)}
        </Text>
        {movement.shared && <Text style={s.shared}>compartido</Text>}
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 8 },
  divider: { borderTopWidth: 1, borderTopColor: c.line },
  itemActive: { backgroundColor: c.surface2 },
  av: { width: 36, height: 36, borderRadius: 10, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' },
  avIncome: { backgroundColor: c.accentSoft },
  avText: { fontFamily: fonts.display, fontSize: 14, color: c.ink2 },
  body: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.bodyMedium, fontSize: 15, color: c.ink },
  meta: { fontFamily: fonts.body, fontSize: 12.5, color: c.muted },
  amount: { fontFamily: fonts.bodySemi, fontSize: 15, color: c.ink, textAlign: 'right', fontVariant: ['tabular-nums'] },
  income: { color: c.good },
  shared: { fontFamily: fonts.body, fontSize: 12, color: c.muted, textAlign: 'right' },
}));
