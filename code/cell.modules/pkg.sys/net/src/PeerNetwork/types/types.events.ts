import { t } from './common';

export * from './types.events.connection';
export * from './types.events.data';
export * from './types.events.local';
export * from './types.events.strategy';

/**
 * An identifier of a network peer.
 */
export type PeerId = string;

/**
 * EVENTS
 */
export type PeerEvent = t.PeerLocalEvent | t.PeerConnectionEvent | t.PeerDataEvent;
