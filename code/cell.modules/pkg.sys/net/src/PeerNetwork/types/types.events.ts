import { t } from './common';

export * from './types.events.connection';
export * from './types.events.data';
export * from './types.events.group';
export * from './types.events.local';

/**
 * EVENTS
 */
export type PeerEvent = t.PeerLocalEvent | t.PeerConnectionEvent | t.PeerDataEvent;
