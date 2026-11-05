import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

const light = {
  bg: '#f3f5f2',
  surface: '#ffffff',
  surface2: '#eaeee9',
  ink: '#121613',
  ink2: '#4a524c',
  muted: '#7b847d',
  line: '#dde2dc',
  lineStrong: '#c6cdc6',
  accent: '#17694f',
  accentInk: '#ffffff',
  accentSoft: '#dcece4',
  bar: '#2f7d62',
  bar2: '#b9c3bc',
  danger: '#b8352f',
  dangerSoft: '#f7e3e1',
  warn: '#9a6a00',
  warnSoft: '#f6ecd2',
  good: '#1f7a3a',
  toastAction: '#86dcb6',
};

export type Colors = typeof light;

const dark: Colors = {
  bg: '#0e1210',
  surface: '#161b18',
  surface2: '#1e2521',
  ink: '#edf2ee',
  ink2: '#b2bcb5',
  muted: '#7f8a83',
  line: '#28302b',
  lineStrong: '#38423c',
  accent: '#4cc495',
  accentInk: '#06150f',
  accentSoft: '#173a2c',
  bar: '#4cc495',
  bar2: '#46524b',
  danger: '#ef7b73',
  dangerSoft: '#3a1d1b',
  warn: '#e7b54a',
  warnSoft: '#352a12',
  good: '#5fd07e',
  toastAction: '#17694f',
};

// Custom fonts ignore fontWeight on Android, so each weight is its own family.
export const fonts = {
  display: 'BricolageGrotesque_600SemiBold',
  displayBold: 'BricolageGrotesque_700Bold',
  body: 'Geist_400Regular',
  bodyMedium: 'Geist_500Medium',
  bodySemi: 'Geist_600SemiBold',
};

export const radius = { r: 14, sm: 9, pill: 999 };

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (c: Colors) => T) {
  return function useStyles() {
    const colors = useColors();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
