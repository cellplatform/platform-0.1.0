import { t } from './common';

export type PeerMediaConstraints = t.PartialDeep<MediaStreamConstraints>;

export type PeerId = string; // An identifier of a network peer.
export type PeerConnectionId = string;

export type PeerConnectionKind = PeerConnectionKindData | PeerConnectionKindMedia;
export type PeerConnectionKindData = 'data';
export type PeerConnectionKindMedia = 'media/video' | 'media/screen';

export type PeerUri = PeerConnectionUri; // A URI identifying a network/peer resource.
export type PeerConnectionUri = string;

export type PeerConnectDirection = 'incoming' | 'outgoing';

export type PeerError = { message: string };

export type PeerSignallingEndpoint = { host: string; port: number; path?: string; secure: boolean };

export type PeerModule = { name: string; version: string };

/**
 * Filter on a peer connection.
 */
export type PeerFilter = (e: PeerFilterArgs) => boolean;
export type PeerFilterArgs = {
  peer: t.PeerId;
  connection: { id: t.PeerConnectionId; kind: t.PeerConnectionKind };
};

/**
 * Connection {metadata}.
 */
export type PeerConnectionMetadata = PeerConnectionMetadataData | PeerConnectionMetadataMedia;

export type PeerConnectionMetadataData = {
  kind: t.PeerConnectionKindData;
  module: t.PeerModule;
  userAgent: string;
  parent?: t.PeerConnectionId;
};

export type PeerConnectionMetadataMedia = {
  kind: t.PeerConnectionKindMedia;
  module: t.PeerModule;
  userAgent: string;
  constraints?: t.PeerMediaConstraints;
  parent?: t.PeerConnectionId;
};
