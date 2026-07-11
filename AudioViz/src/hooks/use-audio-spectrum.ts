import { useCallback, useEffect, useRef, useState } from 'react';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import {
  AudioManager,
  AudioRecorder,
  FileDirectory,
  FileFormat,
  type PermissionStatus,
} from 'react-native-audio-api';

// FFT window size. Must be a power of two. The recorder is asked to deliver
// buffers of this length so each callback maps to exactly one FFT frame.
const FFT_SIZE = 1024;
const SAMPLE_RATE = 48000;
const DEFAULT_BAR_COUNT = 64;
// Below this normalized loudness we treat the input as silence.
const DETECTION_THRESHOLD = 0.06;
// Multiplier applied to raw RMS so typical speech fills a good portion of the
// bar range (speech RMS sits around 0.05–0.15 on a -1..1 signal).
const LEVEL_GAIN = 6;
// How many bars a saved waveform thumbnail should have.
const WAVEFORM_RESOLUTION = 48;
// Minimum gap between waveform samples so short and long clips both fill out.
const WAVEFORM_SAMPLE_MS = 90;

export type SpectrumStatus = 'idle' | 'starting' | 'listening' | 'paused' | 'error';

export interface StopResult {
  uri: string;
  durationSec: number;
  /** size in MB */
  sizeMb: number;
  waveform: number[];
}

export interface AudioSpectrum {
  /** Per-bar normalized magnitudes in [0, 1]. Updated every audio buffer. */
  bars: SharedValue<number[]>;
  /** Overall normalized loudness in [0, 1]. */
  level: SharedValue<number>;
  /** Whether the current input is above the silence threshold. */
  detected: SharedValue<boolean>;
  status: SpectrumStatus;
  permission: PermissionStatus;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<StopResult | null>;
  pause: () => void;
  resume: () => void;
}

export interface UseAudioSpectrumOptions {
  /** When true, the microphone session is also written to a file on disk. */
  record?: boolean;
}

/**
 * In-place iterative radix-2 Cooley–Tukey FFT. `re`/`im` must have a length
 * that is a power of two. On return they hold the transformed complex values.
 */
function fftInPlace(re: Float32Array, im: Float32Array): void {
  const n = re.length;

  // Bit-reversal permutation.
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
      const ti = im[i];
      im[i] = im[j];
      im[j] = ti;
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    const half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let curR = 1;
      let curI = 0;
      for (let k = 0; k < half; k++) {
        const iEven = i + k;
        const iOdd = i + k + half;
        const oddR = re[iOdd] * curR - im[iOdd] * curI;
        const oddI = re[iOdd] * curI + im[iOdd] * curR;
        re[iOdd] = re[iEven] - oddR;
        im[iOdd] = im[iEven] - oddI;
        re[iEven] += oddR;
        im[iEven] += oddI;
        const nextR = curR * wr - curI * wi;
        curI = curR * wi + curI * wr;
        curR = nextR;
      }
    }
  }
}

/** Precomputed Hann window to reduce spectral leakage. */
function makeHannWindow(size: number): Float32Array {
  const w = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
  }
  return w;
}

/**
 * Streams microphone audio and exposes an FFT spectrum as Reanimated shared
 * values, ready to feed a Skia visualizer.
 *
 * The spectrum is computed directly from the recorder's raw PCM buffers
 * (`onAudioReady`), so the live visualization always reflects the audio that is
 * actually being captured/recorded. Source-agnostic by design: speech, music or
 * any ambient sound produce the same frequency data, so no ML/classification is
 * involved. When `record` is enabled the session is persisted to an .m4a file
 * and `stop()` resolves with the file location, duration, size and a captured
 * waveform.
 */
export function useAudioSpectrum(
  barCount: number = DEFAULT_BAR_COUNT,
  options: UseAudioSpectrumOptions = {}
): AudioSpectrum {
  const { record = false } = options;

  const bars = useSharedValue<number[]>(new Array(barCount).fill(0));
  const level = useSharedValue(0);
  const detected = useSharedValue(false);

  const [status, setStatus] = useState<SpectrumStatus>('idle');
  const [permission, setPermission] = useState<PermissionStatus>('Undetermined');
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const waveSamplesRef = useRef<number[]>([]);
  const lastSampleAtRef = useRef(0);

  // FFT scratch buffers, reused across callbacks to avoid per-frame allocation.
  const reRef = useRef<Float32Array>(new Float32Array(FFT_SIZE));
  const imRef = useRef<Float32Array>(new Float32Array(FFT_SIZE));
  const hannRef = useRef<Float32Array>(makeHannWindow(FFT_SIZE));

  const teardown = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder) {
      recorder.clearOnAudioReady();
      recorder.clearOnError();
    }
    recorderRef.current = null;

    /* eslint-disable react-hooks/immutability -- resetting Reanimated shared values is intentional */
    bars.value = new Array(barCount).fill(0);
    level.value = 0;
    detected.value = false;
    /* eslint-enable react-hooks/immutability */
    AudioManager.setAudioSessionActivity(false).catch(() => {});
  }, [barCount, bars, detected, level]);

  const downsampleWaveform = useCallback((): number[] => {
    const samples = waveSamplesRef.current;
    if (samples.length === 0) return [];
    const out = new Array<number>(WAVEFORM_RESOLUTION);
    const bucket = samples.length / WAVEFORM_RESOLUTION;
    let max = 0.0001;
    for (let i = 0; i < WAVEFORM_RESOLUTION; i++) {
      const startIdx = Math.floor(i * bucket);
      const endIdx = Math.max(startIdx + 1, Math.floor((i + 1) * bucket));
      let peak = 0;
      for (let j = startIdx; j < endIdx && j < samples.length; j++) {
        if (samples[j] > peak) peak = samples[j];
      }
      out[i] = peak;
      if (peak > max) max = peak;
    }
    // Normalize so the loudest moment reaches the top of the bar.
    return out.map((v) => Math.max(0.06, Math.min(1, v / max)));
  }, []);

  // Turns one raw PCM buffer into per-bar magnitudes + overall loudness.
  const processBuffer = useCallback(
    (samples: Float32Array) => {
      const re = reRef.current;
      const im = imRef.current;
      const hann = hannRef.current;
      const frames = Math.min(FFT_SIZE, samples.length);

      // RMS loudness over the real samples (before windowing).
      let sumSq = 0;
      for (let i = 0; i < samples.length; i++) {
        sumSq += samples[i] * samples[i];
      }
      const rms = Math.sqrt(sumSq / Math.max(1, samples.length));
      const loudness = Math.min(1, rms * LEVEL_GAIN);

      // Load windowed samples into the FFT input; zero-pad the remainder.
      for (let i = 0; i < FFT_SIZE; i++) {
        re[i] = i < frames ? samples[i] * hann[i] : 0;
        im[i] = 0;
      }
      fftInPlace(re, im);

      const halfBins = FFT_SIZE >> 1;
      const next = new Array<number>(barCount);
      let frameMax = 1e-6;

      // Log-spaced buckets so low frequencies (speech) aren't crammed to the left.
      for (let b = 0; b < barCount; b++) {
        const startBin = Math.max(1, Math.floor(Math.pow(b / barCount, 2) * halfBins));
        const endBin = Math.max(
          startBin + 1,
          Math.floor(Math.pow((b + 1) / barCount, 2) * halfBins)
        );
        let peak = 0;
        for (let k = startBin; k < endBin && k < halfBins; k++) {
          const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
          if (mag > peak) peak = mag;
        }
        next[b] = peak;
        if (peak > frameMax) frameMax = peak;
      }

      // Normalize the spectral shape per frame, then scale by loudness so quiet
      // input stays low and loud input reaches the top of the visualizer.
      for (let b = 0; b < barCount; b++) {
        const shape = next[b] / frameMax;
        next[b] = Math.min(1, shape * loudness);
      }

      /* eslint-disable react-hooks/immutability -- writing Reanimated shared values every frame is intentional */
      bars.value = next;
      level.value = loudness;
      detected.value = loudness >= DETECTION_THRESHOLD;
      /* eslint-enable react-hooks/immutability */

      // Sample the loudness envelope for the saved waveform thumbnail.
      const now = Date.now();
      if (now - lastSampleAtRef.current >= WAVEFORM_SAMPLE_MS) {
        lastSampleAtRef.current = now;
        waveSamplesRef.current.push(loudness);
      }
    },
    [barCount, bars, detected, level]
  );

  const stop = useCallback(async (): Promise<StopResult | null> => {
    let result: StopResult | null = null;
    const recorder = recorderRef.current;
    if (recorder) {
      recorder.clearOnAudioReady();
      try {
        const info = await recorder.stop();
        if (record && info.status === 'success' && info.paths.length > 0) {
          result = {
            uri: info.paths[0],
            durationSec: info.duration,
            sizeMb: info.size,
            waveform: downsampleWaveform(),
          };
        }
      } catch (err) {
        console.warn('[EchoWave] recorder.stop failed:', err);
      }
    }

    teardown();
    waveSamplesRef.current = [];
    setStatus('idle');
    return result;
  }, [record, downsampleWaveform, teardown]);

  const start = useCallback(async () => {
    try {
      setError(null);
      setStatus('starting');
      waveSamplesRef.current = [];
      lastSampleAtRef.current = 0;

      const permissionStatus = await AudioManager.requestRecordingPermissions();
      setPermission(permissionStatus);
      if (permissionStatus !== 'Granted') {
        setStatus('error');
        setError('Microphone access is required. Enable it in Settings to record.');
        return;
      }

      AudioManager.setAudioSessionOptions({
        iosCategory: 'playAndRecord',
        iosMode: 'default',
        iosOptions: ['allowBluetoothA2DP', 'defaultToSpeaker'],
      });
      await AudioManager.setAudioSessionActivity(true);

      const recorder = new AudioRecorder();
      recorder.onError((e) => {
        setError(e?.message ?? 'Recording error');
      });

      if (record) {
        recorder.enableFileOutput({
          format: FileFormat.M4A,
          directory: FileDirectory.Document,
          subDirectory: 'EchoWave',
          fileNamePrefix: 'echowave_',
        });
      }

      // Drive the live spectrum straight from the recorded PCM. This is the same
      // audio written to disk, so the visualization can never disagree with what
      // is actually captured.
      recorder.onAudioReady({ sampleRate: SAMPLE_RATE, bufferLength: FFT_SIZE, channelCount: 1 }, (event) => {
        try {
          const channel = event.buffer.getChannelData(0);
          processBuffer(channel);
        } catch {
          // Ignore malformed buffers; the next one will refresh the view.
        }
      });

      recorderRef.current = recorder;
      await recorder.start();

      setStatus('listening');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to start audio capture.');
      teardown();
    }
  }, [processBuffer, record, teardown]);

  const pause = useCallback(() => {
    recorderRef.current?.pause();
    // eslint-disable-next-line react-hooks/immutability -- resetting Reanimated shared value is intentional
    detected.value = false;
    setStatus((prev) => (prev === 'listening' ? 'paused' : prev));
  }, [detected]);

  const resume = useCallback(() => {
    if (!recorderRef.current) return;
    recorderRef.current.resume();
    setStatus('listening');
  }, []);

  useEffect(() => {
    return () => {
      teardown();
    };
    // Only tear down on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { bars, level, detected, status, permission, error, start, stop, pause, resume };
}
