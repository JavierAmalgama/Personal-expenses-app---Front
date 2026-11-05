import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold, useFonts } from '@expo-google-fonts/geist';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ToastProvider } from '@/components/Toast';
import { useColors } from '@/theme';

export default function RootLayout() {
  const colors = useColors();
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return (
    <ToastProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" options={{ title: 'Libreta' }} />
        <Stack.Screen name="movement" options={{ presentation: 'modal', title: 'Movimiento' }} />
      </Stack>
    </ToastProvider>
  );
}
