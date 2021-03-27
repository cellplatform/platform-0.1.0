import { t } from './common';

/**
 * The local network peer-id.
 */
export type PeerNetworkId = string;

/**
 * EVENTS
 */

export type PeerNetworkEvent =
  | PeerNetworkCreateEvent
  | PeerNetworkCreatedEvent
  | PeerNetworkStatusRequestEvent
  | PeerNetworkStatusResponseEvent
  | PeerNetworkPurgeEvent
  | PeerNetworkConnectEvent
  | PeerNetworkConnectedEvent
  | PeerNetworkConnectionClosedEvent;

/**
 * Fires to initiate the creation of a Peer.
 */
export type PeerNetworkCreateEvent = {
  type: 'PeerNetwork/create';
  payload: PeerNetworkCreate;
};
export type PeerNetworkCreate = {
  local: PeerNetworkId;
  signal: string; // String containing the signal server endpoint: "host/path"
};

/**
 * Fires when a peer has connected.
 */
export type PeerNetworkCreatedEvent = {
  type: 'PeerNetwork/created';
  payload: PeerNetworkCreated;
};
export type PeerNetworkCreated = {
  local: PeerNetworkId;
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
export type PeerNetworkStatusRequest = { local: PeerNetworkId };

/**
 * Fired to retrieve the status of the specified peer.
 */
export type PeerNetworkStatusResponseEvent = {
  type: 'PeerNetwork/status:res';
  payload: PeerNetworkStatusResponse;
};
export type PeerNetworkStatusResponse = {
  local: PeerNetworkId;
  exists: boolean;
  network?: t.PeerNetworkStatus;
};

/**
 * Purges obsolete state.
 */
export type PeerNetworkPurgeEvent = {
  type: 'PeerNetwork/purge';
  payload: PeerNetworkPurge;
};
export type PeerNetworkPurge = {
  local: PeerNetworkId;
  data?: true | PeerNetworkPurgeDetails; // NB: [true] clears all purgeable data.
};
export type PeerNetworkPurgeDetails = {
  closedConnections?: boolean;
};

/**
 * CONNECTION
 */

/**
 * Fired to initiate a data connection.
 */
export type PeerNetworkConnectEvent = {
  type: 'PeerNetwork/connect';
  payload: PeerNetworkConnect;
};
export type PeerNetworkConnect = PeerNetworkConnectData | PeerNetworkConnectMedia;
type ConnectBase = {
  local: PeerNetworkId;
  remote: PeerNetworkId;
};
export type PeerNetworkConnectData = ConnectBase & { kind: 'data'; reliable?: boolean };
export type PeerNetworkConnectMedia = ConnectBase & { kind: 'media' };

/**
 * Fired when a peer completes it's connection.
 */
export type PeerNetworkConnectedEvent = {
  type: 'PeerNetwork/connected';
  payload: PeerNetworkConnected;
};
export type PeerNetworkConnected = {
  local: PeerNetworkId;
  remote: PeerNetworkId;
  kind: 'data' | 'media';
  direction: 'incoming' | 'outgoing';
  connection?: t.PeerConnectionStatus;
  error?: { message: string };
};

/**
 * Fired when a connection closes.
 */
export type PeerNetworkConnectionClosedEvent = {
  type: 'PeerNetwork/connection:closed';
  payload: PeerNetworkConnectionClosed;
};

export type PeerNetworkConnectionClosed = {
  local: PeerNetworkId;
  connection: t.PeerConnectionStatus;
};
