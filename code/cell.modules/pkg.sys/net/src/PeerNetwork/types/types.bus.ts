import { t } from './common';

/**
 * An event-bus distributed across a number of peers.
 */
export type NetBus<E extends t.Event = t.Event> = t.IDisposable & t.EventBus<E> & NetBusProps<E>;
type NetBusProps<E extends t.Event> = {
  target(filter?: t.PeerConnectionFilter): NetBusTarget<E>;
};

/**
 * Selected fires event to peers.
 */
export type NetBusTarget<E extends t.Event> = {
  fire(event: E): Promise<NetBusFireResponse<E>>;
};

export type NetBusFireResponse<E extends t.Event> = {
  sent: { peer: t.PeerId; connection: t.PeerConnectionId }[];
  event: E;
};
