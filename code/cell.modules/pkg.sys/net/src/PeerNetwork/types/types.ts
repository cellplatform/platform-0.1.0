import { t } from './common';

export type PeerMediaConstraints = t.PartialDeep<MediaStreamConstraints>;

export type PeerMediaKind = 'video' | 'screen';

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
  kind: t.PeerMediaKind;
  constraints?: t.PeerMediaConstraints;
};
