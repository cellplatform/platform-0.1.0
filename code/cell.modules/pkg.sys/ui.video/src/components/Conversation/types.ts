import { PeerJS } from '../../common/libs';

export * from '../../common/types';

export type ConversationState = {
  imageDir?: string | string[];
  selected?: string;
  zoom?: number;
};

/**
 * Events
 */
export type PeerEvent = PeerCreatedEvent | PeerConnectEvent | PeerPublishEvent | PeerModelEvent;

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
export type PeerPublish = { data: Partial<ConversationState> };

/**
 * Send data to all peers.
 */
export type PeerModelEvent = {
  type: 'Peer/model';
  payload: PeerModel;
};
export type PeerModel = { data: Partial<ConversationState> };
