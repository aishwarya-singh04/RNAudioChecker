import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-splash';
import { DrawerProvider } from '@/components/ew/drawer';
import { EW } from '@/constants/echowave-theme';
import { RecordingsProvider } from '@/store/recordings-store';

SplashScreen.preventAutoHideAsync();
// Instant native handoff — no fade that reveals a second splash underneath.
SplashScreen.setOptions({ duration: 0, fade: false });

const echoWaveNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: EW.bg,
    card: EW.bg,
    primary: EW.primaryContainer,
    text: EW.onSurface,
    border: EW.glassBorder,
  },
};

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const onSplashFinish = useCallback(() => setShowSplash(false), []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: EW.bg }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: EW.bg }}>
        <ThemeProvider value={echoWaveNavTheme}>
          <RecordingsProvider>
            <DrawerProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: EW.bg },
                  animation: 'fade',
                }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="completed" />
                <Stack.Screen name="details/[id]" />
                <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="permission" options={{ presentation: 'modal' }} />
              </Stack>
              {showSplash ? <AnimatedSplashOverlay onFinish={onSplashFinish} /> : null}
              <StatusBar style="light" />
            </DrawerProvider>
          </RecordingsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
