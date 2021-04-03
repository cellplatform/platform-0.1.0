export type PeerMediaKind = 'video' | 'screen';

export type PeerConnectDirection = 'incoming' | 'outgoing';

export type PeerError = { message: string };

export type PeerSignallingEndpoint = {
  host: string;
  port: number;
  path?: string;
  secure: boolean;
};
