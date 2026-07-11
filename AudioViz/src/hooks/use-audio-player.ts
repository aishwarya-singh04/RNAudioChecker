import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioContext } from 'react-native-audio-api';
import type { AudioBuffer, AudioBufferSourceNode } from 'react-native-audio-api';

const POSITION_INTERVAL_MS = 100;

export interface AudioPlayer {
  isPlaying: boolean;
  isLoading: boolean;
  /** current playback position in seconds */
  position: number;
  /** total duration in seconds (falls back to the provided hint until decoded) */
  duration: number;
  error: string | null;
  toggle: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  seek: (seconds: number) => void;
  /** seek by a relative offset, clamped to [0, duration] */
  skip: (deltaSeconds: number) => void;
}

/**
 * Minimal file player built on react-native-audio-api. Decodes the recording
 * once, then schedules buffer sources for play/resume and tracks position via
 * the audio context clock.
 */
export function useAudioPlayer(uri: string | undefined, durationHint = 0): AudioPlayer {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(durationHint);
  const [error, setError] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startedAtRef = useRef(0);
  const offsetRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPositionLoop = useCallback(() => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopSource = useCallback(() => {
    const src = sourceRef.current;
    if (src) {
      src.onEnded = null;
      try {
        src.stop();
      } catch {
        // already stopped
      }
      try {
        src.disconnect();
      } catch {
        // ignore
      }
      sourceRef.current = null;
    }
  }, []);

  const startPositionLoop = useCallback(() => {
    stopPositionLoop();
    intervalRef.current = setInterval(() => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const total = bufferRef.current?.duration ?? duration;
      const elapsed = offsetRef.current + (ctx.currentTime - startedAtRef.current);
      if (total > 0 && elapsed >= total) {
        setPosition(total);
        return; // onEnded handles reset
      }
      setPosition(elapsed);
    }, POSITION_INTERVAL_MS);
  }, [duration, stopPositionLoop]);

  const ensureBuffer = useCallback(async (): Promise<AudioBuffer | null> => {
    if (!uri) return null;
    if (bufferRef.current) return bufferRef.current;
    setIsLoading(true);
    try {
      const ctx = ctxRef.current ?? new AudioContext();
      ctxRef.current = ctx;
      const buffer = await ctx.decodeAudioData(uri);
      bufferRef.current = buffer;
      setDuration(buffer.duration || durationHint);
      return buffer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load audio.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [uri, durationHint]);

  const play = useCallback(async () => {
    setError(null);
    const buffer = await ensureBuffer();
    const ctx = ctxRef.current;
    if (!buffer || !ctx) return;

    stopSource();

    if (offsetRef.current >= buffer.duration) offsetRef.current = 0;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onEnded = () => {
      stopPositionLoop();
      offsetRef.current = 0;
      setPosition(0);
      setIsPlaying(false);
      sourceRef.current = null;
    };
    sourceRef.current = source;

    startedAtRef.current = ctx.currentTime;
    source.start(0, offsetRef.current);
    setIsPlaying(true);
    startPositionLoop();
  }, [ensureBuffer, stopSource, stopPositionLoop, startPositionLoop]);

  const pause = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !sourceRef.current) return;
    offsetRef.current += ctx.currentTime - startedAtRef.current;
    stopSource();
    stopPositionLoop();
    setIsPlaying(false);
  }, [stopSource, stopPositionLoop]);

  const toggle = useCallback(async () => {
    if (isPlaying) pause();
    else await play();
  }, [isPlaying, pause, play]);

  const seek = useCallback(
    (seconds: number) => {
      const total = bufferRef.current?.duration ?? duration;
      const clamped = Math.max(0, Math.min(total || seconds, seconds));
      offsetRef.current = clamped;
      setPosition(clamped);
      if (isPlaying) {
        void play();
      }
    },
    [duration, isPlaying, play]
  );

  const skip = useCallback(
    (delta: number) => {
      seek(position + delta);
    },
    [position, seek]
  );

  useEffect(() => {
    // Reset everything when the source file changes.
    stopSource();
    stopPositionLoop();
    bufferRef.current = null;
    offsetRef.current = 0;
    /* eslint-disable react-hooks/set-state-in-effect -- resetting player state on source change is intentional */
    setPosition(0);
    setIsPlaying(false);
    setDuration(durationHint);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

  useEffect(() => {
    return () => {
      stopSource();
      stopPositionLoop();
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isPlaying, isLoading, position, duration, error, toggle, play, pause, seek, skip };
}
