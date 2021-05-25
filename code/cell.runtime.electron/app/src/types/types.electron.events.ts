import { t } from './common';

export type IpcEventSource = 'MAIN' | string;

/**
 * [Events]
 */
export type IpcEvent = IpcDataEvent;

export type IpcDataEvent = {
  type: 'cell.runtime.electron/data';
  payload: IpcData;
};

export type IpcData = {
  data: any;
};

/**
 * OLD
 */
export type IpcEvent_OLD = IpcSheetChangedEvent__OLD | IpcDebugEvent__OLD;

export type IpcSheetChangedEvent__OLD = {
  type: 'IPC/sheet/changed';
  payload: IpcSheetChanged;
};
export type IpcSheetChanged = {
  changes: t.ITypedSheetChanges;
  source: IpcEventSource;
};

export type IpcDebugEvent__OLD = {
  type: 'IPC/debug';
  payload: IpcDebug;
};
export type IpcDebug = {
  source: IpcEventSource;
  data: any;
};
