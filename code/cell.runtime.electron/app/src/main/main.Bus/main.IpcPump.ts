import { ipcMain } from 'electron';
import { constants, RuntimeUri, t } from '../common';

/**
 * An event-pump for passing messages over an
 * Electron IPC ("inter-process communications") network transport.
 *
 * Refs:
 *    https://www.electronjs.org/docs/api/ipc-main
 *
 */
export function IpcPump<E extends t.Event>(args: { bus: t.ElectronMainBus }) {
  const { bus } = args;
  const sender = RuntimeUri.main;

  const broadcast = (targets: t.ElectronUri[], data: t.Event) => {
    targets = targets.filter((uri) => uri !== RuntimeUri.main);
    if (targets.length > 0 && typeof data === 'object') {
      // NB: See the [Window.Controller] that catches this event
      //     and ferries the wrapped child event out to all windows.
      bus.fire({
        type: 'runtime.electron/ipc/msg',
        payload: { sender, targets, data },
      });
    }
  };

  const pump: t.NetworkPump<E> = {
    /**
     * Recieve incoming event messages from windows.
     */
    in: (main) => {
      ipcMain.on(constants.IPC.CHANNEL, (ipc, event: t.IpcEvent) => {
        if (event.type === 'runtime.electron/ipc/msg') {
          const targets = event.payload.targets;
          const data = event.payload.data as E;
          broadcast(targets, data); // NB: ferry over to windows.
          if (targets.includes(RuntimeUri.main)) main(data);
        }
      });
    },

    /**
     * Broadcast event to windows.
     */
    out: (e) => broadcast(e.targets, e.event),
  };

  return pump;
}
