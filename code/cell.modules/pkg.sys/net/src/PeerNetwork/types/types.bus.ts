import { t } from './common';

/**
 * An event-bus distributed across a number of peers.
 */
export type NetBus<E extends t.Event = t.Event> = t.IDisposable & {
  event$: t.Observable<E>;
  fire: t.FireEvent<E>;
  type<T extends t.Event>(): t.NetBus<T>;

  connections: t.PeerConnectionStatus[];
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
