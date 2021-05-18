import { t } from './common';

/**
 * An event-bus distributed across a number of peers.
 */
export type PeerBus<E extends t.Event = t.Event> = t.NetworkBus<E> &
  t.IDisposable & {
    self: t.PeerId;
    connections: t.PeerConnectionStatus[];
  };
