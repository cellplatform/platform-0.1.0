import { t } from './common';

export type PeerDataEvent = PeerDataSendEvent;

/**
 * Sends data over the network
 */
export type PeerDataSendEvent = {
  type: 'Peer:Data/send';
  payload: PeerDataSend;
};

export type PeerDataSend = {
  ref: t.PeerNetworkId;
  remote?: t.PeerNetworkId | t.PeerNetworkId[]; // If omitted broadcast to all connected peers.
};
