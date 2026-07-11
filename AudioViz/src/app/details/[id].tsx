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

export default function DetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecording, renameRecording, removeRecording, toggleFavorite } = useRecordings();
  const recording = getRecording(id ?? '');

  const player = useAudioPlayer(recording?.uri, recording?.durationSec ?? 0);
  const [renaming, setRenaming] = useState(false);

  if (!recording) {
    return (
      <View style={styles.container}>
        <TopBar variant="back" title="Not found" showSettings={false} />
        <View style={styles.center}>
          <EWText color={EW.onSurfaceVariant}>This recording no longer exists.</EWText>
        </View>
      </View>
    );
  }

  const total = player.duration || recording.durationSec;
  const progress = total > 0 ? Math.min(1, player.position / total) : 0;

  const onShare = async () => {
    try {
      await Share.share({ url: recording.uri, message: recording.title });
    } catch {
      // dismissed / unavailable
    }
  };

  const onDelete = () => {
    removeRecording(recording.id);
    router.back();
  };

  return (
    <View style={styles.container}>
      <TopBar variant="back" title="Details" showSettings={false} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + EWSpacing.stackLg }]}
        showsVerticalScrollIndicator={false}>
        <GlassView style={styles.hero}>
          <MiniWaveform data={recording.waveform} height={130} animated={player.isPlaying} />
          <View style={styles.seekBlock}>
            <View style={styles.seekTrack}>
              <View style={[styles.seekFill, { width: `${progress * 100}%` }]} />
              <View style={[styles.seekHandle, { left: `${progress * 100}%` }]} />
            </View>
            <View style={styles.seekTimes}>
              <EWText variant="labelSm" color={EW.onSurfaceVariant} mono>
                {fmtDuration(player.position)}
              </EWText>
              <EWText variant="labelSm" color={EW.onSurfaceVariant} mono>
                {fmtDuration(total)}
              </EWText>
            </View>
          </View>
        </GlassView>

        <View style={styles.transport}>
          <IconButton icon="replay-10" onPress={() => player.skip(-10)} />
          <Pressable
            onPress={() => player.toggle()}
            style={({ pressed }) => [styles.playBtn, pressed && styles.pressed]}>
            <EWIcon
              name={player.isPlaying ? 'pause' : 'play-arrow'}
              size={44}
              color={EW.onPrimaryContainer}
            />
          </Pressable>
          <IconButton icon="forward-10" onPress={() => player.skip(10)} />
        </View>

        {player.error ? (
          <EWText variant="labelSm" color={EW.error} style={styles.errorText}>
            {player.error}
          </EWText>
        ) : null}

        <GlassView style={styles.metaCard}>
          <EWText variant="headlineMd" color={EW.onSurface}>
            {recording.title}
          </EWText>
          <View style={styles.metaGrid}>
            <MetaCell label="Date" value={recording.date} />
            <MetaCell label="Duration" value={fmtDuration(total)} />
            <MetaCell label="Size" value={recording.size} />
            <MetaCell label="Format" value={recording.format} />
          </View>
        </GlassView>

        <View style={styles.actionList}>
          <ActionRow icon="edit" label="Rename" onPress={() => setRenaming(true)} />
          <ActionRow
            icon={recording.favorite ? 'favorite' : 'favorite-border'}
            label={recording.favorite ? 'Remove Favorite' : 'Add to Favorites'}
            onPress={() => toggleFavorite(recording.id)}
          />
          <ActionRow icon="share" label="Share File" onPress={onShare} />
          <ActionRow icon="auto-awesome" label="Generate Transcript" badge="Coming Soon" />
        </View>

        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}>
          <EWIcon name="delete" color={EW.error} />
          <EWText color={EW.error}>Delete Recording</EWText>
        </Pressable>
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

function IconButton({ icon, onPress }: { icon: EWIconName; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.transportBtn, pressed && styles.pressed]}>
      <EWIcon name={icon} size={32} color={EW.onSurfaceVariant} />
    </Pressable>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaCell}>
      <EWText variant="labelSm" color={EW.onSurfaceVariant}>
        {label}
      </EWText>
      <EWText color={EW.onSurface} mono>
        {value}
      </EWText>
    </View>
  );
}

function ActionRow({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: EWIconName;
  label: string;
  badge?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}>
      <View style={styles.actionLeft}>
        <EWIcon name={icon} size={22} color={EW.primaryContainer} />
        <EWText color={EW.onSurface}>{label}</EWText>
      </View>
      {badge ? (
        <View style={styles.badge}>
          <EWText variant="labelSm" color={EW.onSurfaceVariant}>
            {badge}
          </EWText>
        </View>
      ) : (
        <EWIcon name="chevron-right" size={20} color={EW.onSurfaceVariant} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: EW.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: EWSpacing.screen, gap: EWSpacing.gutter },
  hero: { padding: EWSpacing.stackLg, gap: EWSpacing.stackLg, minHeight: 220, justifyContent: 'center' },
  seekBlock: { gap: EWSpacing.stackSm },
  seekTrack: {
    height: 4,
    borderRadius: EWRadius.full,
    backgroundColor: EW.outlineVariant,
    justifyContent: 'center',
  },
  seekFill: {
    height: 4,
    borderRadius: EWRadius.full,
    backgroundColor: EW.primaryContainer,
    ...cyanGlow(10, 0.4),
  },
  seekHandle: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    backgroundColor: EW.primaryContainer,
  },
  seekTimes: { flexDirection: 'row', justifyContent: 'space-between' },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: EWSpacing.stackLg,
  },
  transportBtn: { padding: EWSpacing.stackSm },
  playBtn: {
    width: 88,
    height: 88,
    borderRadius: EWRadius.full,
    backgroundColor: EW.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...cyanGlow(28, 0.4),
  },
  errorText: { textAlign: 'center' },
  metaCard: { padding: EWSpacing.stackLg, gap: EWSpacing.stackMd },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: EWSpacing.stackLg },
  metaCell: { gap: 4, minWidth: '25%' },
  actionList: { gap: EWSpacing.stackSm },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: EWSpacing.stackMd,
    borderRadius: EWRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EW.glassBorder,
    backgroundColor: EW.surfaceContainerLow,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: EWSpacing.stackMd },
  badge: {
    paddingHorizontal: EWSpacing.stackSm,
    paddingVertical: 2,
    borderRadius: EWRadius.full,
    backgroundColor: EW.surfaceContainerHigh,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: EWSpacing.stackSm,
    padding: EWSpacing.stackMd,
    borderRadius: EWRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,180,171,0.3)',
    backgroundColor: 'rgba(255,180,171,0.05)',
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
