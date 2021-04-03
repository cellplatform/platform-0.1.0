import { t } from './common';

/**
 * Single combined set of network strategies.
 */
export type PeerStrategy = t.IDisposable & {
  connection: PeerConnectionStrategy;
};

/**
 * Handles strategies for connecting and disconnecting peers.
 */
export type PeerConnectionStrategy = t.IDisposable & {
  /**
   * Auto purge connections when closed.
   */
  purgeOnClose: boolean;

  /**
   * Auto propogate new connections to all other connected clients.
   */
  meshPropagation: boolean;
};