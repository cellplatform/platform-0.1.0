import { t } from '../../common';

export type PeerSignalEndpoint = { host: string; port: number; path?: string; secure: boolean };

/**
 * EVENTS
 */

export type PeerEvent = PeerCreateEvent | PeerCreatedEvent;

/**
 * Fires to initiate the creation of a Peer.
 */
export type PeerCreateEvent = {
  type: 'Peer/create';
  payload: PeerCreate;
};
export type PeerCreate = {
  id?: string; // Ommit to generate new id.
  signal: string;
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
