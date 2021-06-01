import { NetworkPump } from '../types.Bus/types.NetworkPump';

type Uri = string;
type O = Record<string, unknown>;
type Event = { type: string; payload: O };

export type RuntimeDesktopEnv = {
  kind: string;
  network: RuntimeDesktopEnvTransport;
};

export type RuntimeDesktopEnvTransport = {
  pump: NetworkPump<Event>;
  local: () => Promise<Uri>;
  remotes: () => Promise<Uri[]>;
};
