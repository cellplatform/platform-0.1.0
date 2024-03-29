import * as t from '../common/types';

/**
 * An event-bus distributed across a number of peers.
 */
export type PeerNetbus<E extends t.Event = t.Event> = t.NetworkBus<E> & {
  self: t.PeerId;
  connections: t.PeerConnectionStatus[];
};
