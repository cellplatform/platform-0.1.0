import { t } from './common';

import { NetFsEvent } from './types.events.fs';

/**
 * NOTE: These events are fired over the "network bus" to
 *       other connected clients.
 */
export type NetGroupEvent =
  | NetFsEvent
  | NetGroupEnsureConnectedDataEvent
  | NetGroupEnsureConnectionClosedEvent
  | NetGroupConnectionsReqEvent
  | NetGroupConnectionsResEvent
  | NetGroupRefreshEvent
  | NetGroupConnectEvent;

/**
 * Broadcasts to peers a set of connections they should ensure
 * they are connected to.
 */
export type NetGroupEnsureConnectedDataEvent = {
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
export type NetGroupEnsureConnectionClosedEvent = {
  type: 'sys.net/group/conn/ensure:closed';
  payload: NetGroupEnsureConnectionClosed;
};
export type NetGroupEnsureConnectionClosed = {
  source: t.PeerId;
  connection: t.PeerConnectionId;
};

/**
 * Fires to retrieve a list of peer connections.
 */
export type NetGroupConnectionsReqEvent = {
  type: 'sys.net/group/connections:req';
  payload: NetGroupConnectionsReq;
};
export type NetGroupConnectionsReq = {
  source: t.PeerId;
  targets?: t.PeerId[];
  tx?: string;
};

export type NetGroupConnectionsResEvent = {
  type: 'sys.net/group/connections:res';
  payload: NetGroupConnectionsRes;
};
export type NetGroupConnectionsRes = {
  source: t.PeerId;
  tx: string;
  peers: t.GroupPeer[];
};

/**
 * Fired when a refresh to the group status is desired.
 */
export type NetGroupRefreshEvent = {
  type: 'sys.net/group/refresh';
  payload: NetGroupRefresh;
};
export type NetGroupRefresh = {
  source: t.PeerId;
};

/**
 * Fired to tell peer(s) to start a connection.
 */
export type NetGroupConnectEvent = {
  type: 'sys.net/group/connect';
  payload: NetGroupConnect;
};
export type NetGroupConnect = {
  source: t.PeerId;
  target: { peer: t.PeerId; kind: t.PeerConnectionKind };
};

/**
 * Fired to tell the group of a peers screen size.
 */
export type NetGroupPeerScreenEvent = {
  type: 'sys.net/group/peer/screen';
  payload: PeerScreen;
};
export type PeerScreen = {
  self: t.PeerId;
  size: { width: number; height: number };
};
