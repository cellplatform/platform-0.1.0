import { t } from './common';

/**
 * Network
 */
export type PeerStatus = {
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
  peer: { self: t.PeerId; remote: t.PeerId };
  id: t.PeerConnectionId;
  uri: t.PeerConnectionUri;
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
