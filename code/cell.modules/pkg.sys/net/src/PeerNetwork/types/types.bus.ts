import { t } from './common';

/**
 * An event-bus distributed across a number of peers.
 */
export type PeerBus<E extends t.Event = t.Event> = NetworkBus<E> &
  t.IDisposable & {
    self: t.PeerId;
    connections: t.PeerConnectionStatus[];
  };

/**
 * An event-bus distributed across a network.
 */
export type NetworkBus<E extends t.Event = t.Event> = {
  $: t.Observable<E>;
  fire: t.FireEvent<E>;
  target: NetworkBusTarget<E>;
};

/**
 * Selected fires event to peers.
 */
export type NetworkBusTarget<E extends t.Event> = {
  /**
   * Fires an event over the local bus only.
   */
  local(event: E): Promise<NetworkBusFireResponse<E>>;

  /**
   * Fires an event to remote peers only.
   */
  remote(event: E): Promise<NetworkBusFireResponse<E>>;

  /**
   * Broadcasts to a subset of peers.
   */
  filter(fn?: t.PeerFilter): {
    fire(event: E): Promise<NetworkBusFireResponse<E>>;
  };

  /**
   * Broadcasts to a specific peer(s).
   */
  peer(...id: t.PeerId[]): {
    fire(event: E): Promise<NetworkBusFireResponse<E>>;
  };
};

export type NetworkBusFireResponse<E extends t.Event> = {
  sent: { peer: t.PeerId; connection: t.PeerConnectionId }[];
  event: E;
};
