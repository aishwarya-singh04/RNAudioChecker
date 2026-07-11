import { Tabs } from 'expo-router';

import { BottomNav } from '@/components/ew/bottom-nav';
import { EW } from '@/constants/echowave-theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: EW.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Record' }} />
      <Tabs.Screen name="analyzer" options={{ title: 'Analyzer' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
    </Tabs>
  );
}
