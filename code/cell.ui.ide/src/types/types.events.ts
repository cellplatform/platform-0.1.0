import { t } from './common';

/**
 * Events
 */
type GlobalEvent = t.EnvEvent | t.IpcEvent | t.UiEvent;
export type AppEvent =
  | GlobalEvent
  | IIdeChanged
  | IIdeErrorEvent
  | IIdeUriEvent
  | IIdeLoadEvent
  | IIdePullTypesEvent
  | IIdeTypeDataEvent
  | IIdeTypesUnloadEvent;

/**
 * Changed
 */
export type IIdeChanged = {
  type: 'APP:IDE/changed';
  payload: t.IStateChange<t.IAppState, t.AppEvent>;
};

/**
 * Initialization
 */

export type IIdeLoadEvent = {
  type: 'APP:IDE/load';
  payload: IIdeLoad;
};
export type IIdeLoad = { uri: string };

export type IIdeUriEvent = {
  type: 'APP:IDE/uri';
  payload: IIdeUri;
};
export type IIdeUri = { uri: string };

export type IIdePullTypesEvent = {
  type: 'APP:IDE/types/pull';
  payload: IIdePullTypes;
};
export type IIdePullTypes = { uri: string };

export type IIdeTypeDataEvent = {
  type: 'APP:IDE/types/data';
  payload: IIdeTypeData;
};
export type IIdeTypeData = { defs: t.INsTypeDef[]; ts: string };

export type IIdeTypesUnloadEvent = {
  type: 'APP:IDE/types/unload';
  payload: IIdeTypesUnload;
};
export type IIdeTypesUnload = {};

/**
 * Error
 */
export type IIdeErrorEvent = {
  type: 'APP:IDE/error';
  payload: IIdeError;
};
export type IIdeError = { error: t.IErrorInfo; component?: t.IErrorComponent };
