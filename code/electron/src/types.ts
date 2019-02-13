import { IpcClient, IpcMessage } from './helpers/ipc/types';
import { ILog, IMainLog } from './helpers/logger/types';
import { IStoreClient, StoreJson } from './helpers/store/types';

export * from './renderer/types';

export {
  IStoreClient,
  IMainStoreClient,
  StoreJson,
} from './helpers/store/types';

export { IpcMessage } from './helpers/ipc/types';

export { ILog, IMainLog, IpcClient };
export type ProcessType = 'MAIN' | 'RENDERER';

export type IContext<M extends IpcMessage = any, S extends StoreJson = any> = {
  id: number;
  ipc: IpcClient<M>;
  store: IStoreClient<S>;
  log: ILog;
};

/**
 * Events
 */
export { SystemEvents } from './helpers/types';
