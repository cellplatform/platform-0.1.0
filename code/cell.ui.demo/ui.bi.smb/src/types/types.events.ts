import { t } from './common';

import { FinderEvent } from '@platform/cell.ui.finder/lib/types';

/**
 * Events
 */
type GlobalEvent = t.EnvEvent | t.IpcEvent | t.UiEvent | FinderEvent;
export type AppEvent = GlobalEvent | IAppChanged | IAppErrorEvent;

/**
 * Changed
 */
export type IAppChanged = {
  type: 'APP:ui.bi.smb/changed';
  payload: t.IStateChange<t.IAppState, t.AppEvent>;
};

/**
 * Error
 */
export type IAppErrorEvent = {
  type: 'APP:ui.bi.smb/error';
  payload: IIdeError;
};
export type IIdeError = { error: t.IErrorInfo; component?: t.IErrorComponent };
