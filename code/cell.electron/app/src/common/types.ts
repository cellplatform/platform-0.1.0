export * from '@platform/log/lib/types';
export * from '@platform/cell.types';

export * from '../types';

import * as t from '../types';
import {
  ITypedSheet,
  ITypedSheetRow,
  ITypedSheetRefs,
  IClientTypesystem,
  ITypedSheetChangeCellDiff,
} from '@platform/cell.types';

export type IAppCtx = {
  host: string;
  client: IClientTypesystem;
  sheet: ITypedSheet<t.SysApp>;
  app: ITypedSheetRow<t.SysApp>;
  windows: ITypedSheetRefs<t.SysAppWindow>;
  windowDefs: ITypedSheetRefs<t.SysAppWindowDef>;
  windowRefs: IWindowRef[];
};

export type IWindowRef = {
  uri: string;
  send<T>(channel: string, payload: T): void;
};

/**
 * Events (IPC)
 */

export type IpcEvent = IpcWindowChangedEvent;

export type IpcWindowChangedEvent = {
  type: 'WINDOW/changed';
  payload: IpcWindowChanged;
};

export type IpcWindowChanged = {
  window: string; // uri.
  changes: { [key: string]: ITypedSheetChangeCellDiff };
};
