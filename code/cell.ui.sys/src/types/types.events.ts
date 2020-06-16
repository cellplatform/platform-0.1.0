import { t } from './common';

/**
 * Events
 */
type GlobalEvent = t.EnvEvent | t.IpcEvent;
export type AppEvent = GlobalEvent | ISysChanged | ISysErrorEvent;

/**
 * Changed
 */
export type ISysChanged = {
  type: 'APP:SYS/changed';
  payload: t.IStateChange<t.IAppState, t.AppEvent>;
};

/**
 * Error
 */
export type ISysErrorEvent = {
  type: 'APP:SYS/error';
  payload: ISpreadsheetError;
};
export type ISpreadsheetError = {
  error: t.IErrorInfo;
  component?: t.IErrorComponent;
};
