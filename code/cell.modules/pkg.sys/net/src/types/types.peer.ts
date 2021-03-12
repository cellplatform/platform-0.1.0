export type PeerEvent = PeerConnectEvent;

/**
 * Fires when a Peer connects
 */
export type PeerConnectEvent = {
  type: 'Peer/data/open';
  payload: PeerConnect;
};
export type PeerConnect = {
  host: string;
};
