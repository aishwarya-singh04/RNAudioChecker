import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassView } from '@/components/ew/glass';
import { EWIcon, type EWIconName } from '@/components/ew/icon';
import { MiniWaveform } from '@/components/ew/mini-waveform';
import { TopBar } from '@/components/ew/top-bar';
import { EWText } from '@/components/ew/typography';
import { EW, EWRadius, EWSpacing } from '@/constants/echowave-theme';
import { type Recording } from '@/data/recordings';
import { useRecordings } from '@/store/recordings-store';

type SortKey = 'newest' | 'oldest' | 'longest' | 'shortest' | 'az';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'longest', label: 'Longest' },
  { key: 'shortest', label: 'Shortest' },
  { key: 'az', label: 'A–Z' },
];

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recordings, toggleFavorite, removeRecording } = useRecordings();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [favOnly, setFavOnly] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = recordings.filter(
      (r) => !q || r.title.toLowerCase().includes(q) || r.date.toLowerCase().includes(q)
    );
    if (favOnly) list = list.filter((r) => r.favorite);
    const sorted = [...list];
    switch (sort) {
      case 'newest':
        sorted.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        sorted.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'longest':
        sorted.sort((a, b) => b.durationSec - a.durationSec);
        break;
      case 'shortest':
        sorted.sort((a, b) => a.durationSec - b.durationSec);
        break;
      case 'az':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return sorted;
  }, [recordings, query, sort, favOnly]);

  const toggleFav = (id: string) => toggleFavorite(id);
  const remove = (id: string) => removeRecording(id);

  return (
    <View style={styles.container}>
      <TopBar title="EchoWave" />

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <EWIcon name="search" size={20} color={EW.outlineVariant} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search recordings..."
            placeholderTextColor={EW.outlineVariant}
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          <Chip
            label="Favorites"
            icon="favorite"
            active={favOnly}
            onPress={() => setFavOnly((v) => !v)}
          />
          {SORTS.map((s) => (
            <Chip
              key={s.key}
              label={s.label}
              active={sort === s.key}
              onPress={() => setSort(s.key)}
            />
          ))}
        </ScrollView>
      </View>

      {visible.length === 0 ? (
        <EmptyState onRecord={() => router.navigate('/')} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 110 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RecordingCard
              recording={item}
              onPress={() => router.push(`/details/${item.id}`)}
              onFavorite={() => toggleFav(item.id)}
              onDelete={() => remove(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

function Chip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: EWIconName;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}>
      {icon ? (
        <EWIcon
          name={icon}
          size={14}
          color={active ? EW.onPrimaryContainer : EW.onSurfaceVariant}
        />
      ) : null}
      <EWText variant="labelSm" color={active ? EW.onPrimaryContainer : EW.onSurfaceVariant}>
        {label}
      </EWText>
    </Pressable>
  );
}

function RecordingCard({
  recording,
  onPress,
  onFavorite,
  onDelete,
}: {
  recording: Recording;
  onPress: () => void;
  onFavorite: () => void;
  onDelete: () => void;
}) {
  const onShare = async () => {
    try {
      await Share.share({ url: recording.uri, message: recording.title });
    } catch {
      // dismissed / unavailable
    }
  };

  const renderRightActions = () => (
    <View style={styles.swipeActions}>
      <SwipeAction icon="favorite" tone="primary" onPress={onFavorite} />
      <SwipeAction icon="share" tone="neutral" onPress={onShare} />
      <SwipeAction icon="delete" tone="danger" onPress={onDelete} />
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.cardPressed}>
        <GlassView style={styles.card}>
          <View style={styles.thumb}>
            <MiniWaveform data={recording.waveform.slice(0, 10)} height={40} animated />
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <EWText color={EW.onSurface} numberOfLines={1} style={styles.cardTitle}>
                {recording.title}
              </EWText>
              {recording.favorite ? (
                <EWIcon name="favorite" size={14} color={EW.primaryContainer} />
              ) : null}
            </View>
            <View style={styles.metaRow}>
              <Meta icon="calendar-today" text={recording.date} />
              <Meta icon="timer" text={recording.duration} />
              <EWText variant="labelSm" color={EW.outlineVariant} mono>
                {recording.size}
              </EWText>
            </View>
          </View>

          <Pressable
            onPress={onPress}
            hitSlop={8}
            style={({ pressed }) => [styles.playBtn, pressed && styles.cardPressed]}>
            <EWIcon name="play-arrow" size={22} color={EW.primaryContainer} />
          </Pressable>
        </GlassView>
      </Pressable>
    </Swipeable>
  );
}

function Meta({ icon, text }: { icon: EWIconName; text: string }) {
  return (
    <View style={styles.meta}>
      <EWIcon name={icon} size={13} color={EW.onSurfaceVariant} />
      <EWText variant="labelSm" color={EW.onSurfaceVariant}>
        {text}
      </EWText>
    </View>
  );
}

function SwipeAction({
  icon,
  tone,
  onPress,
}: {
  icon: EWIconName;
  tone: 'primary' | 'neutral' | 'danger';
  onPress: () => void;
}) {
  const color = tone === 'danger' ? EW.error : tone === 'primary' ? EW.primaryContainer : EW.onSurface;
  return (
    <Pressable onPress={onPress} style={styles.swipeBtn}>
      <EWIcon name={icon} color={color} />
    </Pressable>
  );
}

function EmptyState({ onRecord }: { onRecord: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIllustration}>
        <EWIcon name="graphic-eq" size={64} color={EW.primaryContainer} />
      </View>
      <EWText variant="headlineMd" color={EW.onSurface}>
        No recordings yet
      </EWText>
      <EWText color={EW.onSurfaceVariant} style={styles.emptyText}>
        Your captured audio will appear here.
      </EWText>
      <Pressable onPress={onRecord} style={({ pressed }) => [styles.emptyCta, pressed && styles.cardPressed]}>
        <EWIcon name="mic" color={EW.onPrimaryContainer} />
        <EWText color={EW.onPrimaryContainer}>Start Recording</EWText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EW.bg,
  },
  searchWrap: {
    paddingHorizontal: EWSpacing.screen,
    paddingTop: EWSpacing.stackMd,
    gap: EWSpacing.stackMd,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EWSpacing.stackSm,
    backgroundColor: EW.surfaceContainerLow,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EW.glassBorder,
    borderRadius: EWRadius.xl,
    paddingHorizontal: EWSpacing.stackMd,
    height: 52,
  },
  searchInput: {
    flex: 1,
    color: EW.onSurface,
    fontSize: 16,
  },
  chips: {
    gap: EWSpacing.stackSm,
    paddingRight: EWSpacing.screen,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: EWSpacing.stackMd,
    paddingVertical: 8,
    borderRadius: EWRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EW.glassBorder,
    backgroundColor: EW.surfaceContainerLow,
  },
  chipActive: {
    backgroundColor: EW.primaryContainer,
    borderColor: EW.primaryContainer,
  },
  list: {
    padding: EWSpacing.screen,
    gap: EWSpacing.stackMd,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EWSpacing.stackMd,
    padding: EWSpacing.stackMd,
  },
  cardPressed: {
    opacity: 0.7,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: EWRadius.lg,
    backgroundColor: EW.surfaceContainerHighest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EW.hairline,
    padding: 8,
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EWSpacing.stackSm,
  },
  cardTitle: {
    flexShrink: 1,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EWSpacing.stackMd,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: EWRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,242,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,242,255,0.2)',
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: EWSpacing.stackSm,
    gap: EWSpacing.stackSm,
  },
  swipeBtn: {
    width: 52,
    height: 52,
    borderRadius: EWRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EW.surfaceContainerHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: EW.glassBorder,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: EWSpacing.stackMd,
    paddingHorizontal: EWSpacing.gutter,
    paddingBottom: 110,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: EWRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,242,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,242,255,0.2)',
    marginBottom: EWSpacing.stackMd,
  },
  emptyText: {
    textAlign: 'center',
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EWSpacing.stackSm,
    backgroundColor: EW.primaryContainer,
    paddingHorizontal: EWSpacing.stackLg,
    paddingVertical: EWSpacing.stackMd,
    borderRadius: EWRadius.full,
    marginTop: EWSpacing.stackMd,
  },
});
