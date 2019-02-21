export * from '../types';
import { IProtocol } from '../types';

/**
 * [Events]
 */
export type SwarmEvent = ISwarmConnectionEvent | ISwarmPeerConnectedEvent | ISwarmErrorEvent;
export type ISwarmConnectionEvent = {
  type: 'SWARM/connection';
  payload: { peer: IProtocol };
};
export type ISwarmPeerConnectedEvent = {
  type: 'SWARM/peerConnected';
  payload: { peerKey: Buffer; isAuthorized: boolean };
};
export type ISwarmErrorEvent = {
  type: 'SWARM/error';
  payload: { error: Error };
};
