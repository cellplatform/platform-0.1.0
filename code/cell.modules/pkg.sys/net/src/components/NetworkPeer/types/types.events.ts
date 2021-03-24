import { t } from './common';

/**
 * EVENTS
 */

export type PeerEvent =
  | PeerCreateEvent
  | PeerCreatedEvent
  | PeerStatusRequestEvent
  | PeerStatusResponseEvent;

/**
 * Fires to initiate the creation of a Peer.
 */
export type PeerCreateEvent = {
  type: 'Peer/create';
  payload: PeerCreate;
};
export type PeerCreate = {
  id?: string; // Ommit to generate new id.  If ommited and "singleton" already exists, that is returned.
  signal: string; // String containing the signal server endpoint: "host/path"
};

/**
 * Fires when a peer has connected.
 */
export type PeerCreatedEvent = {
  type: 'Peer/created';
  payload: PeerCreated;
};
export type PeerCreated = {
  id: string;
  createdAt: number;
  signal: t.PeerSignalEndpoint;
};

/**
 * Fired to retrieve the status of the specified peer.
 */
export type PeerStatusRequestEvent = {
  type: 'Peer/status:req';
  payload: { id?: string }; // NB: Ommit ID to retrieve
};
export type PeerStatusRequest = { id?: string }; // NB: Ommit ID to retrieve singleton

/**
 * Fired to retrieve the status of the specified peer.
 */
export type PeerStatusResponseEvent = {
  type: 'Peer/status:res';
  payload: PeerStatusResponse;
};
export type PeerStatusResponse = {
  id?: string; // NB: Ommit ID to retrieve
  exists: boolean;
  peer?: t.PeerStatus;
};
