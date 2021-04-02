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
   * Closed connections are autmatically purged from state.
   * When false, manually fire the [purge] event.
   */
  purgeOnClose: boolean;
};
