import { LoggerEvents } from './logger/types';
import { DevToolEvents } from './devTools/types';
import { StoreEvents } from './store/types';
import { IpcClient } from './ipc/types';
import { WindowsEvents, IWindows } from './windows/types';

export { IpcClient, IWindows };
export { IContext, ILog, IWindowTag } from '../types';

export type SystemEvents = LoggerEvents | DevToolEvents | StoreEvents | WindowsEvents;
export type IpcInternal = IpcClient<SystemEvents>;
