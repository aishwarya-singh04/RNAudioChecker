import type { TextStyle } from 'react-native';

/**
 * EchoWave design tokens, extracted from the shared Stitch (Material 3) config.
 * The cyan accent lives in `primaryContainer` (#00f2ff); text sitting on top of
 * it uses `onPrimaryContainer`.
 */
export const EW = {
  bg: '#0B0B0B',
  surfaceDim: '#131313',
  surface: '#131313',
  surfaceContainerLowest: '#0e0e0e',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainer: '#201f1f',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353534',
  surfaceBright: '#3a3939',
  surfaceVariant: '#353534',

  onSurface: '#e5e2e1',
  onSurfaceVariant: '#b9cacb',
  outline: '#849495',
  outlineVariant: '#3a494b',

  primary: '#e1fdff',
  primaryContainer: '#00f2ff',
  onPrimaryContainer: '#006a71',
  onPrimary: '#00363a',
  primaryFixed: '#74f5ff',
  primaryFixedDim: '#00dbe7',

  secondary: '#afc6ff',
  secondaryContainer: '#548dff',
  onSecondaryContainer: '#002760',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',

  white: '#ffffff',
  glassFill: 'rgba(26, 26, 26, 0.6)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  hairline: 'rgba(255, 255, 255, 0.05)',
} as const;

export const EWSpacing = {
  unit: 4,
  stackSm: 8,
  stackMd: 16,
  screen: 20,
  gutter: 24,
  stackLg: 32,
} as const;

export const EWRadius = {
  sm: 4,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;

export const EWType = {
  displayLgMobile: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.64,
  },
  headlineMd: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.24,
  },
  bodyMd: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  monoData: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  labelSm: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

/** Cyan glow shadow preset used across CTAs and active elements. */
export const cyanGlow = (radius = 20, opacity = 0.4) => ({
  shadowColor: EW.primaryContainer,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: 0 },
  elevation: 8,
});
