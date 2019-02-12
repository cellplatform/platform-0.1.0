import { Observable } from 'rxjs';

/**
 * [Client]
 * An abstract representation of the configuration store
 * that works on either the [main] or [renderer] processes.
 */
export type IStoreClient<T extends StoreJson = {}> = {
  // events$: Observable<StoreEvents>;

  values: <K extends keyof T>(...keys: K[]) => Promise<Partial<T>>;

  get: <K extends keyof T>(
    key: K,
    defaultValue?: T[K],
  ) => Promise<T[K] | undefined>;

  set: <K extends keyof T>(key: K, value: T[K]) => IStoreClient<T>;
  delete: <K extends keyof T>(key: K) => IStoreClient<T>;
};

export type StoreValue = boolean | number | string | object | StoreJson;
export type StoreJson = {
  [key: string]: StoreValue | StoreValue[] | undefined;
};

/**
 * [Deletages]
 */
export type GetStoreValues<T extends StoreJson> = (
  keys: Array<keyof T>,
) => Promise<StoreJson>;

/**
 * [Events].
 */
export type StoreEvents = StoreChangeEvent | StoreGetEvent;
export type StoreChangeEvent = {
  type: '@platform/STORE/change';
  payload: {};
};

export type StoreGetEvent = {
  type: '@platform/STORE/get';
  payload: {
    key: string;
  };
};
