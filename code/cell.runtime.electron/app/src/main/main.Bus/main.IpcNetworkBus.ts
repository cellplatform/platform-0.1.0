import { t, NetworkBus, RuntimeUri } from '../common';
import { ipcMain } from 'electron';
import { Window } from '../main.Window';

import { IpcNetworkPump } from './main.IpcNetworkPump';

/**
 * An event-bus distributed across a number of electron windows
 * using the IPC (inter-process communication) transport.
 *
 * Refs:
 *    https://www.electronjs.org/docs/api/ipc-main
 */
export function IpcNetworkBus<E extends t.Event>(args: { bus: t.EventBus<t.ElectronEvent> }) {
  const { bus } = args;

  const windowEvents = Window.Events({ bus });
  const pump = IpcNetworkPump<E>({ bus });

  const netbus = NetworkBus<E>({
    pump,
    local: async () => RuntimeUri.main,
    remotes: async () => (await windowEvents.status.get()).windows.map(({ uri }) => uri),
  });

  return netbus;
}
