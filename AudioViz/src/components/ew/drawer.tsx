import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EW, EWRadius, EWSpacing } from '@/constants/echowave-theme';
import { EWIcon, type EWIconName } from '@/components/ew/icon';
import { EWText } from '@/components/ew/typography';

type DrawerContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within DrawerProvider');
  return ctx;
}

type MenuItem = { icon: EWIconName; label: string; route?: string };

const MENU: MenuItem[] = [
  { icon: 'home', label: 'Home', route: '/' },
  { icon: 'folder', label: 'History', route: '/library' },
  { icon: 'favorite', label: 'Favorites', route: '/library' },
  { icon: 'settings', label: 'Settings', route: '/settings' },
  { icon: 'help-outline', label: 'Help' },
  { icon: 'info-outline', label: 'About' },
  { icon: 'logout', label: 'Logout' },
];

const AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDe6FLfOOlYhkCWa-DstrIdY2uhgoFT6lQvCGUW-FVqClKOA8I3E4_Qc_76Gsj1mXumSG5MaiUqSWqngCJ81DbO0AaO59oufgt3kzn0GscmgmF-CTUB--kHBVuUAV794Qpfy81au8w3HNcpffIlS4ooefx3qg8OHTIocCb5nMKQVJpJwEBmvlrG91Awb3XZOrzq5vKrOCNxpUzA5mYNH9awzbpLq7w9yWHn5uHHVc4iGQcGoQrrDWT9muR-I_eFRrhaTlabOgEleks';

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <DrawerContext.Provider value={value}>
      {children}
      <AppDrawer isOpen={isOpen} close={close} />
    </DrawerContext.Provider>
  );
}

function AppDrawer({ isOpen, close }: { isOpen: boolean; close: () => void }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const drawerWidth = Math.min(320, width * 0.82);

  const progress = useDerivedValue(() => withTiming(isOpen ? 1 : 0, { duration: 280 }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -drawerWidth * (1 - progress.value) }],
  }));

  const onNavigate = (route?: string) => {
    close();
    if (route) {
      setTimeout(() => router.push(route as never), 120);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          { width: drawerWidth, paddingTop: insets.top + EWSpacing.stackLg },
          panelStyle,
        ]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.panelFill]} />

        <View style={styles.header}>
          <Image source={{ uri: AVATAR }} style={styles.avatar} contentFit="cover" />
          <EWText variant="headlineMd" style={styles.name}>
            Alex Rivera
          </EWText>
          <EWText variant="labelSm" color={EW.onSurfaceVariant}>
            alex.rivera@echowave.app
          </EWText>
        </View>

        <View style={styles.menu}>
          {MENU.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => onNavigate(item.route)}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
              <EWIcon
                name={item.icon}
                size={22}
                color={item.label === 'Logout' ? EW.error : EW.onSurfaceVariant}
              />
              <EWText color={item.label === 'Logout' ? EW.error : EW.onSurface}>
                {item.label}
              </EWText>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderTopRightRadius: EWRadius.xl,
    borderBottomRightRadius: EWRadius.xl,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: EW.glassBorder,
    overflow: 'hidden',
    paddingHorizontal: EWSpacing.stackMd,
  },
  panelFill: {
    backgroundColor: 'rgba(18,18,18,0.75)',
  },
  header: {
    paddingHorizontal: EWSpacing.stackSm,
    paddingBottom: EWSpacing.stackLg,
    gap: EWSpacing.unit,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: EW.hairline,
    marginBottom: EWSpacing.stackMd,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: EWRadius.full,
    marginBottom: EWSpacing.stackSm,
    borderWidth: 2,
    borderColor: EW.primaryContainer,
  },
  name: {
    color: EW.onSurface,
  },
  menu: {
    gap: EWSpacing.unit,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EWSpacing.stackMd,
    paddingVertical: EWSpacing.stackMd,
    paddingHorizontal: EWSpacing.stackMd,
    borderRadius: EWRadius.lg,
  },
  menuItemPressed: {
    backgroundColor: EW.surfaceContainerHigh,
  },
});
