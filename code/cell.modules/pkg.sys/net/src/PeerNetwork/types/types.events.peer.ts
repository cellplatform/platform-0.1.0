import { t } from './common';

export * from './types.events.peer.local';
export * from './types.events.peer.conn';
export * from './types.events.peer.data';

export type PeerEvent = t.PeerLocalEvent | t.PeerConnectionEvent | t.PeerDataEvent;
