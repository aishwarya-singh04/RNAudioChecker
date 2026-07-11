import { File, Paths } from 'expo-file-system';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  fmtDateLabel,
  fmtDuration,
  fmtSizeMb,
  seededWaveform,
  type Recording,
} from '@/data/recordings';

const RECORDINGS_FILE = 'recordings.json';

export interface NewRecordingInput {
  uri: string;
  durationSec: number;
  /** size in MB as reported by the recorder */
  sizeMb: number;
  waveform: number[];
  format: Recording['format'];
  bitrate?: string;
  title?: string;
}

interface RecordingsContextValue {
  recordings: Recording[];
  loaded: boolean;
  addRecording: (input: NewRecordingInput) => Recording;
  renameRecording: (id: string, title: string) => void;
  removeRecording: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getRecording: (id: string) => Recording | undefined;
}

const RecordingsContext = createContext<RecordingsContextValue | null>(null);

function loadFromDisk(): Recording[] {
  try {
    const file = new File(Paths.document, RECORDINGS_FILE);
    if (!file.exists) return [];
    const parsed = JSON.parse(file.textSync());
    return Array.isArray(parsed) ? (parsed as Recording[]) : [];
  } catch {
    return [];
  }
}

function saveToDisk(list: Recording[]) {
  try {
    const file = new File(Paths.document, RECORDINGS_FILE);
    file.write(JSON.stringify(list));
  } catch (err) {
    console.warn('[EchoWave] Failed to persist recordings:', err);
  }
}

function deleteAudioFile(uri: string) {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (err) {
    console.warn('[EchoWave] Failed to delete audio file:', err);
  }
}

export function RecordingsProvider({ children }: { children: ReactNode }) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loaded, setLoaded] = useState(false);
  // Persist only after the initial load so we never clobber the file with [].
  const hydrated = useRef(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from disk on mount */
    setRecordings(loadFromDisk());
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) saveToDisk(recordings);
  }, [recordings]);

  const addRecording = useCallback((input: NewRecordingInput): Recording => {
    const createdAt = Date.now();
    const waveform =
      input.waveform && input.waveform.length > 0
        ? input.waveform
        : seededWaveform(createdAt % 233280);

    const rec: Recording = {
      id: `rec-${createdAt}`,
      title: input.title?.trim() || 'New Recording',
      date: fmtDateLabel(createdAt),
      createdAt,
      durationSec: input.durationSec,
      duration: fmtDuration(input.durationSec),
      size: fmtSizeMb(input.sizeMb),
      format: input.format,
      bitrate: input.bitrate ?? '256 kbps',
      favorite: false,
      uri: input.uri,
      waveform,
    };

    setRecordings((prev) => [rec, ...prev]);
    return rec;
  }, []);

  const renameRecording = useCallback((id: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    setRecordings((prev) => prev.map((r) => (r.id === id ? { ...r, title: clean } : r)));
  }, []);

  const removeRecording = useCallback((id: string) => {
    setRecordings((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target) deleteAudioFile(target.uri);
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setRecordings((prev) =>
      prev.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r))
    );
  }, []);

  const getRecording = useCallback(
    (id: string) => recordings.find((r) => r.id === id),
    [recordings]
  );

  const value = useMemo(
    () => ({
      recordings,
      loaded,
      addRecording,
      renameRecording,
      removeRecording,
      toggleFavorite,
      getRecording,
    }),
    [recordings, loaded, addRecording, renameRecording, removeRecording, toggleFavorite, getRecording]
  );

  return <RecordingsContext.Provider value={value}>{children}</RecordingsContext.Provider>;
}

export function useRecordings(): RecordingsContextValue {
  const ctx = useContext(RecordingsContext);
  if (!ctx) {
    throw new Error('useRecordings must be used within a RecordingsProvider');
  }
  return ctx;
}
