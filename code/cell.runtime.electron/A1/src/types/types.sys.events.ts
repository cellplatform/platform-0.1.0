import { t } from './common';
import { IpcEvent } from './types.sys.ipc';
import { ElectronModuleEvent } from '@platform/cell.types/lib/types.Runtime.Electron';

/**
 * Event bus for the electron runtime.
 */
export type ElectronMainBus = t.EventBus<t.ElectronRuntimeEvent>;

/**
 * Union of all [cell.runtime.electron] events.
 */
export type ElectronRuntimeEvent = IpcEvent | ElectronModuleEvent;
