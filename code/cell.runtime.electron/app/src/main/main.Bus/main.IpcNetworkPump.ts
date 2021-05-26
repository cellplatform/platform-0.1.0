import { t, NetworkBus, RuntimeUri } from '../common';
import { ipcMain } from 'electron';
import { Window } from '../main.Window';

/**
 * An event-pump for passing messages over an
 * Electron IPC ("inter-process communications") network transport.
 *
 * Refs:
 *    https://www.electronjs.org/docs/api/ipc-main
 */
export function IpcNetworkPump<E extends t.Event>(args: { bus: t.EventBus<t.ElectronEvent> }) {
  const { bus } = args;

  console.log('IpcNetworkPump', IpcNetworkPump);

  const pump: t.NetworkPump<E> = {
    in: (fn) => {
      // fn()
      // data.in$.pipe(map((e) => e.data as E)).subscribe(fn);
      console.log('pump/in', fn); // TODO 🐷
    },
    out: (e) => {
      const { targets, event } = e;
      if (targets.length > 0) {
        /**
         * Broadcast event to renderers.
         */
        bus.fire({
          type: 'runtime.electron/window/ipc/send',
          payload: { targets, event },
        });
      }
    },
  };

  return pump;
}
