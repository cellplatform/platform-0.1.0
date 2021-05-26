import { t, NetworkBus, RuntimeUri } from '../common';
import { ipcMain } from 'electron';
import { Window } from '../main.Window';

/**
 * An event-bus distributed across a number of electron windows
 * using the IPC (inter-process communication) transport.
 *
 * Refs:
 *    https://www.electronjs.org/docs/api/ipc-main
 */
export function IpcNetworkBus<E extends t.Event>(args: { bus: t.ElectronRuntimeBus }) {
  console.log('IpcNetworkBus', IpcNetworkBus);
  const { bus } = args;

  const events = {
    window: Window.Events({ bus }),
  };

  const pump: t.NetworkPump<E> = {
    in: (fn) => {
      // fn()
      // data.in$.pipe(map((e) => e.data as E)).subscribe(fn);
      console.log('in', fn);
    },
    out: (e) => {
      const { targets, event } = e;
      if (targets.length > 0) {
        bus.fire({
          type: 'runtime.electron/window/ipc/send',
          payload: { targets, event },
        });
      }
    },
  };

  const netbus = NetworkBus<E>({
    pump,
    local: async () => RuntimeUri.main,
    remotes: async () => (await events.window.status.get()).map(({ uri }) => uri),
  });

  return netbus;
}
