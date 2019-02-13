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
import { Global } from './main.Global';
import { IpcHandlerRef, IpcIdentifier } from './types';
import { GLOBAL } from '../constants';

export * from './types';

type Refs = { main?: IpcClient };
const refs: Refs = {};

/**
 * Observable wrapper for the electron IPC [main] process.
 */
export const init = <M extends IpcMessage>(args: {} = {}): IpcClient<M> => {
  if (refs.main) {
    return refs.main; // Already initialized.
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
  const main = new Client({
    process: 'MAIN',
    onSend: sendHandler,
    events$: events$.pipe(takeUntil(stop$)),
    onHandlerRegistered,
    getHandlerRefs: () => Global.handlerRefs,
  });
  refs.main = main;

  // Ferry IPC events into the client.
  const listener = (e: Electron.Event, args: IpcEvent) => events$.next(args);
  ipcMain.on(main.channel, listener);

  // Unwire events when client is diposed.
  main.disposed$.subscribe(() => stop());
  const stop = () => {
    stop$.next();
    ipcMain.removeListener(main.channel, listener);
  };

  /**
   * Listen for messages coming in on the [main] IPC channel.
   */
  ipcMain.on(main.channel, (e: Electron.Event, args: IpcEvent) => {
    sendToWindows(e.sender.id, args);
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
        window.webContents.send(main.channel, e);
      });
  };

  /**
   * Listen for handler registrations on client-windows and ferry
   * then onto the global registration manager.
   */
  main
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
  return main;
};

/**
 * INTERNAL
 */

/**
 * Echo's the ID of the sender of an event.
 */
ipcMain.on(GLOBAL.IPC.ID.REQUEST, async (e: Electron.Event) => {
  const id = e.sender.id;
  e.sender.send(GLOBAL.IPC.ID.RESPONSE, { id });
});

/**
 * Adds a reference to a handler to the global object.
 */
function addHandlerRef(args: {
  type: IpcMessage['type'];
  client: IpcIdentifier;
}) {
  const { type, client } = args;
  const handlerRef: IpcHandlerRef = Global.handlerRefs[type] || {
    type,
    clients: [],
  };
  const exists = handlerRef.clients.find(c => c.id === client.id);
  if (!exists) {
    handlerRef.clients = [...handlerRef.clients, client];
  }
  Global.setHandlerRef(handlerRef);
}

/**
 * Removes a handler ref rom the global object.
 */
function removeHandlerRef(id: number) {
  let changed = false;
  let handlers = { ...Global.handlerRefs };

  Object.keys(handlers).forEach(type => {
    const ref = { ...handlers[type] };
    const clients = ref.clients.filter(item => item.id !== id);
    if (clients.length !== ref.clients.length) {
      changed = true;
      ref.clients = clients;
      handlers = { ...handlers, [type]: ref };
    }
  });

  Global.handlerRefs = handlers;
  return changed;
}
