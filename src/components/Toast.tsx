import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { fonts, makeStyles } from '@/theme';

const ToastContext = createContext<(message: string) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const s = useStyles();
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((text: string) => {
    clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(null), 2600);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message && (
        <View style={s.wrap} pointerEvents="none" accessibilityLiveRegion="polite">
          <View style={s.toast}>
            <Text style={s.text}>{message}</Text>
          </View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 28, alignItems: 'center' },
  toast: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: c.ink,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
  },
  text: { color: c.bg, fontFamily: fonts.body, fontSize: 14 },
}));
