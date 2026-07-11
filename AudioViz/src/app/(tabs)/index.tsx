import { File } from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AudioSpectrum } from '@/components/audio-spectrum';
import { EWIcon, type EWIconName } from '@/components/ew/icon';
import { TopBar } from '@/components/ew/top-bar';
import { EWText } from '@/components/ew/typography';
import { EW, EWRadius, EWSpacing, cyanGlow } from '@/constants/echowave-theme';
import { useAudioSpectrum } from '@/hooks/use-audio-spectrum';
import { useRecordings } from '@/store/recordings-store';

const CYAN_GRADIENT = ['#00696f', '#00dbe7', '#00f2ff', '#74f5ff', '#00f2ff', '#00dbe7', '#00696f'];

function formatTimer(totalSec: number): string {
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { addRecording } = useRecordings();
  const { bars, status, error, start, stop, pause, resume } = useAudioSpectrum(56, {
    record: true,
  });

  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savingRef = useRef(false);

  const isPaused = status === 'paused';
  const isActive = status === 'listening' || status === 'starting' || status === 'paused';

  useEffect(() => {
    if (status === 'listening') {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  const onStart = () => {
    if (isActive) return;
    setSeconds(0);
    savingRef.current = false;
    start();
  };

  const onStop = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    const result = await stop();
    setSeconds(0);
    if (result?.uri) {
      const rec = addRecording({
        uri: result.uri,
        durationSec: result.durationSec || seconds,
        sizeMb: result.sizeMb,
        waveform: result.waveform,
        format: 'M4A',
      });
      router.push(`/completed?id=${rec.id}`);
    }
    savingRef.current = false;
  };

  const onDiscard = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    const result = await stop();
    setSeconds(0);
    if (result?.uri) {
      try {
        const file = new File(result.uri);
        if (file.exists) file.delete();
      } catch {
        // best-effort cleanup
      }
    }
    savingRef.current = false;
  };

  const spectrumWidth = width - EWSpacing.screen * 2;

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.atmosphere} pointerEvents="none">
        <View style={[styles.glowBlob, isActive && styles.glowBlobActive]} />
      </View>

      <View style={styles.center}>
        {isActive ? (
          <View style={styles.recordingHud}>
            <StatusPill paused={isPaused} />
            <EWText color={EW.primaryContainer} style={styles.timer}>
              {formatTimer(seconds)}
            </EWText>
            <EWText variant="labelSm" color={EW.onSurfaceVariant} mono>
              48kHz · M4A
            </EWText>
          </View>
        ) : (
          <View style={styles.micWrap}>
            <RippleRing delay={0} />
            <RippleRing delay={1500} />
            <Pressable
              onPress={onStart}
              style={({ pressed }) => [styles.micButton, pressed && styles.micPressed]}>
              <EWIcon name="mic" size={64} color={EW.onPrimaryContainer} />
            </Pressable>
          </View>
        )}

        {!isActive ? (
          <View style={styles.labels}>
            <EWText variant="headlineMd" color={EW.onSurface}>
              Tap to Record
            </EWText>
            <EWText color={EW.onSurfaceVariant}>Record speech or music</EWText>
          </View>
        ) : null}

        {error ? (
          <EWText variant="labelSm" color={EW.error} style={styles.error}>
            {error}
          </EWText>
        ) : null}
      </View>

      {isActive ? (
        <View style={styles.controls}>
          <ControlButton icon="delete" label="Discard" tone="danger" onPress={onDiscard} />
          <ControlButton icon="stop" label="Stop & Save" tone="primary" large onPress={onStop} />
          <ControlButton
            icon={isPaused ? 'play-arrow' : 'pause'}
            label={isPaused ? 'Resume' : 'Pause'}
            tone="neutral"
            onPress={isPaused ? resume : pause}
          />
        </View>
      ) : null}

      <View style={styles.waveformSection}>
        <AudioSpectrum
          bars={bars}
          width={spectrumWidth}
          height={96}
          colors={CYAN_GRADIENT}
          gap={2}
        />
        <View style={styles.techOverlay}>
          <EWText variant="labelSm" color={EW.onSurfaceVariant} mono>
            {formatTimer(seconds)}
          </EWText>
          <EWText variant="labelSm" color={isActive ? EW.primaryContainer : EW.onSurfaceVariant} mono>
            {isActive ? (isPaused ? 'Paused' : 'Listening…') : 'Ready to capture'}
          </EWText>
          <EWText variant="labelSm" color={EW.onSurfaceVariant} mono>
            PCM 48kHz
          </EWText>
        </View>
      </View>
    </View>
  );
}

function StatusPill({ paused }: { paused: boolean }) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = paused ? 1 : withRepeat(withTiming(0.3, { duration: 900 }), -1, true);
  }, [paused, pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View style={styles.statusPill}>
      <Animated.View style={[styles.statusDot, dotStyle]} />
      <EWText variant="labelSm" color={EW.onSurfaceVariant}>
        {paused ? 'Paused' : 'Recording…'}
      </EWText>
    </View>
  );
}

function ControlButton({
  icon,
  label,
  onPress,
  tone,
  large,
}: {
  icon: EWIconName;
  label: string;
  onPress: () => void;
  tone: 'primary' | 'neutral' | 'danger';
  large?: boolean;
}) {
  const size = large ? 80 : 56;
  const bg =
    tone === 'primary'
      ? EW.primaryContainer
      : tone === 'danger'
        ? 'rgba(255,180,171,0.08)'
        : EW.surfaceContainerHigh;
  const iconColor =
    tone === 'primary' ? EW.onPrimaryContainer : tone === 'danger' ? EW.error : EW.onSurfaceVariant;

  return (
    <View style={styles.controlItem}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.controlBtn,
          { width: size, height: size, backgroundColor: bg },
          tone === 'primary' && cyanGlow(30, 0.4),
          tone !== 'primary' && styles.controlBtnBordered,
          pressed && styles.controlPressed,
        ]}>
        <EWIcon name={icon} size={large ? 36 : 24} color={iconColor} />
      </Pressable>
      <EWText
        variant="labelSm"
        color={tone === 'primary' ? EW.primaryContainer : EW.outlineVariant}>
        {label}
      </EWText>
    </View>
  );
}

function RippleRing({ delay }: { delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 3000, easing: Easing.out(Easing.cubic) }), -1, false)
    );
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.8 }],
    opacity: 0.4 * (1 - progress.value),
  }));

  return <Animated.View style={[styles.ring, style]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EW.bg,
  },
  atmosphere: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBlob: {
    width: 360,
    height: 360,
    borderRadius: 360,
    backgroundColor: 'rgba(0,242,255,0.06)',
  },
  glowBlobActive: {
    backgroundColor: 'rgba(0,242,255,0.12)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: EWSpacing.stackLg,
  },
  micWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: EWRadius.full,
    borderWidth: 2,
    borderColor: 'rgba(0,242,255,0.4)',
  },
  micButton: {
    width: 160,
    height: 160,
    borderRadius: EWRadius.full,
    backgroundColor: EW.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...cyanGlow(50, 0.35),
  },
  micPressed: {
    transform: [{ scale: 0.92 }],
  },
  labels: {
    alignItems: 'center',
    gap: EWSpacing.stackSm,
  },
  recordingHud: {
    alignItems: 'center',
    gap: EWSpacing.stackMd,
  },
  timer: {
    fontSize: 76,
    lineHeight: 82,
    fontWeight: '700',
    letterSpacing: -2,
    textShadowColor: 'rgba(0,242,255,0.4)',
    textShadowRadius: 30,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EWSpacing.stackSm,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: EWSpacing.stackMd,
    paddingVertical: 6,
    borderRadius: EWRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EW.hairline,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: EW.error,
  },
  error: {
    textAlign: 'center',
    paddingHorizontal: EWSpacing.screen,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: EWSpacing.stackLg + 8,
    paddingBottom: EWSpacing.stackLg,
  },
  controlItem: {
    alignItems: 'center',
    gap: EWSpacing.stackSm,
  },
  controlBtn: {
    borderRadius: EWRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnBordered: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EW.glassBorder,
  },
  controlPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.85,
  },
  waveformSection: {
    paddingHorizontal: EWSpacing.screen,
    paddingBottom: 140,
    gap: EWSpacing.stackMd,
  },
  techOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: EWSpacing.stackSm,
    paddingTop: EWSpacing.stackMd,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: EW.hairline,
  },
});
