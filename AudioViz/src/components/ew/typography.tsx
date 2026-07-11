import { Text, type TextProps } from 'react-native';

import { EW, EWType } from '@/constants/echowave-theme';

type Variant = keyof typeof EWType;

export type EWTextProps = TextProps & {
  variant?: Variant;
  color?: string;
  mono?: boolean;
};

/**
 * Typography primitive mapping the Stitch text styles. `mono` swaps to a
 * monospaced family for the "data" labels (timers, bitrates, sizes).
 */
export function EWText({ variant = 'bodyMd', color = EW.onSurface, mono, style, ...rest }: EWTextProps) {
  return (
    <Text
      style={[
        EWType[variant],
        { color },
        mono && { fontFamily: 'monospace' },
        style,
      ]}
      {...rest}
    />
  );
}
