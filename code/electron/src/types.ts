import { ILog } from '@platform/log/lib/types';
import { IpcClient } from './helpers/ipc';

export { ILog };
export type ProcessType = 'MAIN' | 'RENDERER';

export type IContext = {
  ipc: IpcClient;
  log: ILog;
};

/**
 * Events
 */
import { LoggerEvents } from './helpers/logger/types';
import { DevToolEvents } from './helpers/devTools/types';
export { LoggerEvents, DevToolEvents };
export type SystemEvents = LoggerEvents | DevToolEvents;
