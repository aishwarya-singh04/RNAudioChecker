export interface Recording {
  id: string;
  title: string;
  /** human date label, e.g. "Jul 11, 2026" */
  date: string;
  /** epoch ms, for sorting */
  createdAt: number;
  /** duration in seconds */
  durationSec: number;
  /** human duration mm:ss */
  duration: string;
  /** human size, e.g. "1.6 MB" */
  size: string;
  format: 'WAV' | 'MP3' | 'AAC' | 'M4A' | 'CAF' | 'FLAC';
  bitrate: string;
  favorite: boolean;
  /** absolute file:// uri of the audio file on disk */
  uri: string;
  /** normalized waveform bar heights in [0,1] captured while recording */
  waveform: number[];
}

/** Deterministic fallback waveform, used only when a real capture is missing. */
export function seededWaveform(seed: number, count = 40): number[] {
  const bars: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    const rnd = s / 233280;
    bars.push(0.15 + rnd * 0.85);
  }
  return bars;
}

export function fmtDuration(totalSec: number): string {
  const t = Math.max(0, Math.round(totalSec));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/** react-native-audio-api reports size in MB already. */
export function fmtSizeMb(mb: number): string {
  if (!isFinite(mb) || mb <= 0) return '0.0 MB';
  if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
  return `${mb.toFixed(1)} MB`;
}

export function fmtDateLabel(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
