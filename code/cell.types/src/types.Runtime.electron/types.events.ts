import { WindowEvent, LogEvent, BundleEvent, SystemEvent, MenuEvent } from './types.modules';

/**
 * Union of all [module] events.
 */
export type ElectronModuleEvent = WindowEvent | LogEvent | BundleEvent | SystemEvent | MenuEvent;
