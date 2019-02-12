import { IpcClient } from './helpers/ipc/types';
import { ILog, IMainLog } from './helpers/logger/types';

export {
  IStoreClient,
  IMainStoreClient,
  StoreJson,
} from './helpers/store/types';

export { IpcMessage } from './helpers/ipc/types';

export { ILog, IMainLog, IpcClient };
export type ProcessType = 'MAIN' | 'RENDERER';

export type IContext = {
  ipc: IpcClient;
  log: ILog;
};

/**
 * Events
 */
export { SystemEvents } from './helpers/types';
