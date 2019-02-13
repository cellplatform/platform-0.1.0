import { DevToolsRenderer } from '../helpers/devTools/renderer';
import { init as initIpc, IpcClient } from '../helpers/ipc/renderer';
import { ILog, init as initLog } from '../helpers/logger/renderer';
import { init as initStore, StoreJson } from '../helpers/store/renderer';
import * as t from '../types';

export * from '../types';

type Refs = {
  ipc?: t.IpcClient;
  store?: t.IStoreClient;
  log?: t.ILog;
  devTools: DevToolsRenderer;
};
const refs: Refs = { devTools: new DevToolsRenderer() };

export type IInitRendererResponse<
  M extends t.IpcMessage,
  S extends t.StoreJson
> = {
  ipc: t.IpcClient<M>;
  store: t.IStoreClient<S>;
  log: t.ILog;
};

/**
 * Initializes [Main] process systems (safely).
 */
export function init<
  M extends t.IpcMessage = any,
  S extends t.StoreJson = any
>(): IInitRendererResponse<M, S> {
  // Ipc.
  const ipc = initIpc<M>();
  refs.ipc = ipc;

  // Log.
  const log = initLog({ ipc });

  // Store.
  const store = initStore<S>({ ipc });
  refs.store = store;

  // Dev tools.
  refs.devTools.init({ ipc });

  // Finish up.
  return { ipc, store, log };
}
