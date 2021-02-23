import { PeerJS } from '../../common/libs';

export * from '../../common/types';

/**
 * Events
 */
export type PeerEvent = PeerCreatedEvent | PeerConnectEvent | PeerPublishEvent;

/**
 * Peer created.
 */
export type PeerCreatedEvent = {
  type: 'Peer/created';
  payload: PeerCreated;
};
export type PeerCreated = { peer: PeerJS };

/**
 * Connect to a peer.
 */
export type PeerConnectEvent = {
  type: 'Peer/connect';
  payload: PeerConnect;
};
export type PeerConnect = { id: string };

/**
 * Send data to all peers.
 */
export type PeerPublishEvent = {
  type: 'Peer/publish';
  payload: PeerPublish;
};
export type PeerPublish = { data: any };
