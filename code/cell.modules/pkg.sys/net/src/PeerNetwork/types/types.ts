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

export type PeerSignallingEndpoint = {
  host: string;
  port: number;
  path?: string;
  secure: boolean;
};

export type PeerConnectionMetadata = PeerConnectionMetadataMedia;

export type PeerConnectionMetadataMedia = {
  kind: t.PeerConnectionKindMedia;
  constraints?: t.PeerMediaConstraints;
};
