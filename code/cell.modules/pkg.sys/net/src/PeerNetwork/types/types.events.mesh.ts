import { t } from './common';

/**
 * NOTE: These events are fired over the "network bus" to
 *       other connected clients.
 */
export type MeshEvent = MeshEnsureConnectedDataEvent | MeshEnsureConnectionClosedEvent;

/**
 * Broadcasts to peers a set of connections they should ensure
 * they are connected to.
 */
export type MeshEnsureConnectedDataEvent = {
  type: 'Mesh/ensureConnected:data';
  payload: MeshEnsureConnectedData;
};
export type MeshEnsureConnectedData = {
  from: t.PeerId;
  peers: t.PeerId[];
  isReliable: boolean;
  metadata?: t.JsonMap;
};

/**
 * Ensure connection is closed are closed.
 */
export type MeshEnsureConnectionClosedEvent = {
  type: 'Mesh/ensureConnectionClosed';
  payload: MeshEnsureConnectionClosed;
};
export type MeshEnsureConnectionClosed = {
  from: t.PeerId;
  connection: t.PeerConnectionId;
};
