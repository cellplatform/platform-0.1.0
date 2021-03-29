import { t } from './common';

/**
 * Fired to initiate a data connection.
 */
export type PeerNetworkConnectReqEvent = {
  type: 'PeerNetwork/connect:req';
  payload: PeerNetworkConnectReq;
};
export type PeerNetworkConnectReq = PeerNetworkConnectDataReq | PeerNetworkConnectMediaReq;

type ConnectBase = {
  ref: t.PeerNetworkId;
  remote: t.PeerNetworkId;
  metadata?: t.JsonMap;
  direction: t.PeerConnectDirection;
};

export type PeerNetworkConnectDataReq = ConnectBase & { kind: 'data'; reliable?: boolean };
export type PeerNetworkConnectMediaReq = ConnectBase & { kind: 'media'; timeout?: number };

/**
 * Fired when a peer completes it's connection.
 */
export type PeerNetworkConnectResEvent = {
  type: 'PeerNetwork/connect:res';
  payload: PeerNetworkConnectRes;
};
export type PeerNetworkConnectRes = {
  ref: t.PeerNetworkId;
  remote: t.PeerNetworkId;
  kind: 'data' | 'media';
  direction: t.PeerConnectDirection;
  connection?: t.PeerConnectionStatus;
  error?: t.PeerNetworkError;
};

/**
 * Fired to close a connection.
 */
export type PeerNetworkDisconnectReqEvent = {
  type: 'PeerNetwork/disconnect:req';
  payload: PeerNetworkDisconnectReq;
};
export type PeerNetworkDisconnectReq = {
  ref: t.PeerNetworkId;
  remote: t.PeerNetworkId;
};

/**
 * Fires when a "disconnect" request completes.
 * NB:
 *    The generic "connection:closed" request will also
 *    fire upon completing.
 */
export type PeerNetworkDisconnectResEvent = {
  type: 'PeerNetwork/disconnect:res';
  payload: PeerNetworkDisconnectRes;
};
export type PeerNetworkDisconnectRes = {
  ref: t.PeerNetworkId;
  remote: t.PeerNetworkId;
  connection?: t.PeerConnectionStatus;
  error?: t.PeerNetworkError;
};

/**
 * Fired when a connection closes.
 */
export type PeerNetworkConnectionClosedEvent = {
  type: 'PeerNetwork/connection:closed';
  payload: PeerNetworkConnectionClosed;
};
export type PeerNetworkConnectionClosed = {
  ref: t.PeerNetworkId;
  connection: t.PeerConnectionStatus;
};
