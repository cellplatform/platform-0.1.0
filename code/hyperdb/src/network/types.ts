export type NetworkStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

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
export type NetworkEvent = INetworkConnectionEvent|INetworkDataEvent;

export type INetworkConnectionEvent = {
  type: 'NETWORK/connection';
  payload: {
    status: NetworkStatus;
    isConnected: boolean;
    db: { key: string; localKey: string };
    connection?: INetworkConnectionInfo;
  };
};

export type INetworkDataEvent = {
  type: 'NETWORK/data';
  payload: {
    db: { key: string; localKey: string };
  };
};
