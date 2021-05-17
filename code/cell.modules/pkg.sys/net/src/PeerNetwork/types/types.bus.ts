import { t } from './common';

/**
 * An event-bus distributed across a network.
 */
export type NetworkBus<E extends t.Event = t.Event> = {
  $: t.Observable<E>;
  fire: t.FireEvent<E>;
  self: t.PeerId;
  target: NetBusTarget<E>;
};

/**
 * An event-bus distributed across a number of peers.
 */
export type PeerBus<E extends t.Event = t.Event> = NetworkBus<E> &
  t.IDisposable & {
    connections: t.PeerConnectionStatus[];
  };

/**
 * Selected fires event to peers.
 */
export type NetBusTarget<E extends t.Event> = {
  /**
   * Fires an event over the local bus only.
   */
  local(event: E): Promise<NetBusFireResponse<E>>;

  /**
   * Fires an event to remote peers only.
   */
  remote(event: E): Promise<NetBusFireResponse<E>>;

  /**
   * Broadcasts to a subset of peers.
   */
  filter(fn?: t.PeerFilter): {
    fire(event: E): Promise<NetBusFireResponse<E>>;
  };

  /**
   * Broadcasts to a specific peer(s).
   */
  peer(...id: t.PeerId[]): {
    fire(event: E): Promise<NetBusFireResponse<E>>;
  };
};

export type NetBusFireResponse<E extends t.Event> = {
  sent: { peer: t.PeerId; connection: t.PeerConnectionId }[];
  event: E;
};
