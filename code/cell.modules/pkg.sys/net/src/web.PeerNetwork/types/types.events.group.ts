import { t } from './common';

/**
 * NOTE: These events are fired over the "network bus" to
 *       other connected clients.
 */
export type GroupEvent =
  | GroupEnsureConnectionClosedEvent
  | GroupConnectionsReqEvent
  | GroupConnectionsResEvent
  | GroupRefreshEvent
  | GroupConnectEvent;

/**
 * Ensure connection is closed are closed.
 */
export type GroupEnsureConnectionClosedEvent = {
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
export type GroupConnectionsReqEvent = {
  type: 'sys.net/group/connections:req';
  payload: NetGroupConnectionsReq;
};
export type NetGroupConnectionsReq = {
  source: t.PeerId;
  targets?: t.PeerId[];
  tx?: string;
};

export type GroupConnectionsResEvent = {
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
export type GroupRefreshEvent = {
  type: 'sys.net/group/refresh';
  payload: NetGroupRefresh;
};
export type NetGroupRefresh = {
  source: t.PeerId;
};

/**
 * Fired to tell peer(s) to start a connection.
 */
export type GroupConnectEvent = {
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
