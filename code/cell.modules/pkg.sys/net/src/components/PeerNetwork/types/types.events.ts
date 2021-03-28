import { t } from './common';
export * from './types.events.network';
export * from './types.events.connection';

/**
 * An identifier of a network peer.
 */
export type PeerNetworkId = string;

/**
 * EVENTS
 */

export type PeerNetworkEvent =
  | t.PeerNetworkInitReqEvent
  | t.PeerNetworkInitResEvent
  | t.PeerNetworkSelfUpdateEvent
  | t.PeerNetworkStatusRequestEvent
  | t.PeerNetworkStatusResponseEvent
  | t.PeerNetworkPurgeReqEvent
  | t.PeerNetworkPurgeResEvent
  | t.PeerNetworkConnectReqEvent
  | t.PeerNetworkConnectResEvent
  | t.PeerNetworkConnectionClosedEvent
  | t.PeerNetworkDisconnectReqEvent
  | t.PeerNetworkDisconnectResEvent;
