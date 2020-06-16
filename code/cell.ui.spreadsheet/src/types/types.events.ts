import { t } from './common';

/**
 * Events
 */
type GlobalEvent = t.EnvEvent | t.IpcEvent;
export type AppEvent = GlobalEvent | ISpreadsheetChanged | ISpreadsheetErrorEvent;

/**
 * Changed
 */
export type ISpreadsheetChanged = {
  type: 'APP:SHEET/changed';
  payload: t.IStateChange<t.IAppState, t.AppEvent>;
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
