import { NetworkPump } from '../types.Bus/types.NetworkPump';

type Uri = string;
type O = Record<string, unknown>;
type Event = { type: string; payload: O };

export type ElectronEnv = {
  self: Uri;
  runtime: string;
  network: ElectronEnvTransport;
};

export type ElectronEnvTransport = {
  pump: NetworkPump<Event>;
  local: () => Promise<Uri>;
  remotes: () => Promise<Uri[]>;
};
