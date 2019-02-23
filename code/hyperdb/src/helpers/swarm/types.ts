import { Observable } from 'rxjs';
import { IPeer, IProtocol } from '../../types';

export * from '../../types';

/**
 * [Initialization]
 */
export type ISwarmConfig = {
  id: string;
  stream: (peer: IPeer) => IProtocol;
  utp: boolean;
  tcp: boolean;
  maxConnections: number;
  whitelist: string[];
  dns: {
    server: string[];
    domain: string;
  };
  dht: {
    bootstrap: string[];
  };
};

/**
 * [Swarm]
 */
export type ISwarm = {
  readonly dbKey: string;
  readonly events$: Observable<SwarmEvent>;
  readonly config: ISwarmConfig;
  readonly isActive: boolean;
  readonly isDisposed: boolean;
  join(): Promise<{}>;
  leave(): void;
  connections(): Promise<ISwarmConnections>;
  dispose(): void;
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
  payload: { dbKey: string; peer: IProtocol };
};
export type ISwarmPeerAuthorizedEvent = {
  type: 'SWARM/peer/authorized';
  payload: { dbKey: string; peerKey: Buffer; isAuthorized: true };
};
export type ISwarmJoinEvent = {
  type: 'SWARM/join';
  payload: { dbKey: string };
};
export type ISwarmLeaveEvent = {
  type: 'SWARM/leave';
  payload: { dbKey: string };
};

export type ISwarmErrorEvent = {
  type: 'SWARM/error';
  payload: { dbKey: string; error: Error };
};
