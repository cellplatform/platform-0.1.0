import { t } from './common';

type PlaceholderObject = Record<string, undefined>;

/**
 * Events
 */
type GlobalEvent = t.EnvEvent | t.IpcEvent | t.UiEvent | t.EditorEvent;
export type AppEvent =
  | GlobalEvent
  | IIdeChanged
  | IIdeErrorEvent
  | IIdeUriEvent
  | IIdeLoadEvent
  | IIdePullTypesEvent
  | IIdeTypeDataEvent
  | IIdeTypesClearEvent
  | IIdeTextEvent;

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
export type IIdeLoadEvent = { type: 'APP:IDE/load'; payload: IIdeLoad };
export type IIdeLoad = { uri: string };

export type IIdeUriEvent = { type: 'APP:IDE/uri'; payload: IIdeUri };
export type IIdeUri = { uri: string };

/**
 * Content
 */
export type IIdeTextEvent = { type: 'APP:IDE/text'; payload: IIdeText }; // Updates the text within the code-editor.
export type IIdeText = { text: string };

/**
 * Types
 */
export type IIdePullTypesEvent = { type: 'APP:IDE/types/pull'; payload: IIdePullTypes };
export type IIdePullTypes = { uri: string };

export type IIdeTypesClearEvent = { type: 'APP:IDE/types/clear'; payload: IIdeTypesClear };
export type IIdeTypesClear = PlaceholderObject;

export type IIdeTypeDataEvent = { type: 'APP:IDE/types/data'; payload: IIdeTypeData };
export type IIdeTypeData = { defs: t.INsTypeDef[]; ts: string };

/**
 * Error
 */
export type IIdeErrorEvent = { type: 'APP:IDE/error'; payload: IIdeError };
export type IIdeError = { error: t.IErrorInfo; component?: t.IErrorComponent };
