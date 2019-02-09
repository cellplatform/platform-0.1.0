import { LoggerEvents } from './logger/types';
import { DevToolEvents } from './devTools/types';
import { IpcClient } from './ipc';

export { IContext } from '../types';

export { IpcClient };
export type InternalEvents = LoggerEvents | DevToolEvents;
export type IpcInternal = IpcClient<InternalEvents>;
