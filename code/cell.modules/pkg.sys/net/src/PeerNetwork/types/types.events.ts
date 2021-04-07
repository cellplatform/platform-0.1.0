import { t } from './common';

export * from './types.events.connection';
export * from './types.events.data';
export * from './types.events.local';
export * from './types.events.strategy';

/**
 * EVENTS
 */
export type PeerEvent = t.PeerLocalEvent | t.PeerConnectionEvent | t.PeerDataEvent;
