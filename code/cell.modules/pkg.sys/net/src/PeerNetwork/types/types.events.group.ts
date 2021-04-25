import { t } from './common';

/**
 * NOTE: These events are fired over the "network bus" to
 *       other connected clients.
 */
export type GroupEvent =
  | GroupEnsureConnectedDataEvent
  | GroupEnsureConnectionClosedEvent
  | GroupConnectionsReqEvent
  | GroupConnectionsResEvent;

/**
 * Broadcasts to peers a set of connections they should ensure
 * they are connected to.
 */
export type GroupEnsureConnectedDataEvent = {
  type: 'sys.net/group/conn/ensure:data';
  payload: GroupEnsureConnectedData;
};
export type GroupEnsureConnectedData = {
  source: t.PeerId;
  connections: { peer: t.PeerId; id: t.PeerConnectionId }[];
  isReliable: boolean;
};

/**
 * Ensure connection is closed are closed.
 */
export type GroupEnsureConnectionClosedEvent = {
  type: 'sys.net/group/conn/ensure:closed';
  payload: GroupEnsureConnectionClosed;
};
export type GroupEnsureConnectionClosed = {
  source: t.PeerId;
  connection: t.PeerConnectionId;
};

/**
 * Fires to retrieve a list of peer connections.
 */
export type GroupConnectionsReqEvent = {
  type: 'sys.net/group/connections:req';
  payload: GroupConnectionsReq;
};
export type GroupConnectionsReq = {
  source: t.PeerId;
  targets?: t.PeerId[];
  tx?: string;
};

export type GroupConnectionsResEvent = {
  type: 'sys.net/group/connections:res';
  payload: GroupConnectionsRes;
};
export type GroupConnectionsRes = {
  source: t.PeerId;
  tx: string;
  peers: GroupConnectionsResPeer[];
};
export type GroupConnectionsResPeer = {
  peer: t.PeerId;
  module: t.PeerModule;
  connections: { id: t.PeerConnectionId; kind: t.PeerConnectionKind }[];
};
