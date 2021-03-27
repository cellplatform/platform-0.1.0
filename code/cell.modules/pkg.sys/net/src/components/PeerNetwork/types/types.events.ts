import { t } from './common';

/**
 * An identifier of a network peer.
 */
export type PeerNetworkId = string;

/**
 * EVENTS
 */

export type PeerNetworkEvent =
  | PeerNetworkCreateReqEvent
  | PeerNetworkCreatResEvent
  | PeerNetworkStatusRequestEvent
  | PeerNetworkStatusResponseEvent
  | PeerNetworkPurgeReqEvent
  | PeerNetworkPurgeResEvent
  | PeerNetworkConnectReqEvent
  | PeerNetworkConnectResEvent
  | PeerNetworkConnectionClosedEvent
  | PeerNetworkDisconnectReqEvent
  | PeerNetworkDisconnectResEvent;

/**
 * Fires to initiate the creation of a Peer.
 */
export type PeerNetworkCreateReqEvent = {
  type: 'PeerNetwork/create:req';
  payload: PeerNetworkCreateReq;
};
export type PeerNetworkCreateReq = {
  ref: PeerNetworkId;
  signal: string; // String containing the signal server endpoint: "host/path"
};

/**
 * Fires when a peer has connected.
 */
export type PeerNetworkCreatResEvent = {
  type: 'PeerNetwork/create:res';
  payload: PeerNetworkCreateRes;
};
export type PeerNetworkCreateRes = {
  ref: PeerNetworkId;
  createdAt: number;
  signal: t.PeerNetworkSignalEndpoint;
};

/**
 * Fired to retrieve the status of the specified peer.
 */
export type PeerNetworkStatusRequestEvent = {
  type: 'PeerNetwork/status:req';
  payload: PeerNetworkStatusRequest;
};
export type PeerNetworkStatusRequest = { ref: PeerNetworkId };

/**
 * Fired to retrieve the status of the specified peer.
 */
export type PeerNetworkStatusResponseEvent = {
  type: 'PeerNetwork/status:res';
  payload: PeerNetworkStatusResponse;
};
export type PeerNetworkStatusResponse = {
  ref: PeerNetworkId;
  exists: boolean;
  network?: t.PeerNetworkStatus;
};

/**
 * Purges obsolete state.
 */
export type PeerNetworkPurgeReqEvent = {
  type: 'PeerNetwork/purge:req';
  payload: PeerNetworkPurgeReq;
};
export type PeerNetworkPurgeReq = {
  ref: PeerNetworkId;
  select?: true | { closedConnections?: boolean }; // NB: [true] clears all purgeable data.
};

export type PeerNetworkPurgeResEvent = {
  type: 'PeerNetwork/purge:res';
  payload: PeerNetworkPurgeRes;
};
export type PeerNetworkPurgeRes = {
  ref: PeerNetworkId;
  changed: boolean;
  purged: t.PeerNetworkPurgedDetail;
  error?: t.PeerNetworkError;
};
export type PeerNetworkPurgedDetail = {
  closedConnections: {
    data: number;
    media: number;
  };
};

/**
 * CONNECTION
 */

/**
 * Fired to initiate a data connection.
 */
export type PeerNetworkConnectReqEvent = {
  type: 'PeerNetwork/connect:req';
  payload: PeerNetworkConnectReq;
};
export type PeerNetworkConnectReq = PeerNetworkConnectDataReq | PeerNetworkConnectMediaReq;
type ConnectBase = {
  ref: PeerNetworkId;
  remote: PeerNetworkId;
  metadata?: t.JsonMap;
};
export type PeerNetworkConnectDataReq = ConnectBase & { kind: 'data'; reliable?: boolean };
export type PeerNetworkConnectMediaReq = ConnectBase & { kind: 'media' };

/**
 * Fired when a peer completes it's connection.
 */
export type PeerNetworkConnectResEvent = {
  type: 'PeerNetwork/connect:res';
  payload: PeerNetworkConnectRes;
};
export type PeerNetworkConnectRes = {
  ref: PeerNetworkId;
  remote: PeerNetworkId;
  kind: 'data' | 'media';
  direction: 'incoming' | 'outgoing';
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
  ref: PeerNetworkId;
  remote: PeerNetworkId;
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
  ref: PeerNetworkId;
  remote: PeerNetworkId;
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
  ref: PeerNetworkId;
  connection: t.PeerConnectionStatus;
};
