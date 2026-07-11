import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AudioManager } from 'react-native-audio-api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassView } from '@/components/ew/glass';
import { EWIcon } from '@/components/ew/icon';
import { EWText } from '@/components/ew/typography';
import { EW, EWRadius, EWSpacing, cyanGlow } from '@/constants/echowave-theme';

export default function PermissionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [requesting, setRequesting] = useState(false);
  const [denied, setDenied] = useState(false);

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.15 }],
    opacity: 0.2 + pulse.value * 0.3,
  }));

  const onGrant = async () => {
    setRequesting(true);
    setDenied(false);
    try {
      const status = await AudioManager.requestRecordingPermissions();
      if (status === 'Granted') {
        router.replace('/');
      } else {
        setDenied(true);
      }
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.glow} pointerEvents="none" />

      <View style={styles.body}>
        <GlassView style={styles.panel}>
          <View style={styles.illustration}>
            <Animated.View style={[styles.ring, ringStyle]} />
            <View style={styles.micCircle}>
              <EWIcon name="mic" size={56} color={EW.primaryContainer} />
            </View>
          </View>

          <View style={styles.textBlock}>
            <EWText variant="headlineMd" color={EW.onSurface}>
              Voice Activation
            </EWText>
            <EWText color={EW.onSurfaceVariant} style={styles.subtitle}>
              We need microphone access to record audio.
            </EWText>
            {denied ? (
              <EWText variant="labelSm" color={EW.error} style={styles.subtitle}>
                Permission denied. Enable microphone access in Settings.
              </EWText>
            ) : null}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onGrant}
              disabled={requesting}
              style={({ pressed }) => [styles.grantBtn, pressed && styles.pressed]}>
              <EWText color={EW.onPrimaryContainer}>
                {requesting ? 'Requesting…' : 'Grant Permission'}
              </EWText>
            </Pressable>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.laterBtn, pressed && styles.pressed]}>
              <EWText color={EW.onSurfaceVariant}>Maybe Later</EWText>
            </Pressable>
          </View>
        </GlassView>
      </View>

      <View style={[styles.footer, { bottom: insets.bottom + EWSpacing.stackLg }]}>
        <EWText variant="displayLgMobile" color={EW.primaryContainer}>
          EchoWave
        </EWText>
        <View style={styles.footerRow}>
          <EWIcon name="verified-user" size={14} color={EW.onSurfaceVariant} />
          <EWText variant="labelSm" color={EW.onSurfaceVariant}>
            Secure Audio Engine
          </EWText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: EW.bg, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 400,
    backgroundColor: 'rgba(0,242,255,0.05)',
  },
  body: { width: '100%', paddingHorizontal: EWSpacing.screen, maxWidth: 440 },
  panel: {
    padding: EWSpacing.stackLg,
    alignItems: 'center',
    gap: EWSpacing.stackLg,
    ...cyanGlow(40, 0.1),
  },
  illustration: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: EWRadius.full,
    backgroundColor: 'rgba(0,242,255,0.1)',
  },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: EWRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EW.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: 'rgba(0,242,255,0.3)',
  },
  textBlock: { alignItems: 'center', gap: EWSpacing.stackSm },
  subtitle: { textAlign: 'center', maxWidth: 280 },
  actions: { width: '100%', gap: EWSpacing.stackMd },
  grantBtn: {
    width: '100%',
    paddingVertical: EWSpacing.stackMd,
    borderRadius: EWRadius.lg,
    backgroundColor: EW.primaryContainer,
    alignItems: 'center',
    ...cyanGlow(20, 0.3),
  },
  laterBtn: { width: '100%', paddingVertical: EWSpacing.stackSm, alignItems: 'center' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  footer: { position: 'absolute', alignItems: 'center', gap: 4, opacity: 0.5 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
