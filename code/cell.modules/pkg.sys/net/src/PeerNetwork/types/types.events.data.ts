import { t } from './common';

export type PeerDataEvent = PeerDataSendEvent | PeerDataReceivedEvent;

/**
 * Fires to sends OUTGOING data over the network
 */
export type PeerDataSendEvent = {
  type: 'Peer:Data/send';
  payload: PeerDataSend;
};
export type PeerDataSend = {
  self: t.PeerId;
  target?: t.PeerId | t.PeerId[]; // If omitted broadcast to all connected peers.
  data: t.JsonMap;
};

/**
 * Fires when INCOMING data is recieved from the network.
 */
export type PeerDataReceivedEvent = {
  type: 'Peer:Data/received';
  payload: PeerDataReceived;
};
export type PeerDataReceived = {
  self: t.PeerId;
  data: t.JsonMap;
  from: t.PeerId;
  to: t.PeerId[];
};