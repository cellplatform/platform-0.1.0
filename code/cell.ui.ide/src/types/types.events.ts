import { t } from './common';

/**
 * Events
 */
type GlobalEvent = t.EnvEvent | t.IpcEvent | t.UiEvent;
export type AppEvent = GlobalEvent | IIdeChanged | IIdeErrorEvent;

/**
 * Changed
 */
export type IIdeChanged = {
  type: 'APP:IDE/changed';
  payload: t.IStateChange<t.IAppState, t.AppEvent>;
};

/**
 * Error
 */
export type IIdeErrorEvent = {
  type: 'APP:IDE/error';
  payload: IIdeError;
};
export type IIdeError = { error: t.IErrorInfo; component?: t.IErrorComponent };
