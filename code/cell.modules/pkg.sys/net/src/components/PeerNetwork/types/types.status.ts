import { t } from './common';

/**
 * Network
 */
export type PeerNetworkStatus = {
  id: string;
  createdAt: number;
  signal: t.PeerNetworkSignalEndpoint;
  connections: t.PeerConnectionStatus[];
  media: { video?: MediaStream; screen?: MediaStream };
};

/**
 * Connection
 */
export type PeerConnectionStatus = PeerConnectionDataStatus | PeerConnectionMediaStatus;

type PeerConnectionBase = {
  id: { local: string; remote: string };
  metadata?: t.JsonMap;
};

export type PeerConnectionDataStatus = PeerConnectionBase & {
  kind: 'data';
  isReliable: boolean;
  isOpen: boolean;
};

export type PeerConnectionMediaStatus = PeerConnectionBase & {
  kind: 'media';
  isOpen: boolean;
  media: MediaStream;
};
