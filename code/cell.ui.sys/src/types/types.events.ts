import { t } from './common';

/**
 * Events
 */
type GlobalEvent = t.EnvEvent | t.IpcEvent;
export type AppEvent = GlobalEvent | ISysChanged | ISysErrorEvent | ISysOverlayEvent;

/**
 * Changed
 */
export type ISysChanged = {
  type: 'APP:SYS/changed';
  payload: t.IStateChange<t.IAppState, t.AppEvent>;
};

/**
 * Views
 */

export type ISysOverlayEvent = {
  type: 'APP:SYS/overlay';
  payload: ISysOverlay;
};
export type ISysOverlay = {
  overlay?: t.IAppStateOverlay;
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
