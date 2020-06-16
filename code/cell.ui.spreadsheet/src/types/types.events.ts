import { t } from './common';

/**
 * Events
 */
type GlobalEvent = t.EnvEvent | t.IpcEvent;
export type AppEvent =
  | GlobalEvent
  | ISpreadsheetChanged
  | ISpreadsheetErrorEvent
  | ISpreadsheetNsEvent
  | ISpreadsheetDataEvent
  | ISpreadsheetPatchEvent;

/**
 * Changed
 */
export type ISpreadsheetChanged = {
  type: 'APP:SHEET/changed';
  payload: t.IStateChange<t.IAppState, t.AppEvent>;
};

/**
 * Load
 */
export type ISpreadsheetNsEvent = {
  type: 'APP:SHEET/ns';
  payload: ISpreadsheetNs;
};
export type ISpreadsheetNs = { host: string; ns: string };

export type ISpreadsheetDataEvent = {
  type: 'APP:SHEET/data';
  payload: ISpreadsheetData;
};
export type ISpreadsheetData = {
  ns: t.INs;
  cells: t.ICellMap;
  rows: t.IRowMap;
  columns: t.IColumnMap;
};

export type ISpreadsheetPatchEvent = {
  type: 'APP:SHEET/patch';
  payload: ISpreadsheetPatch;
};
export type ISpreadsheetPatch = {
  cells?: t.ICellMap;
  rows?: t.IRowMap;
  columns?: t.IColumnMap;
};

/**
 * Error
 */
export type ISpreadsheetErrorEvent = {
  type: 'APP:SHEET/error';
  payload: ISpreadsheetError;
};
export type ISpreadsheetError = {
  error: t.IErrorInfo;
  component?: t.IErrorComponent;
};
