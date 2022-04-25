import { EventBus } from './common';

export * from './types.event';
export * from './types.hooks';
export * from './types.state';

export type VimeoId = number; // Vimeo video identifier.
export type VimeoIconFlag = 'spinner' | 'play' | 'pause' | 'replay';
export type VimeoInstance = { bus: EventBus<any>; id: string };
