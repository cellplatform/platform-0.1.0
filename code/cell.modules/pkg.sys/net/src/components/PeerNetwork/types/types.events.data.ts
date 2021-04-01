import { t } from './common';

export type PeerDataEvent = PeerDataSendEvent | PeerDataReceivedEvent;

/**
 * Sends data over the network
 */
export type PeerDataSendEvent = {
  type: 'Peer:Data/send';
  payload: PeerDataSend;
};
export type PeerDataSend = {
  ref: t.PeerNetworkId;
  target?: t.PeerNetworkId | t.PeerNetworkId[]; // If omitted broadcast to all connected peers.
  data: t.JsonMap;
};

export type PeerDataReceivedEvent = {
  type: 'Peer:Data/received';
  payload: PeerDataReceived;
};
export type PeerDataReceived = {
  ref: t.PeerNetworkId;
  data: t.JsonMap;
  from: t.PeerNetworkId;
  to: t.PeerNetworkId[];
};
