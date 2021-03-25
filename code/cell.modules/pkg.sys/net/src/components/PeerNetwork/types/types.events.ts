import { t } from './common';

/**
 * The local network peer-id.
 */
export type PeerNetworkLocalId = string;

/**
 * EVENTS
 */

export type PeerNetworkEvent =
  | PeerNetworkCreateEvent
  | PeerNetworkCreatedEvent
  | PeerNetworkStatusRequestEvent
  | PeerNetworkStatusResponseEvent
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
  id: PeerNetworkLocalId;
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
  id: PeerNetworkLocalId;
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
export type PeerNetworkStatusRequest = { id: PeerNetworkLocalId };

/**
 * Fired to retrieve the status of the specified peer.
 */
export type PeerNetworkStatusResponseEvent = {
  type: 'PeerNetwork/status:res';
  payload: PeerNetworkStatusResponse;
};
export type PeerNetworkStatusResponse = {
  id: PeerNetworkLocalId;
  exists: boolean;
  network?: t.PeerNetworkStatus;
};

/**
 * Fired to initiate a data connection.
 */
export type PeerNetworkConnectEvent = {
  type: 'PeerNetwork/connect';
  payload: PeerNetworkConnect;
};
export type PeerNetworkConnect = PeerNetworkConnectData | PeerNetworkConnectMedia;
type ConnectBase = {
  id: PeerNetworkLocalId;
  target: string;
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
  id: PeerNetworkLocalId;
  kind: 'data' | 'media';
  direction: 'incoming' | 'outgoing';
  target: string;
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
  id: PeerNetworkLocalId;
  connection: t.PeerConnectionStatus;
};
