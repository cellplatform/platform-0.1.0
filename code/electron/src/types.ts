import { IpcClient, IpcMessage } from './helpers/ipc/types';
import { ILog, IMainLog } from './helpers/logger/types';
import { IStoreClient, StoreJson } from './helpers/store/types';
import { DevTools } from './helpers/devTools/renderer';
import { IWindows } from './helpers/windows/types';

export * from './renderer/types';
export * from './main/types';

export {
  IStoreClient,
  IMainStoreClient,
  StoreJson,
} from './helpers/store/types';

export { IpcMessage } from './helpers/ipc/types';
export { IWindows, IWindowRef } from './helpers/windows/types';

export { ILog, IMainLog, IpcClient };
export type ProcessType = 'MAIN' | 'RENDERER';

export type IContext<M extends IpcMessage = any, S extends StoreJson = any> = {
  id: number;
  ipc: IpcClient<M>;
  store: IStoreClient<S>;
  log: ILog;
};

export type IRendererContext<
  M extends IpcMessage = any,
  S extends StoreJson = any
> = IContext<M, S> & {
  devTools: DevTools;
  windows: IWindows;
};

/**
 * Events
 */
export { SystemEvents } from './helpers/types';
