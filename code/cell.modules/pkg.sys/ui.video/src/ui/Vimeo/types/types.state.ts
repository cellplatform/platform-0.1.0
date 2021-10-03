import { t } from './common';

type Seconds = number;

/**
 * Status
 */
export type VimeoStatus = {
  id: t.VimeoInstance;
  video: t.VimeoId;
  action: 'info' | 'loaded' | 'start' | 'update' | 'seek' | 'stop' | 'end';
  duration: Seconds;
  seconds: Seconds;
  percent: number;
  playing: boolean;
  ended: boolean;
};

/**
 * Icon Flags
 */
export const IconFlags: t.VimeoIconFlag[] = ['spinner', 'play', 'pause', 'replay'];
