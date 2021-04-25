import { t } from './common';

/**
 * Network
 */
export type PeerStatus = {
  id: t.PeerId;
  isOnline: boolean;
  createdAt: number;
  signal: t.PeerSignallingEndpoint;
  connections: t.PeerConnectionStatus[];
};

/**
 * Connection
 */
export type PeerConnectionStatus = PeerConnectionDataStatus | PeerConnectionMediaStatus;

type PeerConnectionBase = {
  peer: { self: t.PeerId; remote: { id: t.PeerId; module: t.PeerModule } };
  id: t.PeerConnectionId;
  uri: t.PeerConnectionUri;
  direction: t.PeerConnectDirection;
  parent?: t.PeerConnectionId;
};

export type PeerConnectionDataStatus = PeerConnectionBase & {
  kind: 'data';
  isReliable: boolean;
  isOpen: boolean;
  metadata?: t.PeerConnectionMetadataData;
};

export type PeerConnectionMediaStatus = PeerConnectionBase & {
  kind: 'media/screen' | 'media/video';
  isOpen: boolean;
  media?: MediaStream;
  metadata?: t.PeerConnectionMetadataMedia;
};
