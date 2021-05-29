type Uri = string;
import { NetworkPump } from '@platform/cell.types/lib/types.Bus/types.NetworkPump';

/**
 * Environment configuration passed in from the secure [preload] script.
 */
export type Env = {
  self: Uri;
  runtime: string;
  ipc: {
    pump: NetworkPump<any>;
    get: { local: () => Promise<string>; remotes: () => Promise<string[]> };
  };
};
