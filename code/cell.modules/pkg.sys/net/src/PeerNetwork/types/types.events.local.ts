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
  | PeerLocalPurgeResEvent
  | PeerLocalMediaReqEvent
  | PeerLocalMediaResEvent;

/**
 * Fires to initiate the creation of a Peer.
 */
export type PeerLocalInitReqEvent = {
  type: 'Peer:Local/init:req';
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
  type: 'Peer:Local/init:res';
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
  type: 'Peer:Local/status:req';
  payload: PeerLocalStatusRequest;
};
export type PeerLocalStatusRequest = {
  self: t.PeerId;
  tx?: string;
};

/**
 * Fired to retrieve the status of the specified peer.
 */
export type PeerLocalStatusResponseEvent = {
  type: 'Peer:Local/status:res';
  payload: PeerLocalStatusResponse;
};
export type PeerLocalStatusResponse = {
  self: t.PeerId;
  tx: string;
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
  type: 'Peer:Local/status:changed';
  payload: PeerLocalStatusChanged;
};
export type PeerLocalStatusChanged = {
  self: t.PeerId;
  network: t.PeerNetworkStatus;
  event: t.PeerEvent;
};

export type PeerLocalOnlineChangedEvent = {
  type: 'Peer:Local/online:changed';
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
  type: 'Peer:Local/purge:req';
  payload: PeerLocalPurgeReq;
};
export type PeerLocalPurgeReq = {
  self: t.PeerId;
  tx?: string;
  select?: true | { closedConnections?: boolean }; // NB: [true] clears all purgeable data.
};

export type PeerLocalPurgeResEvent = {
  type: 'Peer:Local/purge:res';
  payload: PeerLocalPurgeRes;
};
export type PeerLocalPurgeRes = {
  self: t.PeerId;
  tx: string;
  changed: boolean;
  purged: t.PeerLocalPurged;
  error?: t.PeerError;
};
export type PeerLocalPurged = {
  closedConnections: { data: number; media: number };
};

/**
 * Request a media-stream from the local environment.
 */
export type PeerLocalMediaReqEvent = {
  type: 'Peer:Local/media:req';
  payload: PeerLocalMediaReq;
};
export type PeerLocalMediaReq = {
  self: t.PeerId;
  tx?: string;
  kind: t.PeerMediaKind;
  constraints?: t.PartialDeep<MediaStreamConstraints>;
};

/**
 * Response to a media-stream request.
 */
export type PeerLocalMediaResEvent = {
  type: 'Peer:Local/media:res';
  payload: PeerLocalMediaRes;
};
export type PeerLocalMediaRes = {
  self: t.PeerId;
  tx: string;
  media?: MediaStream;
  error?: t.PeerError;
};
