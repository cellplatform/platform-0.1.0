import { t } from './common';

/**
 * Network CONNECTION
 */
export type PeerConnectionEvent =
  | PeerConnectReqEvent
  | PeerConnectResEvent
  | PeerConnectionClosedEvent
  | PeerDisconnectReqEvent
  | PeerDisconnectResEvent;

/**
 * Fired to initiate a data connection.
 */
export type PeerConnectReqEvent = {
  type: 'Peer:Connection/connect:req';
  payload: PeerNetworkConnectReq;
};
export type PeerNetworkConnectReq = PeerNetworkConnectDataReq | PeerNetworkConnectMediaReq;

type ConnectBase = {
  self: t.PeerId;
  remote: t.PeerId;
  metadata?: t.JsonMap;
  direction: t.PeerConnectDirection;
};

export type PeerNetworkConnectDataReq = ConnectBase & { kind: 'data'; reliable?: boolean };
export type PeerNetworkConnectMediaReq = ConnectBase & { kind: 'media'; timeout?: number };

/**
 * Fired when a peer completes it's connection.
 */
export type PeerConnectResEvent = {
  type: 'Peer:Connection/connect:res';
  payload: PeerNetworkConnectRes;
};
export type PeerNetworkConnectRes = {
  self: t.PeerId;
  remote: t.PeerId;
  kind: 'data' | 'media';
  direction: t.PeerConnectDirection;
  connection?: t.PeerConnectionStatus;
  error?: t.PeerNetworkError;
};

/**
 * Fired to close a connection.
 */
export type PeerDisconnectReqEvent = {
  type: 'Peer:Connection/disconnect:req';
  payload: PeerNetworkDisconnectReq;
};
export type PeerNetworkDisconnectReq = {
  self: t.PeerId;
  remote: t.PeerId;
};

/**
 * Fires when a "disconnect" request completes.
 * NB:
 *    The generic "connection:closed" request will also
 *    fire upon completing.
 */
export type PeerDisconnectResEvent = {
  type: 'Peer:Connection/disconnect:res';
  payload: PeerNetworkDisconnectRes;
};
export type PeerNetworkDisconnectRes = {
  self: t.PeerId;
  remote: t.PeerId;
  connection?: t.PeerConnectionStatus;
  error?: t.PeerNetworkError;
};

/**
 * Fired when a connection closes.
 */
export type PeerConnectionClosedEvent = {
  type: 'Peer:Connection/closed';
  payload: PeerNetworkConnectionClosed;
};
export type PeerNetworkConnectionClosed = {
  self: t.PeerId;
  connection: t.PeerConnectionStatus;
};
