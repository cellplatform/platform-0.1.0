export * from '@platform/log/lib/types';
export * from '@platform/cell.types';

export * from '../types';

import * as t from '../types';
import {
  ITypedSheet,
  IClientTypesystem,
  ITypedSheetStateChanges,
  ITypedSheetData,
} from '@platform/cell.types';

export type IContext = {
  host: string;
  client: IClientTypesystem;
  sheet: ITypedSheet<t.App>;
  apps: ITypedSheetData<t.App>;
  windowRefs: IWindowRef[];
};

export type IWindowRef = {
  uri: string;
  send<T>(channel: string, payload: T): void;
};

/**
 * Events (IPC)
 */

export type IpcEvent = IpcSheetChangedEvent;

export type IpcSheetChangedEvent = {
  type: 'IPC/sheet/changed';
  payload: IpcSheetChanged;
};

export type IpcSheetChanged = {
  ns: string;
  changes: ITypedSheetStateChanges;
};
