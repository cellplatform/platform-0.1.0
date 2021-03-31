import { t } from './common';

/**
 * NETWORK
 */
export type PeerNetworkEvent =
  | t.PeerNetworkInitReqEvent
  | t.PeerNetworkInitResEvent
  | t.PeerNetworkStatusRequestEvent
  | t.PeerNetworkStatusResponseEvent
  | t.PeerNetworkStatusChangedEvent
  | t.PeerNetworkPurgeReqEvent
  | t.PeerNetworkPurgeResEvent;

/**
 * Fires to initiate the creation of a Peer.
 */
export type PeerNetworkInitReqEvent = {
  type: 'Peer/Network/init:req';
  payload: PeerNetworkCreateReq;
};
export type PeerNetworkCreateReq = {
  ref: t.PeerNetworkId;
  signal: string; // String containing the signal server endpoint: "host/path"
};

/**
 * Fires when a peer has connected.
 */
export type PeerNetworkInitResEvent = {
  type: 'Peer/Network/init:res';
  payload: PeerNetworkCreateRes;
};
export type PeerNetworkCreateRes = {
  ref: t.PeerNetworkId;
  createdAt: number;
  signal: t.PeerNetworkSignalEndpoint;
};

/**
 * Fired to retrieve the status of the specified peer.
 */
export type PeerNetworkStatusRequestEvent = {
  type: 'Peer/Network/status:req';
  payload: PeerNetworkStatusRequest;
};
export type PeerNetworkStatusRequest = { ref: t.PeerNetworkId };

/**
 * Fired to retrieve the status of the specified peer.
 */
export type PeerNetworkStatusResponseEvent = {
  type: 'Peer/Network/status:res';
  payload: PeerNetworkStatusResponse;
};
export type PeerNetworkStatusResponse = {
  ref: t.PeerNetworkId;
  exists: boolean;
  self?: t.PeerNetworkStatus;
};

/**
 * Fired when the status of a peer network has changed.
 * NOTE:
 *    This is a derived event that is fired in response
 *    to various different events completing that indicate
 *    the status of the PeerNetwork has changed.
 *
 *    This is useful for redrawing UI that may be displaying
 *    the status of the network.
 *
 */
export type PeerNetworkStatusChangedEvent = {
  type: 'Peer/Network/status:changed';
  payload: PeerNetworkStatusChanged;
};
export type PeerNetworkStatusChanged = {
  ref: t.PeerNetworkId;
  self: t.PeerNetworkStatus;
  event: t.PeerEvent;
};

/**
 * Purges obsolete state.
 */
export type PeerNetworkPurgeReqEvent = {
  type: 'Peer/Network/purge:req';
  payload: PeerNetworkPurgeReq;
};
export type PeerNetworkPurgeReq = {
  ref: t.PeerNetworkId;
  select?: true | { closedConnections?: boolean }; // NB: [true] clears all purgeable data.
};

export type PeerNetworkPurgeResEvent = {
  type: 'Peer/Network/purge:res';
  payload: PeerNetworkPurgeRes;
};
export type PeerNetworkPurgeRes = {
  ref: t.PeerNetworkId;
  changed: boolean;
  purged: t.PeerNetworkPurged;
  error?: t.PeerNetworkError;
};
export type PeerNetworkPurged = {
  closedConnections: { data: number; media: number };
};
