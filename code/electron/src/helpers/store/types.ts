/**
 * An abstract representation of the configuration store
 * that works on either the [main] or [renderer] processes.
 */
export type IStoreClient<T extends IStoreObject = {}> = {
  get: <K extends keyof T>(
    key: K,
    defaultValue?: T[K],
  ) => Promise<T[K] | undefined>;

  set: <K extends keyof T>(key: K, value: T[K]) => IStoreClient<T>;
  delete: <K extends keyof T>(key: K) => IStoreClient<T>;
};

export type StoreValue = boolean | number | string | object | IStoreObject;
export type StoreObjectValue = StoreValue | StoreValue[];
export type IStoreObject = {
  [key: string]: StoreObjectValue;
};

/**
 * IPC Events.
 */
export type StoreEvents = StoreChangeEvent;
export type StoreChangeEvent = {
  type: '.SYS/STORE/change';
  payload: {};
};
