import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassView } from '@/components/ew/glass';
import { EWIcon, type EWIconName } from '@/components/ew/icon';
import { TopBar } from '@/components/ew/top-bar';
import { EWText } from '@/components/ew/typography';
import { EW, EWRadius, EWSpacing } from '@/constants/echowave-theme';

const THEMES = ['Dark', 'Light', 'System'];
const QUALITIES = [
  { label: 'LOW', sub: '128 kbps' },
  { label: 'MEDIUM', sub: '256 kbps' },
  { label: 'HIGH', sub: '512 kbps' },
];
const FORMATS = [
  { key: 'MP3', title: 'Compressed', sub: 'Universal, small file size' },
  { key: 'WAV', title: 'Lossless', sub: 'Best for editing & production' },
  { key: 'AAC', title: 'High Efficiency', sub: 'Better than MP3 at same bitrate' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [theme, setTheme] = useState('Dark');
  const [quality, setQuality] = useState(1);
  const [format, setFormat] = useState('WAV');
  const [autoGain, setAutoGain] = useState(true);
  const [noise, setNoise] = useState(true);

  return (
    <View style={styles.container}>
      <TopBar variant="back" title="Settings" showSettings={false} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + EWSpacing.stackLg }]}
        showsVerticalScrollIndicator={false}>
        <Section icon="palette" title="Appearance">
          <View style={styles.segment}>
            {THEMES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setTheme(t)}
                style={[styles.segmentBtn, theme === t && styles.segmentActive]}>
                <EWText
                  variant="labelSm"
                  color={theme === t ? EW.onPrimaryContainer : EW.onSurfaceVariant}>
                  {t}
                </EWText>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section icon="graphic-eq" title="Recording Quality">
          <View style={styles.qualityRow}>
            {QUALITIES.map((q, i) => (
              <Pressable
                key={q.label}
                onPress={() => setQuality(i)}
                style={[styles.qualityBtn, quality === i && styles.qualityActive]}>
                <EWText
                  variant="labelSm"
                  color={quality === i ? EW.primaryContainer : EW.onSurfaceVariant}>
                  {q.label}
                </EWText>
                <EWText variant="labelSm" color={EW.outline}>
                  {q.sub}
                </EWText>
              </Pressable>
            ))}
          </View>
          <ToggleRow label="Auto-Gain Control" value={autoGain} onChange={setAutoGain} />
          <ToggleRow label="Noise Suppression" value={noise} onChange={setNoise} />
        </Section>

        <Section icon="audio-file" title="Audio Format">
          <GlassView style={styles.formatCard}>
            {FORMATS.map((f, i) => (
              <Pressable
                key={f.key}
                onPress={() => setFormat(f.key)}
                style={[styles.formatRow, i < FORMATS.length - 1 && styles.formatDivider]}>
                <View style={styles.formatBadge}>
                  <EWText variant="labelSm" color={EW.primaryContainer}>
                    {f.key}
                  </EWText>
                </View>
                <View style={styles.formatText}>
                  <EWText color={EW.onSurface}>{f.title}</EWText>
                  <EWText variant="labelSm" color={EW.onSurfaceVariant}>
                    {f.sub}
                  </EWText>
                </View>
                <EWIcon
                  name={format === f.key ? 'check-circle' : 'radio-button-unchecked'}
                  color={format === f.key ? EW.primaryContainer : EW.outline}
                />
              </Pressable>
            ))}
          </GlassView>
        </Section>

        <Section icon="tune" title="Additional">
          <GlassView style={styles.formatCard}>
            <LinkRow icon="sd-storage" label="Storage Location" value="Device" divider />
            <LinkRow icon="lock" label="Privacy" divider />
            <LinkRow icon="info-outline" label="About" divider />
            <LinkRow icon="verified-user" label="App Version" value="4.8.2" />
          </GlassView>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: EWIconName;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <EWIcon name={icon} size={20} color={EW.primaryContainer} />
        <EWText variant="headlineMd" color={EW.onSurface}>
          {title}
        </EWText>
      </View>
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <EWText color={EW.onSurface}>{label}</EWText>
      <Switch value={value} onChange={() => onChange(!value)} />
    </View>
  );
}

function Switch({ value, onChange }: { value: boolean; onChange: () => void }) {
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(value ? 20 : 0) }],
  }));
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(value ? EW.primaryContainer : EW.surfaceContainerHighest),
  }));

  return (
    <Pressable onPress={onChange}>
      <Animated.View style={[styles.switchTrack, trackStyle]}>
        <Animated.View
          style={[styles.switchKnob, { backgroundColor: value ? EW.onPrimary : EW.onSurface }, knobStyle]}
        />
      </Animated.View>
    </Pressable>
  );
}

function LinkRow({
  icon,
  label,
  value,
  divider,
}: {
  icon: EWIconName;
  label: string;
  value?: string;
  divider?: boolean;
}) {
  return (
    <Pressable style={[styles.linkRow, divider && styles.formatDivider]}>
      <View style={styles.actionLeft}>
        <EWIcon name={icon} size={20} color={EW.onSurfaceVariant} />
        <EWText color={EW.onSurface}>{label}</EWText>
      </View>
      {value ? (
        <EWText variant="labelSm" color={EW.onSurfaceVariant} mono>
          {value}
        </EWText>
      ) : (
        <EWIcon name="chevron-right" size={20} color={EW.onSurfaceVariant} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: EW.bg },
  content: { padding: EWSpacing.screen, gap: EWSpacing.gutter },
  section: { gap: EWSpacing.stackMd },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: EWSpacing.stackSm },
  segment: {
    flexDirection: 'row',
    backgroundColor: EW.surfaceContainerLow,
    borderRadius: EWRadius.full,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EW.glassBorder,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: EWSpacing.stackSm + 2,
    borderRadius: EWRadius.full,
  },
  segmentActive: { backgroundColor: EW.primaryContainer },
  qualityRow: { flexDirection: 'row', gap: EWSpacing.stackSm },
  qualityBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: EWSpacing.stackMd,
    borderRadius: EWRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EW.glassBorder,
    backgroundColor: EW.surfaceContainerLow,
  },
  qualityActive: {
    borderColor: EW.primaryContainer,
    borderWidth: 1.5,
    backgroundColor: 'rgba(0,242,255,0.08)',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: EWSpacing.stackSm,
  },
  switchTrack: {
    width: 52,
    height: 32,
    borderRadius: 100,
    padding: 4,
    justifyContent: 'center',
  },
  switchKnob: { width: 24, height: 24, borderRadius: 12 },
  formatCard: { overflow: 'hidden' },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EWSpacing.stackMd,
    padding: EWSpacing.stackMd,
  },
  formatDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: EW.hairline },
  formatBadge: {
    width: 44,
    height: 44,
    borderRadius: EWRadius.lg,
    backgroundColor: EW.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatText: { flex: 1, gap: 2 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: EWSpacing.stackMd,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: EWSpacing.stackMd },
});
