import { LoggerEvents } from './logger/types';
import { DevToolEvents } from './devTools/types';
import { SettingsEvent } from './settings/types';
import { IpcClient } from './ipc/types';
import { WindowsEvent, IWindows } from './windows/types';

export { IpcClient, IWindows };
export { IContext, ILog, IWindowTag } from '../types';

export type SystemEvents = LoggerEvents | DevToolEvents | SettingsEvent | WindowsEvent;
export type IpcInternal = IpcClient<SystemEvents>;
