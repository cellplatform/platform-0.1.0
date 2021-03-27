export type PeerNetworkError = { message: string };

export type PeerNetworkSignalEndpoint = {
  host: string;
  port: number;
  path?: string;
  secure: boolean;
};
