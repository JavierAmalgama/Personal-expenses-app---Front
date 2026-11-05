import type { ReactNode } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { fonts, makeStyles, radius, useColors } from '@/theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const s = useStyles();
  return <View style={[s.card, style]}>{children}</View>;
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  const s = useStyles();
  return (
    <View style={s.cardHeader}>
      <Text style={s.h2}>{title}</Text>
      {action}
    </View>
  );
}

export function Eyebrow({ children, inverted }: { children: ReactNode; inverted?: boolean }) {
  const s = useStyles();
  return <Text style={[s.eyebrow, inverted && s.eyebrowInverted]}>{children}</Text>;
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'link' | 'linkDanger';
  small?: boolean;
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', small, disabled }: ButtonProps) {
  const s = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        small && s.btnSmall,
        variant === 'linkDanger' ? s.link : s[variant],
        (pressed || disabled) && { opacity: 0.75 },
      ]}
    >
      <Text style={[s.btnText, small && s.btnTextSmall, s[`${variant}Text`]]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  const s = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[s.opt, selected && s.optSelected]}
    >
      <Text style={[s.optText, selected && s.optTextSelected]}>{label}</Text>
    </Pressable>
  );
}

type SegmentedProps<T extends string> = {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({ value, options, onChange }: SegmentedProps<T>) {
  const s = useStyles();
  return (
    <View style={s.seg}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityLabel={o.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[s.segBtn, selected && s.segBtnSelected]}
          >
            <Text style={[s.segText, selected && s.segTextSelected]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  const s = useStyles();
  const c = useColors();
  return (
    <View style={[s.fieldWrap, style as ViewStyle]}>
      <Text style={s.label}>{label}</Text>
      <TextInput accessibilityLabel={label} placeholderTextColor={c.muted} style={s.field} {...props} />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.surface,
    borderColor: c.line,
    borderWidth: 1,
    borderRadius: radius.r,
    padding: 16,
    minWidth: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  h2: { fontFamily: fonts.display, fontSize: 18, color: c.ink, letterSpacing: -0.2 },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: c.muted,
  },
  eyebrowInverted: { color: c.accentInk, opacity: 0.78 },
  btn: {
    height: 48,
    borderRadius: radius.r,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmall: { height: 34, borderRadius: 10, paddingHorizontal: 14 },
  btnText: { fontFamily: fonts.bodySemi, fontSize: 15 },
  btnTextSmall: { fontSize: 13.5 },
  primary: { backgroundColor: c.accent },
  primaryText: { color: c.accentInk },
  ghost: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line },
  ghostText: { color: c.ink },
  danger: { backgroundColor: c.danger },
  dangerText: { color: c.surface },
  link: { paddingHorizontal: 6, height: 'auto', paddingVertical: 4 },
  linkText: { color: c.accent, fontFamily: fonts.bodyMedium, fontSize: 13.5 },
  linkDangerText: { color: c.danger, fontFamily: fonts.bodyMedium, fontSize: 13.5 },
  opt: {
    borderWidth: 1,
    borderColor: c.lineStrong,
    backgroundColor: c.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  optSelected: { backgroundColor: c.accent, borderColor: c.accent },
  optText: { fontFamily: fonts.body, fontSize: 13.5, color: c.ink },
  optTextSelected: { color: c.accentInk, fontFamily: fonts.bodyMedium },
  seg: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 10,
    padding: 2,
    gap: 2,
  },
  segBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  segBtnSelected: { backgroundColor: c.surface2 },
  segText: { fontFamily: fonts.body, fontSize: 13, color: c.muted },
  segTextSelected: { fontFamily: fonts.bodySemi, color: c.ink },
  fieldWrap: { gap: 5, minWidth: 0 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: c.muted },
  field: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.lineStrong,
    backgroundColor: c.surface,
    paddingHorizontal: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: c.ink,
    outlineColor: c.accent,
  },
}));
