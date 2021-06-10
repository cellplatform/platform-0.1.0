import { t } from '../common';

export type NetworkBusUri = string;

/**
 * Sends events across the network
 */
export type NetworkBusSend<E extends t.Event = t.Event> = (e: NetworkBusSendArgs<E>) => void;
export type NetworkBusSendArgs<E extends t.Event = t.Event> = { event: E; uri: NetworkBusUri };

/**
 * An event-bus distributed across a network.
 */
export type NetworkBus<E extends t.Event = t.Event> = {
  $: t.Observable<E>;
  fire: t.FireEvent<E>;
  target: NetworkBusTarget<E>;
};

/**
 * Target events at specific network endpoints.
 */
export type NetworkBusTarget<E extends t.Event> = {
  /**
   * Fires an event over the local bus only.
   */
  local(event: E): Promise<NetworkBusFireResponse<E>>;

  /**
   * Fires an event to remote network targets only.
   */
  remote(event: E): Promise<NetworkBusFireResponse<E>>;

  /**
   * Broadcasts to a subset of network targets.
   */
  filter(fn?: NetworkBusFilter): {
    fire(event: E): Promise<NetworkBusFireResponse<E>>;
  };

  /**
   * Broadcasts to a specific network target address(es).
   */
  node(...target: NetworkBusUri[]): {
    fire(event: E): Promise<NetworkBusFireResponse<E>>;
  };
};

export type NetworkBusFireResponse<E extends t.Event> = {
  event: E;
  targetted: NetworkBusUri[];
};

/**
 * Filters on network targets.
 */
export type NetworkBusFilter = (e: NetworkBusFilterArgs) => boolean;
export type NetworkBusFilterArgs = { uri: NetworkBusUri };
