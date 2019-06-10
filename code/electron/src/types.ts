import { IpcClient, IpcMessage } from './helpers/ipc/types';
import { ILog, IMainLog } from './helpers/logger/types';
import { IStoreClient, StoreJson } from './helpers/store/types';
import { DevTools } from './helpers/devTools/renderer';
import { IWindows } from './helpers/windows/types';

export * from './renderer/types';
export * from './main/types';
export * from './helpers/screen/main/types';

export { IStoreClient, IMainStoreClient, StoreJson } from './helpers/store/types';

export { IpcMessage } from './helpers/ipc/types';
export { IWindows, IWindowsState, IWindowRef, IWindowTag } from './helpers/windows/types';

export { ILog, IMainLog, IpcClient };
export type ProcessType = 'MAIN' | 'RENDERER';

export type IContext<M extends IpcMessage = any, S extends StoreJson = any> = {
  id: number;
  ipc: IpcClient<M>;
  store: IStoreClient<S>;
  log: ILog;
  windows: IWindows;
};

export type IRendererContext<M extends IpcMessage = any, S extends StoreJson = any> = IContext<
  M,
  S
> & {
  devTools: DevTools;
  remote: Electron.Remote;
};

/**
 * Events
 */
export { SystemEvents } from './helpers/types';
