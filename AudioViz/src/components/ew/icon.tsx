import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { EW } from '@/constants/echowave-theme';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export type EWIconName =
  | 'mic'
  | 'equalizer'
  | 'graphic-eq'
  | 'folder'
  | 'settings'
  | 'delete'
  | 'pause'
  | 'play-arrow'
  | 'stop'
  | 'replay-10'
  | 'forward-10'
  | 'edit'
  | 'content-cut'
  | 'ios-share'
  | 'share'
  | 'file-download'
  | 'save'
  | 'chevron-right'
  | 'search'
  | 'calendar-today'
  | 'timer'
  | 'arrow-back'
  | 'palette'
  | 'audio-file'
  | 'check-circle'
  | 'radio-button-unchecked'
  | 'more-vert'
  | 'favorite'
  | 'favorite-border'
  | 'verified-user'
  | 'close'
  | 'home'
  | 'help-outline'
  | 'info-outline'
  | 'logout'
  | 'sort'
  | 'tune'
  | 'sd-storage'
  | 'lock'
  | 'speed'
  | 'auto-awesome'
  | 'mic-none'
  | 'library-music';

export type EWIconProps = {
  name: EWIconName;
  size?: number;
  color?: string;
  filled?: boolean;
};

export function EWIcon({ name, size = 24, color = EW.onSurfaceVariant }: EWIconProps) {
  return <MaterialIcons name={name as MaterialIconName} size={size} color={color} />;
}
