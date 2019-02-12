import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Client, GetHandlerRefs, HandlerRegistered, IpcClient } from './Client';
import {
  IpcEvent,
  IpcGlobalMainRefs,
  IpcMessage,
  IpcRegisterHandlerEvent,
} from './types';

export * from './types';
export { IpcClient };

const electron = (window as any).require('electron');
const ipcRenderer = electron.ipcRenderer as Electron.IpcRenderer;
const remote = electron.remote as Electron.Remote;

const global: any = window;
const KEY = '__SYS/PLATFORM/IPC_CLIENT__';

/**
 * Observable wrapper for the electron IPC [Renderer].
 */
export function init<M extends IpcMessage>(args: {} = {}): IpcClient<M> {
  /**
   * HACK:  Ensure multiple clients are not initialized on HMR (hot-module-reloads).
   *        This will only happen during development.
   */
  if (global[KEY]) {
    return global[KEY];
  }

  const stop$ = new Subject();
  const events$ = new Subject<IpcEvent>();

  /**
   * Store references to event-handlers as they are registered.
   */
  const onHandlerRegistered: HandlerRegistered = args => {
    client.send<IpcRegisterHandlerEvent>('./SYS/IPC/register-handler', {
      type: args.type,
      stage: 'CREATE',
    });
  };

  const getHandlerRefs: GetHandlerRefs = () => {
    type Refs = IpcGlobalMainRefs['_ipcRefs'];
    const DEFAULT: Refs = { handlers: {} };
    const refs: Refs = remote.getGlobal('_ipcRefs') || DEFAULT;
    return refs.handlers;
  };

  /**
   * Construct the [Renderer] client.
   */
  const client = new Client({
    process: 'RENDERER',
    events$: events$.pipe(takeUntil(stop$)),
    onSend: ipcRenderer.send,
    onHandlerRegistered,
    getHandlerRefs,
  });

  /**
   * Ferry IPC events into the client.
   */
  const listener = (sys: Electron.Event, e: IpcEvent) => events$.next(e);
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
  global[KEY] = client;
  return client;
}
