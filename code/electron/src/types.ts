import { IpcClient } from './helpers/types';
import { ILog, IMainLog } from './helpers/logger/types';

export { ILog, IMainLog };
export type ProcessType = 'MAIN' | 'RENDERER';

export type IContext = {
  ipc: IpcClient;
  log: ILog;
};

/**
 * Events
 */
export { SystemEvents } from './helpers/types';
