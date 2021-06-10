import { t } from './common';

import { IpcEvent } from './types.sys.events.ipc';
import { WindowEvent, LogEvent, BundleEvent, SystemEvent, MenuEvent } from './types.modules';

/**
 * Event bus for the electron runtime.
 */
export type ElectronMainBus = t.EventBus<t.ElectronRuntimeEvent>;

/**
 * Union of all [module] events.
 */
export type ElectronModuleEvent = WindowEvent | LogEvent | BundleEvent | SystemEvent | MenuEvent;

/**
 * Union of all [cell.runtime.electron] events.
 */
export type ElectronRuntimeEvent = IpcEvent | ElectronModuleEvent;
