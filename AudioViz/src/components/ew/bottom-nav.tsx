import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EW, EWRadius, EWSpacing, cyanGlow } from '@/constants/echowave-theme';
import { EWIcon, type EWIconName } from '@/components/ew/icon';

const ICONS: Record<string, EWIconName> = {
  index: 'mic',
  analyzer: 'equalizer',
  library: 'folder',
};

/** Structural subset of react-navigation's BottomTabBarProps that we consume. */
export type BottomNavProps = {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
};

export function BottomNav({ state, navigation }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, EWSpacing.stackMd) }]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.fill]} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icon = ICONS[route.name] ?? 'mic';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              hitSlop={8}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <EWIcon
                  name={icon}
                  size={24}
                  color={focused ? EW.onPrimaryContainer : EW.outlineVariant}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopLeftRadius: EWRadius.xl,
    borderTopRightRadius: EWRadius.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: EW.hairline,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: 'rgba(14,14,14,0.5)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: EWSpacing.stackMd,
    paddingHorizontal: EWSpacing.gutter,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.9 }],
  },
  iconWrap: {
    padding: EWSpacing.stackSm + 4,
    borderRadius: EWRadius.full,
  },
  iconWrapActive: {
    backgroundColor: EW.primaryContainer,
    ...cyanGlow(15, 0.4),
  },
});
