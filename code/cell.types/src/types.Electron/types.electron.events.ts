import { t } from '../common';

/**
 * Events (Electron "IPC")
 */
export type IpcEvent = IpcSheetChangedEvent;

export type IpcSheetChangedEvent = {
  type: 'IPC/sheet/changed';
  payload: IpcSheetChanged;
};

export type IpcSheetChanged = {
  ns: string;
  changes: t.ITypedSheetChanges;
  source: 'MAIN' | string;
};
