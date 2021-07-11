import { NetworkBus, RuntimeUri, t } from '../common';
import { Window } from '../main.Window';
import { IpcPump } from './IpcPump';

/**
 * An event-bus distributed across a number of electron windows
 * using the IPC (inter-process communication) transport.
 *
 * Refs:
 *    https://www.electronjs.org/docs/api/ipc-main
 */
export function IpcBus<E extends t.Event>(args: { bus: t.ElectronMainBus }) {
  const { bus } = args;

  const events = Window.Events({ bus });
  const pump = IpcPump<E>({ bus });

  const netbus = NetworkBus<E>({
    pump,
    local: async () => RuntimeUri.main,
    remotes: async () => (await events.status.get()).windows.map(({ uri }) => uri),
  });

  return netbus;
}
