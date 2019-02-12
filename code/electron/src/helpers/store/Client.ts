import { IStoreClient, IStoreObject, StoreObjectValue } from './types';

// https://github.com/sindresorhus/electron-store/blob/ca19e10477fb4518e09ca1832a1f4911166bd460/index.js#L26
// openInEditor() {
//   electron.shell.openItem(this.path);
// }

/**
 * An abstract representation of the configuration store
 * that works on either the [main] or [renderer] processes.
 */
export class Client<T extends IStoreObject = {}> implements IStoreClient<T> {
  /**
   * [Constructor]
   */
  constructor() {
    return;
  }

  /**
   * Retrieves the value at the given key from storage.
   */
  public async get<K extends keyof T>(key: K, defaultValue?: T[K]) {
    return undefined;
  }

  /**
   * Saves the given value.
   */
  public set<K extends keyof T>(key: K, value: T[K]) {
    return this;
  }

  /**
   * Deletes the given key.
   */
  public delete<K extends keyof T>(key: K) {
    return this;
  }
}
