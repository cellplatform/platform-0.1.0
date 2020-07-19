import { t } from '../common';

export type IpcEventSource = 'MAIN' | string;

/**
 * Events (Electron "IPC")
 */
export type IpcEvent = IpcSheetChangedEvent | IpcDebugEvent;

export type IpcSheetChangedEvent = {
  type: 'IPC/sheet/changed';
  payload: IpcSheetChanged;
};
export type IpcSheetChanged = {
  changes: t.ITypedSheetChanges;
  source: IpcEventSource;
};

export type IpcDebugEvent = {
  type: 'IPC/debug';
  payload: IpcDebug;
};
export type IpcDebug = {
  source: IpcEventSource;
  data: any;
};
