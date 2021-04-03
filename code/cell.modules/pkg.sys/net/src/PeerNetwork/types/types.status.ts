import { t } from './common';

/**
 * Network
 */
export type PeerNetworkStatus = {
  id: t.PeerId;
  createdAt: number;
  signal: t.PeerSignallingEndpoint;
  connections: t.PeerConnectionStatus[];
  isOnline: boolean;
};

/**
 * Connection
 */
export type PeerConnectionStatus = PeerConnectionDataStatus | PeerConnectionMediaStatus;

type PeerConnectionBase = {
  id: { self: t.PeerId; remote: t.PeerId };
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
