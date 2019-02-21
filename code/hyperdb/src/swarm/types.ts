export * from '../types';
import { IProtocol } from '../types';

/**
 * [Events]
 */
export type SwarmEvent =
  | ISwarmPeerConnectedEvent
  | ISwarmPeerAuthorizedEvent
  | ISwarmErrorEvent
  | ISwarmJoinEvent
  | ISwarmLeaveEvent;

export type ISwarmPeerConnectedEvent = {
  type: 'SWARM/peer/connected';
  payload: { peer: IProtocol };
};
export type ISwarmPeerAuthorizedEvent = {
  type: 'SWARM/peer/authorized';
  payload: { peerKey: Buffer; isAuthorized: true };
};
export type ISwarmJoinEvent = {
  type: 'SWARM/join';
  payload: {};
};
export type ISwarmLeaveEvent = {
  type: 'SWARM/leave';
  payload: {};
};

export type ISwarmErrorEvent = {
  type: 'SWARM/error';
  payload: { error: Error };
};
