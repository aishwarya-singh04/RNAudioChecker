import {
  Canvas,
  LinearGradient,
  Path,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import { StyleSheet, View } from 'react-native';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

const RAINBOW = [
  '#ff2d55',
  '#ff9500',
  '#ffcc00',
  '#34c759',
  '#00c7be',
  '#32ade6',
  '#5856d6',
  '#af52de',
  '#ff2d55',
];

export interface AudioSpectrumProps {
  bars: SharedValue<number[]>;
  width: number;
  height: number;
  /** Gap between bars in px. */
  gap?: number;
  /** Minimum bar height in px so idle state still shows a thin baseline. */
  minBarHeight?: number;
  /** Horizontal gradient colors. Defaults to a rainbow sweep. */
  colors?: string[];
}

/**
 * Sharp, edgy rainbow spectrum. Bars are drawn as hard-edged rectangles
 * mirrored around the vertical center and filled with a horizontal gradient,
 * so hue tracks frequency across the x-axis.
 */
export function AudioSpectrum({
  bars,
  width,
  height,
  gap = 2,
  minBarHeight = 3,
  colors = RAINBOW,
}: AudioSpectrumProps) {
  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const values = bars.value;
    const count = values.length;
    if (count === 0) return p;

    const barWidth = Math.max(1, (width - gap * (count - 1)) / count);
    const mid = height / 2;

    for (let i = 0; i < count; i++) {
      const magnitude = values[i];
      const barHeight = Math.max(minBarHeight, magnitude * height);
      const x = i * (barWidth + gap);
      p.addRect(Skia.XYWHRect(x, mid - barHeight / 2, barWidth, barHeight));
    }

    return p;
  }, [width, height, gap, minBarHeight]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas style={{ width, height }}>
        <Path path={path}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, 0)}
            colors={colors}
          />
        </Path>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
