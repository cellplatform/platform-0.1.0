import { ipcRenderer as ipc } from 'electron';
import { NetworkPump } from '@platform/cell.types/lib/types.Bus/types.NetworkPump';
import { IpcEvent, IpcMessageEvent, IpcSystemReqEvent } from '../types/types.events.ipc';

type Uri = string;
type O = Record<string, unknown>;
type Event = { type: string; payload: O };

export function IpcTransport(args: { self: Uri; channel: string }) {
  const { channel } = args;
  const sender = args.self;

  let uris: Uri[] = [];
  ipc.on(channel, (ipc, event: IpcEvent) => {
    if (event.type === 'runtime.electron/ipc/sys:res') {
      uris = [event.payload.main, ...event.payload.windows];
    }
  });

  const pump: NetworkPump<Event> = {
    /**
     * Recieve incoming event messages from windows.
     */
    in: (fn) => {
      ipc.on(channel, (ipc, event: IpcEvent) => {
        if (event.type === 'runtime.electron/ipc/msg') fn(event.payload.data);
      });
    },

    /**
     * Broadcast event to windows.
     */
    out: (e) => {
      const { targets, event: data } = e;
      const event: IpcMessageEvent = {
        type: 'runtime.electron/ipc/msg',
        payload: { sender, targets, data },
      };
      ipc.send(channel, event);
    },
  };

  const get = {
    local: async () => args.self,
    remotes: async () => uris.filter((uri) => uri !== args.self),
  };

  /**
   * Initialize.
   */
  const event: IpcSystemReqEvent = { type: 'runtime.electron/ipc/sys:req', payload: { sender } };
  ipc.send(channel, event);

  /**
   * Finish up.
   */
  return { pump, get };
}
