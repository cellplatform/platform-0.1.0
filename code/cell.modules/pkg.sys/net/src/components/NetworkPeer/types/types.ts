import { t } from './common';

export type PeerSignalEndpoint = { host: string; port: number; path?: string; secure: boolean };

export type PeerStatus = {
  id: string;
  createdAt: number;
  signal: t.PeerSignalEndpoint;
};
