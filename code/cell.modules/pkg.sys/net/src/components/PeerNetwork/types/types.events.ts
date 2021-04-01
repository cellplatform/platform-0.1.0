import { t } from './common';
export * from './types.events.network';
export * from './types.events.connection';
export * from './types.events.data';

/**
 * An identifier of a network peer.
 */
export type PeerNetworkId = string;

/**
 * EVENTS
 */
export type PeerEvent = t.PeerNetworkEvent | t.PeerConnectionEvent | t.PeerDataEvent;
