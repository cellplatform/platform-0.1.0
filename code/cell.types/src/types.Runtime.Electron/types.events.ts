import {
  BundleEvent,
  FilesystemEvent,
  LogEvent,
  MenuEvent,
  SystemEvent,
  WindowEvent,
} from './types.modules';

/**
 * Union of all [module] events.
 */
export type ElectronModuleEvent =
  | WindowEvent
  | LogEvent
  | BundleEvent
  | FilesystemEvent
  | SystemEvent
  | MenuEvent;
