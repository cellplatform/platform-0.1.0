export * from '../../types';
import { IProtocol, IPeer } from '../../types';

/**
 * [Configuration]
 */
export type ISwarmOptions = {
  id: string;
  stream: (peer: IPeer) => IProtocol;
  utp: boolean;
  tcp: boolean;
  maxConnections: number;
  whitelist: string[];
};

/**
 * [Connections]
 */
export type ISwarmConnections = {
  total: number;
  peers: ISwarmConnectionPeer[];
};
export type ISwarmConnectionPeer = {
  id: string;
  isAuthorized: boolean;
};

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
