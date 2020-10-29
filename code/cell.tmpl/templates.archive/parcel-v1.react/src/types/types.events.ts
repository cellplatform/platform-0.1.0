import { t } from './common';

/**
 * Events
 */
type GlobalEvent = t.EnvEvent | t.IpcEvent | t.UiEvent;
export type AppEvent = GlobalEvent | IAppChanged | IAppErrorEvent;

/**
 * Changed
 */
export type IAppChanged = {
  type: 'APP:__NAME__/changed';
  payload: t.IStateChange<t.IAppState, t.AppEvent>;
};

/**
 * Error
 */
export type IAppErrorEvent = {
  type: 'APP:__NAME__/error';
  payload: IIdeError;
};
export type IIdeError = { error: t.IErrorInfo; component?: t.IErrorComponent };
