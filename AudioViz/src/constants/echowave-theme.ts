import type { TextStyle, ViewStyle } from 'react-native';

/**
 * EchoWave design tokens — cute glossy pink matching the music-note app icon
 * (#FC84AC on black, face detail #482448).
 */
export const EW = {
  bg: '#0A0809',
  surfaceDim: '#140F12',
  surface: '#161014',
  surfaceContainerLowest: '#0E0A0C',
  surfaceContainerLow: '#1E151A',
  surfaceContainer: '#241A20',
  surfaceContainerHigh: '#2E2229',
  surfaceContainerHighest: '#3A2C35',
  surfaceBright: '#44343E',
  surfaceVariant: '#3A2C35',

  onSurface: '#FFF5F8',
  onSurfaceVariant: '#E8C4D3',
  outline: '#B8899E',
  outlineVariant: '#5A3F4C',

  primary: '#FFE4EF',
  primaryContainer: '#FC84AC',
  onPrimaryContainer: '#482448',
  onPrimary: '#2A1228',
  primaryFixed: '#FFB3CD',
  primaryFixedDim: '#F06098',

  secondary: '#FFD6E6',
  secondaryContainer: '#E85A9B',
  onSecondaryContainer: '#3A1530',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',

  white: '#ffffff',
  /** Soft pink glass — glossy panels */
  glassFill: 'rgba(252, 132, 172, 0.12)',
  glassBorder: 'rgba(255, 200, 220, 0.28)',
  hairline: 'rgba(255, 220, 232, 0.1)',
  /** Specular highlight for glossy chips/buttons */
  glossHighlight: 'rgba(255, 255, 255, 0.35)',
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

/** Soft pink glow used across CTAs and active elements. */
export const cyanGlow = (radius = 20, opacity = 0.45) =>
  ({
    shadowColor: EW.primaryContainer,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  }) satisfies ViewStyle;

/** Extra glossy pill look (border + glow). */
export const glossyAccent = (): ViewStyle => ({
  backgroundColor: EW.primaryContainer,
  borderWidth: 1,
  borderColor: EW.glossHighlight,
  ...cyanGlow(22, 0.5),
});
