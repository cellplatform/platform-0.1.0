import { t } from './common';

/**
 * NETWORK
 */
export type PeerLocalEvent =
  | PeerLocalInitReqEvent
  | PeerLocalInitResEvent
  | PeerLocalStatusRequestEvent
  | PeerLocalStatusResponseEvent
  | PeerLocalStatusChangedEvent
  | PeerLocalOnlineChangedEvent
  | PeerLocalPurgeReqEvent
  | PeerLocalPurgeResEvent;

/**
 * Fires to initiate the creation of a Peer.
 */
export type PeerLocalInitReqEvent = {
  type: 'Peer:Network/init:req';
  payload: PeerLocalCreateReq;
};
export type PeerLocalCreateReq = {
  self: t.PeerId;
  signal: string; // String containing the signal server endpoint: "host/path"
};

/**
 * Fires when a peer has connected.
 */
export type PeerLocalInitResEvent = {
  type: 'Peer:Network/init:res';
  payload: PeerLocalCreateRes;
};
export type PeerLocalCreateRes = {
  self: t.PeerId;
  createdAt: number;
  signal: t.PeerSignallingEndpoint;
};

/**
 * Fired to retrieve the status of the specified peer.
 */
export type PeerLocalStatusRequestEvent = {
  type: 'Peer:Network/status:req';
  payload: PeerLocalStatusRequest;
};
export type PeerLocalStatusRequest = {
  self: t.PeerId;
};

/**
 * Fired to retrieve the status of the specified peer.
 */
export type PeerLocalStatusResponseEvent = {
  type: 'Peer:Network/status:res';
  payload: PeerLocalStatusResponse;
};
export type PeerLocalStatusResponse = {
  self: t.PeerId;
  exists: boolean;
  network?: t.PeerNetworkStatus;
};

/**
 * Fired when the status of a peer network has changed.
 *
 * NOTE:
 *    This is a derived event that is fired in response
 *    to various different events completing that indicate
 *    the status of the [PeerNetwork] has changed.
 *
 *    Example usage: redrawing UI that may be displaying
 *    the status of the network.
 *
 */
export type PeerLocalStatusChangedEvent = {
  type: 'Peer:Network/status:changed';
  payload: PeerLocalStatusChanged;
};
export type PeerLocalStatusChanged = {
  self: t.PeerId;
  network: t.PeerNetworkStatus;
  event: t.PeerEvent;
};

export type PeerLocalOnlineChangedEvent = {
  type: 'Peer:Network/online:changed';
  payload: PeerLocalOnlineChanged;
};
export type PeerLocalOnlineChanged = {
  self: t.PeerId;
  isOnline: boolean;
};

/**
 * Purges obsolete state.
 */
export type PeerLocalPurgeReqEvent = {
  type: 'Peer:Network/purge:req';
  payload: PeerLocalPurgeReq;
};
export type PeerLocalPurgeReq = {
  self: t.PeerId;
  select?: true | { closedConnections?: boolean }; // NB: [true] clears all purgeable data.
};

export type PeerLocalPurgeResEvent = {
  type: 'Peer:Network/purge:res';
  payload: PeerLocalPurgeRes;
};
export type PeerLocalPurgeRes = {
  self: t.PeerId;
  changed: boolean;
  purged: t.PeerLocalPurged;
  error?: t.PeerError;
};
export type PeerLocalPurged = {
  closedConnections: { data: number; media: number };
};
