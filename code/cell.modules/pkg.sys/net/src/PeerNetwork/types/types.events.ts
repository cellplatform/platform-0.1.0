import { t } from './common';

export * from './types.events.peer.local';
export * from './types.events.peer.conn';
export * from './types.events.peer.data';

export * from './types.events.group';
export * from './types.events.fs';

/**
 * EVENTS
 */
export type PeerEvent = t.PeerLocalEvent | t.PeerConnectionEvent | t.PeerDataEvent;
