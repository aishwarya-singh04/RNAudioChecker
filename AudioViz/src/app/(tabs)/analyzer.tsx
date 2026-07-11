import { useEffect } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { AudioSpectrum } from '@/components/audio-spectrum';
import { EWIcon } from '@/components/ew/icon';
import { GlassView } from '@/components/ew/glass';
import { TopBar } from '@/components/ew/top-bar';
import { EWText } from '@/components/ew/typography';
import { EW, EWRadius, EWSpacing, cyanGlow } from '@/constants/echowave-theme';
import { useAudioSpectrum } from '@/hooks/use-audio-spectrum';

export default function AnalyzerScreen() {
  const { width } = useWindowDimensions();
  const { bars, level, detected, status, error, start, stop } = useAudioSpectrum(80);
  const isListening = status === 'listening';

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: withTiming(detected.value ? 1 : 0.3),
  }));

  const levelStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, level.value * 140)}%`,
  }));

  return (
    <View style={styles.container}>
      <TopBar title="Analyzer" />

      <View style={styles.body}>
        <EWText variant="labelSm" color={EW.outlineVariant}>
          Real-time frequency spectrum
        </EWText>

        <GlassView style={styles.stage} radius={EWRadius.xl}>
          <AudioSpectrum bars={bars} width={width - EWSpacing.screen * 2 - 2} height={260} />
        </GlassView>

        <GlassView style={styles.meter}>
          <View style={styles.meterRow}>
            <Animated.View style={[styles.detectedDot, dotStyle]} />
            <EWText variant="labelSm" color={EW.onSurfaceVariant}>
              {isListening ? 'Listening — speech or music' : 'Idle'}
            </EWText>
          </View>
          <View style={styles.levelTrack}>
            <Animated.View style={[styles.levelFill, levelStyle]} />
          </View>
        </GlassView>

        {error ? (
          <EWText variant="labelSm" color={EW.error}>
            {error}
          </EWText>
        ) : null}

        <Pressable
          onPress={isListening ? stop : start}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: isListening ? EW.surfaceContainerHigh : EW.primaryContainer },
            !isListening && cyanGlow(24, 0.4),
            pressed && styles.pressed,
          ]}>
          <EWIcon
            name={isListening ? 'stop' : 'graphic-eq'}
            color={isListening ? EW.onSurface : EW.onPrimaryContainer}
          />
          <EWText color={isListening ? EW.onSurface : EW.onPrimaryContainer}>
            {isListening ? 'Stop' : 'Start analyzing'}
          </EWText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EW.bg,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: EWSpacing.gutter,
    paddingHorizontal: EWSpacing.screen,
    paddingBottom: 110,
  },
  stage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: EWSpacing.stackMd,
  },
  meter: {
    width: '100%',
    padding: EWSpacing.stackMd,
    gap: EWSpacing.stackSm,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EWSpacing.stackSm,
  },
  detectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: EW.primaryContainer,
  },
  levelTrack: {
    height: 6,
    borderRadius: EWRadius.full,
    backgroundColor: EW.surfaceContainerHighest,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    backgroundColor: EW.primaryContainer,
    borderRadius: EWRadius.full,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EWSpacing.stackSm,
    paddingHorizontal: EWSpacing.stackLg,
    paddingVertical: EWSpacing.stackMd,
    borderRadius: EWRadius.full,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});
