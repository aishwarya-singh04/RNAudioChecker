import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { EW, EWRadius } from '@/constants/echowave-theme';

export type MiniWaveformProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  gap?: number;
  /** Animate the bars (used during playback / recorded preview). */
  animated?: boolean;
  align?: 'bottom' | 'center';
};

/**
 * Lightweight bar waveform for thumbnails, placeholders and playback previews.
 * For the live capture spectrum use the Skia `AudioSpectrum` instead.
 */
export function MiniWaveform({
  data,
  width,
  height = 48,
  color = EW.primaryContainer,
  gap = 2,
  animated = false,
  align = 'center',
}: MiniWaveformProps) {
  return (
    <View
      style={[
        styles.row,
        { height, gap, alignItems: align === 'center' ? 'center' : 'flex-end' },
        width ? { width } : styles.flex,
      ]}>
      {data.map((value, index) => (
        <WaveBar
          key={index}
          value={value}
          height={height}
          color={color}
          animated={animated}
          index={index}
        />
      ))}
    </View>
  );
}

function WaveBar({
  value,
  height,
  color,
  animated,
  index,
}: {
  value: number;
  height: number;
  color: string;
  animated: boolean;
  index: number;
}) {
  const scale = useSharedValue(value);

  useEffect(() => {
    if (animated) {
      scale.value = withRepeat(
        withTiming(Math.min(1, value + 0.25), { duration: 500 + (index % 7) * 90 }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(value, { duration: 200 });
    }
  }, [animated, value, index, scale]);

  const barStyle = useAnimatedStyle(() => ({
    height: Math.max(3, scale.value * height),
  }));

  return <Animated.View style={[styles.bar, { backgroundColor: color }, barStyle]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  bar: {
    flex: 1,
    minWidth: 2,
    borderRadius: EWRadius.full,
  },
});
