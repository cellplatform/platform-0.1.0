import { BrowserWindow, ipcMain } from 'electron';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { WindowsMain } from '../windows';
import {
  Client,
  HandlerRegistered,
  IpcClient,
  IpcEvent,
  IpcMessage,
  IpcRegisterHandlerEvent,
  SendDelegate,
} from './Client';
import { IpcIdentifier, IpcGlobalMainRefs } from './types';

export { IpcClient };
export * from './types';
type HandlerRef = {
  type: IpcMessage['type'];
  clients: IpcIdentifier[];
};

type Refs = IpcGlobalMainRefs['_ipcRefs'];
const refs: Refs = { handlers: {} };
((global as unknown) as IpcGlobalMainRefs)._ipcRefs = refs;

/**
 * Observable wrapper for the electron IPC [main] process.
 */
export const init = <M extends IpcMessage>(args: {} = {}): IpcClient<M> => {
  if (refs.client) {
    return refs.client; // Already initialized.
  }

  const stop$ = new Subject();
  const events$ = new Subject<IpcEvent>();

  const sendHandler: SendDelegate = (channel, ...args) => {
    sendToWindows(0, args[0] as IpcEvent);
  };

  const onHandlerRegistered: HandlerRegistered = args => {
    const { type, client } = args;
    addHandlerRef({ type, client });
  };

  // Construct the [Main] client.
  const client = new Client({
    process: 'MAIN',
    onSend: sendHandler,
    events$: events$.pipe(takeUntil(stop$)),
    onHandlerRegistered,
    getHandlerRefs: () => refs.handlers,
  });
  refs.client = client;

  // Ferry IPC events into the client.
  const listener = (sys: Electron.Event, e: IpcEvent) => events$.next(e);
  ipcMain.on(client.channel, listener);

  // Unwire events when client is diposed.
  client.disposed$.subscribe(() => stop());
  const stop = () => {
    stop$.next();
    ipcMain.removeListener(client.channel, listener);
  };

  /**
   * Listen for messages coming in on the [main] IPC channel.
   */
  ipcMain.on(client.channel, (sys: Electron.Event, e: IpcEvent) => {
    sendToWindows(sys.sender.id, e);
  });

  /**
   * Ferry messages to all [renderer] windows.
   */
  const sendToWindows = (senderId: number, e: IpcEvent) => {
    const target = Client.asTarget(e.targets);

    // - Do not send the message back to the originating window.
    // - If a target was set, only send to that window.
    BrowserWindow.getAllWindows()
      .filter(window => window.id !== senderId)
      .filter(window =>
        target.length === 0 ? true : target.includes(window.id),
      )
      .forEach(window => {
        window.webContents.send(client.channel, e);
      });
  };

  /**
   * Listen for handler registrations on client-windows and ferry
   * then onto the global registration manager.
   */
  client
    .on<IpcRegisterHandlerEvent>('@platform/IPC/register-handler')
    .subscribe(e => {
      const type = e.payload.type;
      const client = e.sender;
      onHandlerRegistered({ type, client });
    });

  /**
   * Monitor browser-windows.
   */
  const windows = new WindowsMain();
  windows.change$
    // Listen for browser-windows closing and unregister their handlers.
    .pipe(filter(e => e.type === 'CLOSED'))
    .subscribe(e => removeHandlerRef(e.window.id));

  // Finish up.
  return client;
};

/**
 * INTERNAL
 */

function addHandlerRef(args: {
  type: IpcMessage['type'];
  client: IpcIdentifier;
}) {
  const { type, client } = args;
  const handlerRef: HandlerRef = refs.handlers[type] || { type, clients: [] };
  const exists = handlerRef.clients.find(c => c.id === client.id);
  if (!exists) {
    handlerRef.clients = [...handlerRef.clients, client];
  }
  refs.handlers = { ...refs.handlers, [type]: handlerRef };
}

function removeHandlerRef(id: number) {
  let changed = false;
  let handlers = { ...refs.handlers };

  Object.keys(handlers).forEach(type => {
    const ref = { ...handlers[type] };
    const clients = ref.clients.filter(item => item.id !== id);
    if (clients.length !== ref.clients.length) {
      changed = true;
      ref.clients = clients;
      handlers = { ...handlers, [type]: ref };
    }
  });

  refs.handlers = handlers;
  return changed;
}
