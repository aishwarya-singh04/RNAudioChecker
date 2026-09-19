import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { EW } from '@/constants/echowave-theme';

/** Same asset the native SplashScreen storyboard shows. */
const ICON = require('@/assets/images/splash-icon.png');

type Props = {
  onFinish: () => void;
};

/**
 * Seamless splash:
 * 1) Mount a pixel-matched twin of the native splash (same bg + icon size)
 * 2) Hide the native splash with no fade (user never sees a swap)
 * 3) Bounce the icon in place, then fade the overlay into the app
 */
export function AnimatedSplashOverlay({ onFinish }: Props) {
  const started = useRef(false);
  const scale = useSharedValue(1);
  const overlayOpacity = useSharedValue(1);

  const finish = () => {
    onFinish();
  };

  const play = () => {
    scale.value = withSequence(
      withSpring(1.1, { damping: 9, stiffness: 170 }),
      withSpring(0.95, { damping: 10, stiffness: 190 }),
      withSpring(1.04, { damping: 11, stiffness: 180 }),
      withSpring(1, { damping: 14, stiffness: 160 }),
    );

    overlayOpacity.value = withDelay(
      1100,
      withTiming(0, { duration: 380, easing: Easing.inOut(Easing.cubic) }, (done) => {
        if (done) {
          scheduleOnRN(finish);
        }
      }),
    );
  };

  const onReady = () => {
    if (started.current) return;
    started.current = true;

    // Instant native → JS twin handoff (no cross-fade / second splash).
    SplashScreen.setOptions({ duration: 0, fade: false });

    requestAnimationFrame(() => {
      SplashScreen.hideAsync()
        .catch(() => {})
        .finally(() => {
          play();
        });
    });
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} onLayout={onReady} pointerEvents="none">
      <Animated.View style={iconStyle}>
        <Image source={ICON} style={styles.icon} contentFit="contain" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: EW.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  // Match SplashScreen.storyboard logo size (180pt)
  icon: {
    width: 180,
    height: 180,
  },
});
