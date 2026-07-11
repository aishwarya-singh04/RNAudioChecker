import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EW, EWRadius, EWSpacing } from '@/constants/echowave-theme';
import { useDrawer } from '@/components/ew/drawer';
import { EWIcon } from '@/components/ew/icon';
import { EWText } from '@/components/ew/typography';

const AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDe6FLfOOlYhkCWa-DstrIdY2uhgoFT6lQvCGUW-FVqClKOA8I3E4_Qc_76Gsj1mXumSG5MaiUqSWqngCJ81DbO0AaO59oufgt3kzn0GscmgmF-CTUB--kHBVuUAV794Qpfy81au8w3HNcpffIlS4ooefx3qg8OHTIocCb5nMKQVJpJwEBmvlrG91Awb3XZOrzq5vKrOCNxpUzA5mYNH9awzbpLq7w9yWHn5uHHVc4iGQcGoQrrDWT9muR-I_eFRrhaTlabOgEleks';

export type TopBarProps = {
  variant?: 'main' | 'back';
  title?: string;
  showSettings?: boolean;
};

export function TopBar({ variant = 'main', title = 'EchoWave', showSettings = true }: TopBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const drawer = useDrawer();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.fill]} />
      <View style={styles.row}>
        <View style={styles.left}>
          {variant === 'back' ? (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
              <EWIcon name="arrow-back" color={EW.onSurface} />
            </Pressable>
          ) : (
            <Pressable
              onPress={drawer.open}
              hitSlop={12}
              style={({ pressed }) => pressed && styles.pressed}>
              <Image source={{ uri: AVATAR }} style={styles.avatar} contentFit="cover" />
            </Pressable>
          )}
          <EWText
            variant={variant === 'back' ? 'headlineMd' : 'displayLgMobile'}
            color={EW.primaryContainer}>
            {title}
          </EWText>
        </View>

        {showSettings ? (
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={12}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
            <EWIcon name="settings" color={EW.primaryContainer} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export const TOP_BAR_HEIGHT = 56;

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: EW.glassBorder,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: 'rgba(32,31,31,0.6)',
  },
  row: {
    height: TOP_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: EWSpacing.screen,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EWSpacing.stackMd,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: EWRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EW.glassBorder,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: EWRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
