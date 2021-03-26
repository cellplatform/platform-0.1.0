import { t } from './common';

/**
 * Network
 */
export type PeerNetworkStatus = {
  id: string;
  createdAt: number;
  signal: t.PeerNetworkSignalEndpoint;
  connections: t.PeerConnectionStatus[];
};

/**
 * Connection
 */
export type PeerConnectionStatus = PeerConnectionDataStatus | PeerConnectionMediaStatus;

type PeerConnectionBase = { id: { local: string; remote: string } };

export type PeerConnectionDataStatus = PeerConnectionBase & {
  kind: 'data';
  isReliable: boolean;
  isOpen: boolean;
};

export type PeerConnectionMediaStatus = PeerConnectionBase & {
  kind: 'media';
};
