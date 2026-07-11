import { BlurView } from 'expo-blur';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { EW, EWRadius } from '@/constants/echowave-theme';

export type GlassViewProps = ViewProps & {
  intensity?: number;
  radius?: number;
  bordered?: boolean;
};

/**
 * Glassmorphism surface: a blurred backdrop with a translucent fill and a
 * hairline white border, matching the Stitch `.glass-panel` treatment.
 */
export function GlassView({
  children,
  style,
  intensity = 30,
  radius = EWRadius.xl,
  bordered = true,
  ...rest
}: GlassViewProps) {
  return (
    <View
      style={[
        styles.container,
        { borderRadius: radius, borderWidth: bordered ? StyleSheet.hairlineWidth : 0 },
        style as ViewStyle,
      ]}
      {...rest}>
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
      <View style={[StyleSheet.absoluteFill, styles.fill, { borderRadius: radius }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderColor: EW.glassBorder,
    backgroundColor: 'rgba(20,20,20,0.4)',
  },
  fill: {
    backgroundColor: EW.glassFill,
  },
});
