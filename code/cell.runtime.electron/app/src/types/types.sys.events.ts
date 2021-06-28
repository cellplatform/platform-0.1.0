import { t } from './common';
import { IpcEvent } from './types.sys.ipc';
import { ElectronModuleEvent } from 'sys.runtime.electron/lib/types';

/**
 * Event bus for the electron runtime.
 */
export type ElectronMainBus = t.EventBus<t.ElectronRuntimeEvent>;

/**
 * Union of all [cell.runtime.electron] events.
 */
export type ElectronRuntimeEvent = IpcEvent | ElectronModuleEvent;
