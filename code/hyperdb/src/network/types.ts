import { Observable } from 'rxjs';

export type NetworkStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

export type INetwork = INetworkProps &
  INetworkMethods & {
    events$: Observable<NetworkEvent>;
    dispose(): void;
    ready: Promise<{}>;
  };

export type INetworkProps = {
  isDisposed: boolean;
  topic: string;
  status: NetworkStatus;
  isConnected: boolean;
  connection: INetworkConnectionInfo | undefined;
  db: { key: string; localKey: string };
};

export type INetworkMethods = {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  toString(): string;
};

export type INetworkConnectionInfo = {
  type: 'tcp' | 'utp';
  client: boolean;
  peer?: INetworkPeer;
};

export type INetworkPeer = {
  port: number;
  host: string;
  local: boolean;
  referrer: INetworkReferrer;
  topic: string;
};

export type INetworkReferrer = { port: number; host: string; id: string };

/**
 * [Events]
 */
export type NetworkEvent = INetworkConnectionEvent | INetworkDataEvent;

export type INetworkConnectionEvent = {
  type: 'NETWORK/connection';
  payload: {
    db: { key: string; localKey: string };
    status: NetworkStatus;
    isConnected: boolean;
    connection?: INetworkConnectionInfo;
  };
};

export type INetworkDataEvent = {
  type: 'NETWORK/data';
  payload: {
    db: { key: string; localKey: string };
  };
};
