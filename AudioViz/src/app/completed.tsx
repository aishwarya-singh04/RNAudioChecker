import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassView } from '@/components/ew/glass';
import { EWIcon, type EWIconName } from '@/components/ew/icon';
import { MiniWaveform } from '@/components/ew/mini-waveform';
import { RenameDialog } from '@/components/ew/rename-dialog';
import { TopBar } from '@/components/ew/top-bar';
import { EWText } from '@/components/ew/typography';
import { EW, EWRadius, EWSpacing, cyanGlow } from '@/constants/echowave-theme';
import { fmtDuration } from '@/data/recordings';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useRecordings } from '@/store/recordings-store';

export default function CompletedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getRecording, renameRecording, removeRecording } = useRecordings();
  const recording = getRecording(id ?? '');

  const player = useAudioPlayer(recording?.uri, recording?.durationSec ?? 0);
  const [renaming, setRenaming] = useState(false);

  if (!recording) {
    return (
      <View style={styles.container}>
        <TopBar variant="back" title="Recording Saved" showSettings={false} />
        <View style={styles.center}>
          <EWText color={EW.onSurfaceVariant}>This recording is no longer available.</EWText>
          <Pressable onPress={() => router.replace('/')} style={styles.linkBtn}>
            <EWText color={EW.primaryContainer}>Back to Home</EWText>
          </Pressable>
        </View>
      </View>
    );
  }

  const onShare = async () => {
    try {
      await Share.share({ url: recording.uri, message: recording.title });
    } catch {
      // user dismissed / unavailable
    }
  };

  const onDelete = () => {
    removeRecording(recording.id);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <TopBar variant="back" title="Recording Saved" showSettings={false} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + EWSpacing.stackLg }]}
        showsVerticalScrollIndicator={false}>
        <GlassView style={styles.hero}>
          <View style={styles.savedBadge}>
            <EWIcon name="check-circle" size={16} color={EW.primaryContainer} />
            <EWText variant="labelSm" color={EW.primaryContainer}>
              Saved
            </EWText>
          </View>
          <MiniWaveform data={recording.waveform} height={140} animated={player.isPlaying} />
        </GlassView>

        <View style={styles.titleBlock}>
          <EWText variant="headlineMd" color={EW.onSurface}>
            {recording.title}
          </EWText>
          <EWText variant="labelSm" color={EW.onSurfaceVariant} mono>
            {recording.date}
          </EWText>
        </View>

        <GlassView style={styles.metaCard}>
          <MetaItem
            label="Duration"
            value={fmtDuration(player.duration || recording.durationSec)}
          />
          <View style={styles.metaDivider} />
          <MetaItem label="Size" value={recording.size} />
          <View style={styles.metaDivider} />
          <MetaItem label="Format" value={recording.format} />
        </GlassView>

        <Pressable
          onPress={() => player.toggle()}
          style={({ pressed }) => [styles.playCta, pressed && styles.pressed]}>
          <EWIcon
            name={player.isPlaying ? 'pause' : 'play-arrow'}
            size={32}
            color={EW.onPrimaryContainer}
          />
          <EWText color={EW.onPrimaryContainer}>
            {player.isLoading ? 'Loading…' : player.isPlaying ? 'Pause' : 'Play'}
          </EWText>
        </Pressable>

        {player.error ? (
          <EWText variant="labelSm" color={EW.error} style={styles.errorText}>
            {player.error}
          </EWText>
        ) : null}

        <View style={styles.actionsGrid}>
          <ActionButton icon="edit" label="Rename" onPress={() => setRenaming(true)} />
          <ActionButton icon="folder" label="Done" onPress={() => router.replace('/library')} />
          <ActionButton icon="share" label="Share" onPress={onShare} />
          <ActionButton icon="delete" label="Delete" tone="danger" onPress={onDelete} />
        </View>
      </ScrollView>

      <RenameDialog
        visible={renaming}
        initialValue={recording.title}
        onCancel={() => setRenaming(false)}
        onSubmit={(name) => {
          renameRecording(recording.id, name);
          setRenaming(false);
        }}
      />
    </View>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <EWText variant="labelSm" color={EW.onSurfaceVariant}>
        {label}
      </EWText>
      <EWText color={EW.onSurface} mono>
        {value}
      </EWText>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  tone = 'neutral',
}: {
  icon: EWIconName;
  label: string;
  onPress: () => void;
  tone?: 'neutral' | 'danger';
}) {
  const color = tone === 'danger' ? EW.error : EW.primaryContainer;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <EWIcon name={icon} color={color} />
      <EWText variant="labelSm" color={tone === 'danger' ? EW.error : EW.onSurface}>
        {label}
      </EWText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EW.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: EWSpacing.stackMd,
  },
  linkBtn: {
    padding: EWSpacing.stackSm,
  },
  content: {
    padding: EWSpacing.screen,
    gap: EWSpacing.gutter,
  },
  hero: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    padding: EWSpacing.stackLg,
  },
  savedBadge: {
    position: 'absolute',
    top: EWSpacing.stackMd,
    left: EWSpacing.stackMd,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: EWSpacing.stackSm,
    paddingVertical: 4,
    borderRadius: EWRadius.full,
    backgroundColor: 'rgba(0,242,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,242,255,0.2)',
  },
  titleBlock: {
    gap: 4,
    alignItems: 'center',
  },
  metaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: EWSpacing.stackLg,
  },
  metaItem: {
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: EW.glassBorder,
  },
  playCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: EWSpacing.stackSm,
    backgroundColor: EW.primaryContainer,
    paddingVertical: EWSpacing.stackMd,
    borderRadius: EWRadius.full,
    ...cyanGlow(28, 0.4),
  },
  errorText: {
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: EWSpacing.stackSm,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: EWSpacing.stackSm,
    paddingVertical: EWSpacing.stackMd,
    borderRadius: EWRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EW.glassBorder,
    backgroundColor: EW.surfaceContainerLow,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});
