import { t } from './common';

export type PeerDataEvent = PeerDataOutEvent | PeerDataInEvent;

/**
 * Fires to sends OUTGOING data over the network
 */
export type PeerDataOutEvent = {
  type: 'sys.net/peer/data/out';
  payload: PeerDataOut;
};
export type PeerDataOut = {
  self: t.PeerId;
  target?: t.PeerId | t.PeerId[]; // If omitted broadcast to all connected peers.
  data: t.JsonMap;
};

/**
 * Fires when INCOMING data is recieved from the network.
 */
export type PeerDataInEvent = {
  type: 'sys.net/peer/data/in';
  payload: PeerDataIn;
};
export type PeerDataIn = {
  self: t.PeerId;
  data: t.JsonMap;
  from: t.PeerId;
  to: t.PeerId[];
};
