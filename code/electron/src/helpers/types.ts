import { LoggerEvents } from './logger/types';
import { DevToolEvents } from './devTools/types';
import { StoreEvents } from './store/types';
import { IpcClient } from './ipc/types';
import { WindowsEvents } from './windows/types';

export { IpcClient };
export { IContext, ILog, IWindowTag } from '../types';

export type SystemEvents = LoggerEvents | DevToolEvents | StoreEvents | WindowsEvents;

export type IpcInternal = IpcClient<SystemEvents>;
