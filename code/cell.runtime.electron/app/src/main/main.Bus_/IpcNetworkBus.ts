import { t, NetworkBus } from '../common';
import { ipcMain } from 'electron';

/**
 * An event-bus distributed across a number of electron windows
 * using the IPC (inter-process communication) transport.
 *
 * Refs:
 *    https://www.electronjs.org/docs/api/ipc-main
 */
export function IpcNetworkBus<E extends t.Event>() {
  console.log('IpcNetworkBus', IpcNetworkBus);
  //

  const pump: t.NetworkPump<E> = {
    in: (fn) => {
      // fn()
      // data.in$.pipe(map((e) => e.data as E)).subscribe(fn);
      console.log('in', fn);
    },
    out: (e) => {
      console.log('out', e);
      // data.send(e.event, { targets: e.targets });
      // ipcMain.
      // ipcMain.
    },
  };

  const netbus = NetworkBus<E>({
    pump,
    local: async () => {
      // Uri.peer.create(self);
      return 'main';
    },
    remotes: async () => {
      return ['window-1', 'window-2'];
      // const uri = Uri.connection.create;
      // return connections.map((conn) => uri(conn.kind, conn.peer.remote.id, conn.id));
    },
  });

  return netbus;
}
