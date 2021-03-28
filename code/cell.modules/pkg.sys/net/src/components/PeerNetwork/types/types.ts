export type PeerConnectDirection = 'incoming' | 'outgoing';

export type PeerNetworkError = { message: string };

export type PeerNetworkSignalEndpoint = {
  host: string;
  port: number;
  path?: string;
  secure: boolean;
};
