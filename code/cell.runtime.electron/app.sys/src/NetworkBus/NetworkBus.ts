import { NetworkBus as NetworkBusCore } from '@platform/cell.runtime/lib/NetworkBus';
import { t, env } from '../common';

/**
 * Derives a network bus from the environment.
 */
export function NetworkBus<E extends t.Event>() {
  const ipc = env?.ipc;

  if (typeof ipc !== 'object')
    throw new Error('[env] IPC network pump not provided by preload script.');

  const { get, pump } = ipc;
  const { local, remotes } = get;
  return NetworkBusCore<E>({ pump, local, remotes });
}
