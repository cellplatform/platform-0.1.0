import { Observable } from 'rxjs';

/**
 * [Client]
 * An abstract representation of the configuration store
 * that works on either the [main] or [renderer] processes.
 */
export type IStoreClient<T extends StoreJson = any> = {
  change$: Observable<IStoreChange>;

  read: (...keys: Array<keyof T>) => Promise<Partial<T>>;
  write: (...values: Array<IStoreKeyValue<T>>) => Promise<IStoreSetValuesResponse>;

  keys: () => Promise<Array<keyof T>>;
  get: <V extends StoreValue>(key: keyof T, defaultValue?: V) => Promise<V>;
  set: <K extends keyof T>(key: K, value: T[K]) => Promise<T[K]>;
  delete: <K extends keyof T>(...keys: K[]) => Promise<{}>;
  clear: () => Promise<{}>;
  openInEditor: () => IStoreClient<T>;
};

export type IStoreKeyValue<T extends StoreJson = any> = {
  key: keyof T;
  value: T[keyof T] | undefined;
};

export type StoreValue = boolean | number | string | object | StoreJson;
export type StoreJson = {
  [key: string]: StoreValue | StoreValue[] | undefined;
};

export type IStoreFile = {
  version: number;
  body: StoreJson;
};

/**
 * The store client with extended [main] properties.
 */
export type IMainStoreClient<T extends StoreJson = any> = IStoreClient<T> & {
  path: string;
};

/**
 * [Deletages]
 */
export type StoreSetAction = 'UPDATE' | 'DELETE';

export type GetStoreValues<T extends StoreJson> = (keys: Array<keyof T>) => Promise<StoreJson>;

export type SetStoreValues<T extends StoreJson> = (
  keys: Array<IStoreKeyValue<T>>,
  action: StoreSetAction,
) => Promise<IStoreSetValuesResponse>;

export type GetStoreKeys<T extends StoreJson> = () => Promise<Array<keyof T>>;

export type OpenStoreInEditor = () => void;

/**
 * [Events].
 */
export type StoreEvents =
  | IStoreChangeEvent
  | IStoreGetKeysEvent
  | IStoreGetValuesEvent
  | IStoreSetValuesEvent
  | IOpenStoreFileInEditorEvent;

export type IStoreChange = {
  keys: string[];
  values: StoreJson;
  action: StoreSetAction;
};
export type IStoreChangeEvent = {
  type: '@platform/STORE/change';
  payload: IStoreChange;
};

export type IStoreGetKeysEvent = {
  type: '@platform/STORE/keys';
  payload: {};
};

export type IStoreGetValuesEvent = {
  type: '@platform/STORE/get';
  payload: { keys: string[] };
};
export type IStoreGetValuesResponse = {
  ok: boolean;
  exists: boolean;
  version: number;
  body: StoreJson;
  error?: string;
};

export type IStoreSetValuesEvent = {
  type: '@platform/STORE/set';
  payload: { values: IStoreKeyValue[]; action: StoreSetAction };
};
export type IStoreSetValuesResponse<T extends StoreJson = any> = {
  ok: boolean;
  error?: string;
};

export type IOpenStoreFileInEditorEvent = {
  type: '@platform/STORE/openInEditor';
  payload: {};
};
