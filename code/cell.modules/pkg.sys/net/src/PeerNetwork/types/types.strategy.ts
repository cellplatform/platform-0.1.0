import { t } from './common';

/**
 * Single combined set of network strategies.
 */
export type PeerStrategy = t.IDisposable & {
  connection: t.PeerConnectionStrategy;
};

/**
 * Strategies for connecting and disconnecting peers.
 */
export type PeerConnectionStrategy = t.IDisposable & {
  /**
   * Auto purge connections when closed.
   */
  autoPurgeOnClose: boolean;

  /**
   * Auto propogate new connections to all other connected clients.
   */
  autoPropagation: boolean;

  /**
   * Ensure connections are closed on all peers within the mesh.
   */
  ensureClosed: boolean;
};

/**
 * Strategies for working with a group of peers ("mesh").
 */
export type GroupStrategy = t.IDisposable & {
  /**
   * Retrieve details about the network of peers/connections.
   */
  connections: boolean;
};
