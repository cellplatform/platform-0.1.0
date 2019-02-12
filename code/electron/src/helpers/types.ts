import { LoggerEvents } from './logger/types';
import { DevToolEvents } from './devTools/types';
import { StoreEvents } from './store/types';
import { IpcClient } from './ipc/types';

export { IpcClient };
export { IContext } from '../types';

export type SystemEvents = LoggerEvents | DevToolEvents | StoreEvents;
export type IpcInternal = IpcClient<SystemEvents>;
