import { t } from './common';

/**
 * NOTE: These events are fired over the "network bus" to
 *       other connected clients.
 */
export type GroupEvent = GroupEnsureConnectedDataEvent | GroupEnsureConnectionClosedEvent;

/**
 * Broadcasts to peers a set of connections they should ensure
 * they are connected to.
 */
export type GroupEnsureConnectedDataEvent = {
  type: 'sys.net/group/conn/ensure:data';
  payload: GroupEnsureConnectedData;
};
export type GroupEnsureConnectedData = {
  from: t.PeerId;
  peers: t.PeerId[];
  isReliable: boolean;
  metadata?: t.JsonMap;
};

/**
 * Ensure connection is closed are closed.
 */
export type GroupEnsureConnectionClosedEvent = {
  type: 'sys.net/group/conn/ensure:closed';
  payload: GroupEnsureConnectionClosed;
};
export type GroupEnsureConnectionClosed = {
  from: t.PeerId;
  connection: t.PeerConnectionId;
};
