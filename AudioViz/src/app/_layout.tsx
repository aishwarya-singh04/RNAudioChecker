import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DrawerProvider } from '@/components/ew/drawer';
import { EW } from '@/constants/echowave-theme';
import { RecordingsProvider } from '@/store/recordings-store';

SplashScreen.preventAutoHideAsync();

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
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
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
              <StatusBar style="light" />
            </DrawerProvider>
          </RecordingsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
