import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GLOBAL } from '../constants';
import { IPC, GetHandlerRefs, HandlerRegistered, IpcClient } from './Client';
import { IpcEvent, IpcMessage, IpcRegisterHandlerEvent } from './types';

export * from './types';
export { IpcClient };
const electron = (window as any).require('electron');
const ipcRenderer = electron.ipcRenderer as Electron.IpcRenderer;
const remote = electron.remote as Electron.Remote;

/**
 * Observable wrapper for the electron IPC [Renderer].
 */
export async function init<M extends IpcMessage>(
  args: { id?: number } = {},
): Promise<IpcClient<M>> {
  /**
   * HACK:  Ensure multiple clients are not initialized on HMR (hot-module-reloads).
   *        This will only happen during development.
   */
  const global: any = window;
  if (global[GLOBAL.IPC_CLIENT]) {
    return global[GLOBAL.IPC_CLIENT];
  }

  const stop$ = new Subject();
  const events$ = new Subject<IpcEvent>();
  const id = args.id === undefined ? await getId() : args.id;

  /**
   * Store references to event-handlers as they are registered.
   */
  const onHandlerRegistered: HandlerRegistered = args => {
    client.send<IpcRegisterHandlerEvent>('@platform/IPC/register-handler', {
      type: args.type,
      stage: 'CREATE',
    });
  };

  const getHandlerRefs: GetHandlerRefs = () => {
    return remote.getGlobal(GLOBAL.IPC_HANDLERS) || {};
  };

  /**
   * Construct the [Renderer] client.
   */
  const client = new IPC({
    id,
    process: 'RENDERER',
    events$: events$.pipe(takeUntil(stop$)),
    onSend: ipcRenderer.send,
    onHandlerRegistered,
    getHandlerRefs,
  });

  /**
   * Ferry IPC events into the client.
   */
  const listener = (e: Electron.Event, args: IpcEvent) => events$.next(args);
  ipcRenderer.on(client.channel, listener);

  /**
   * Unwire events when client is disposed.
   */
  client.disposed$.subscribe(() => stop());
  const stop = () => {
    stop$.next();
    ipcRenderer.removeListener(client.channel, listener);
  };

  // Finish up.
  global[GLOBAL.IPC_CLIENT] = client;
  return client;
}

/**
 * Retrieves the ID of the current window.
 */
export function getId() {
  return new Promise<number>((resolve, reject) => {
    ipcRenderer.send(GLOBAL.IPC.ID.REQUEST);
    ipcRenderer.on(
      GLOBAL.IPC.ID.RESPONSE,
      (e: Electron.Event, args: { id?: number } = {}) => {
        const id = args.id === undefined ? -1 : args.id;
        resolve(id);
      },
    );
  });
}
