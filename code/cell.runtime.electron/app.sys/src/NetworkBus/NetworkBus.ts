import { NetworkBus as NetworkBusCore } from '@platform/cell.runtime/lib/NetworkBus';
import { t, env } from '../common';

/**
 * Derives a network bus from the environment.
 */
export function NetworkBus<E extends t.Event>() {
  const network = env?.network;

  if (typeof network !== 'object')
    throw new Error('[env] network pump not provided by preload script.');

  const { local, remotes } = network;
  const pump = network.pump as unknown as t.NetworkPump<E>;

  return NetworkBusCore<E>({ pump, local, remotes });
}
