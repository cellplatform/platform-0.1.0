import { ipcMain as ipc } from 'electron';

import { RuntimeUri, t } from '../common';
import { WindowRef } from './types';

/**
 * Helpers for working with the "system information" IPC channel.
 */
export function IpcSysInfo(args: { channel: string; getRefs: () => WindowRef[] }) {
  const { channel } = args;

  const sys = {
    /**
     * Broadcast the current system state to all windows.
     */
    broadcast(options: { targets?: t.RuntimeUri[] } = {}) {
      const { targets } = options;
      const refs = args.getRefs();
      const windows = refs.map((ref) => ref.uri);
      const event: t.IpcSystemResEvent = {
        type: 'runtime.electron/ipc/sys:res',
        payload: { main: RuntimeUri.main, windows },
      };
      refs
        .filter((ref) => (targets ? targets.includes(ref.uri) : true))
        .forEach(({ browser }) => browser.webContents.send(channel, event));
      return sys;
    },

    /**
     * Listen to the IPC channel for incoming requests.
     */
    listen() {
      ipc.on(channel, (ipc, event: t.IpcEvent) => {
        if (event.type === 'runtime.electron/ipc/sys:req') {
          const targets = [event.payload.sender];
          sys.broadcast({ targets });
        }
      });

      return sys;
    },
  };

  return sys;
}
