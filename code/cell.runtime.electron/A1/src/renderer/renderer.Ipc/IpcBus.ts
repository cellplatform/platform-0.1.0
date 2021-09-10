import { NetworkBus, NetworkBusMock } from '@platform/cell.runtime/lib/NetworkBus';

import { log } from '@platform/log/lib/client';
import { env } from '../common/env';
import * as t from '../common/types';

const factory: t.IpcBusFactory = <E extends t.Event = t.Event>() => {
  if (!IpcBus.is.available) {
    // Return a mock when not running within electron.
    log.warn(`[env] Not electron. IpcBus not active (mock returned)`);
    return NetworkBusMock<E>();
  }

  const network = env?.network;
  if (typeof network !== 'object') {
    const err = new Error('[env] network pump not provided by preload script.');
    throw err;
  }

  const { local, remotes } = network;
  const pump = network.pump as unknown as t.NetworkPump<E>;
  return NetworkBus<E>({ pump, local, remotes });
};

const is: t.IpcBus['is'] = {
  /**
   * Safely check the environment to determine if the Electron
   * IPC bus "pump hooks" are available.
   *
   * Return:
   *  - true:    on Electron and can use the bus.
   *  - false:   running somewhere other than Electron.
   */
  get available() {
    return typeof env?.network === 'object';
  },
};

/**
 * Export
 */
(factory as t.IpcBus).is = is;
export const IpcBus = factory as t.IpcBus;
