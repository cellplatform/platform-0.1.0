import { DevToolEvents } from './helpers/devTools/types';
import { IpcClient } from './helpers/ipc';
import { ILog, IMainLog, LoggerEvents } from './helpers/logger/types';

export { ILog, IMainLog };
export type ProcessType = 'MAIN' | 'RENDERER';

export type IContext = {
  ipc: IpcClient;
  log: ILog;
};

/**
 * Events
 */
export { LoggerEvents, DevToolEvents };
export type SystemEvents = LoggerEvents | DevToolEvents;
