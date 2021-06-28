import { NetworkBus } from '@platform/cell.runtime/lib/NetworkBus';

import { t, env } from '../common';

/**
 * Derives a [NetworkBus] from the Electron environment
 * using IPC (the "inter-process communication" transport).
 */
export function IpcBus<E extends t.Event>(): t.NetworkBus<E> {
  const network = env?.network;

  if (typeof network !== 'object')
    throw new Error('[env] network pump not provided by preload script.');

  const { local, remotes } = network;
  const pump = network.pump as unknown as t.NetworkPump<E>;

  return NetworkBus<E>({ pump, local, remotes });
}
