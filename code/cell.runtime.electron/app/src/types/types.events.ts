import { t } from './common';

import { WindowEvent } from '../main/main.Window/types';
import { IpcEvent } from './types.events.ipc';

/**
 * Event bus for the electron runtime.
 */
export type ElectronRuntimeBus = t.EventBus<t.ElectronRuntimeEvent>;

/**
 * Union of all [cell.runtime.electron] events.
 */
export type ElectronRuntimeEvent = WindowEvent | IpcEvent;
