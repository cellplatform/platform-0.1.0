import { NetworkPump } from '../types.Bus/types.NetworkPump';

type Uri = string;
type O = Record<string, unknown>;
type Event = { type: string; payload: O };

/**
 * Key used to store the [env] on the [window] object.
 */
export type ElectronEnvKey = 'cell.runtime.electron';

/**
 * Base environment provided to the "secure sandbox"
 * by the preload script.
 */
export type ElectronEnv = {
  self: Uri;
  runtime: string;
  network: ElectronEnvTransport;
};

/**
 * Base functions required to initialize a [NetworkBus].
 */
export type ElectronEnvTransport = {
  pump: NetworkPump<Event>;
  local: () => Promise<Uri>;
  remotes: () => Promise<Uri[]>;
};
