import { Observable } from 'rxjs';
import { IJsonMap } from '@platform/types';

/**
 * [Client]
 * An abstract representation of the configuration settings
 * that works on either the [main] or [renderer] processes.
 */
export type ISettingsClient<T extends SettingsJson = any> = {
  change$: Observable<ISettingsChange>;

  read: (...keys: Array<keyof T>) => Promise<Partial<T>>;
  write: (...values: Array<ISettingsKeyValue<T>>) => Promise<ISettingsSetValuesResponse>;

  keys: () => Promise<Array<keyof T>>;
  get: <K extends keyof T>(key: K, defaultValue?: T[K]) => Promise<T[K]>;
  set: <K extends keyof T>(key: K, value: T[K]) => Promise<T[K]>;
  delete: <K extends keyof T>(...keys: K[]) => Promise<{}>;
  clear: () => Promise<{}>;
  openInEditor: () => ISettingsClient<T>;
};

export type ISettingsKeyValue<T extends SettingsJson = any> = {
  key: keyof T;
  value: T[keyof T] | undefined;
};

export type SettingsJson = IJsonMap;

export type ISettingsFile = {
  version: number;
  body: SettingsJson;
};

/**
 * The settings client with extended [main] properties.
 */
export type IMainSettingsClient<T extends SettingsJson = any> = ISettingsClient<T> & {
  path: string;
};

/**
 * [Deletages]
 */
export type SettingsSetAction = 'UPDATE' | 'DELETE';

export type GetSettingsValues<T extends SettingsJson> = (
  keys: Array<keyof T>,
) => Promise<SettingsJson>;

export type SetSettingsValues<T extends SettingsJson> = (
  keys: Array<ISettingsKeyValue<T>>,
  action: SettingsSetAction,
) => Promise<ISettingsSetValuesResponse>;

export type GetSettingsKeys<T extends SettingsJson> = () => Promise<Array<keyof T>>;

export type OpenSettingsInEditor = () => void;

/**
 * [Events].
 */
export type SettingsEvent =
  | ISettingsChangeEvent
  | ISettingsGetKeysEvent
  | ISettingsGetValuesEvent
  | ISettingsSetValuesEvent
  | IOpenSettingsFileInEditorEvent;

export type ISettingsChange = {
  keys: string[];
  values: SettingsJson;
  action: SettingsSetAction;
};
export type ISettingsChangeEvent = {
  type: '@platform/SETTINGS/change';
  payload: ISettingsChange;
};

export type ISettingsGetKeysEvent = {
  type: '@platform/SETTINGS/keys';
  payload: {};
};

export type ISettingsGetValuesEvent = {
  type: '@platform/SETTINGS/get';
  payload: { keys: string[] };
};
export type ISettingsGetValuesResponse = {
  ok: boolean;
  exists: boolean;
  version: number;
  body: SettingsJson;
  error?: string;
};

export type ISettingsSetValuesEvent = {
  type: '@platform/SETTINGS/set';
  payload: { values: ISettingsKeyValue[]; action: SettingsSetAction };
};
export type ISettingsSetValuesResponse<T extends SettingsJson = any> = {
  ok: boolean;
  error?: string;
};

export type IOpenSettingsFileInEditorEvent = {
  type: '@platform/SETTINGS/openInEditor';
  payload: {};
};
