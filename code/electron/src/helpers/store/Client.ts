import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import * as t from './types';

/**
 * https://github.com/sindresorhus/electron-store/blob/ca19e10477fb4518e09ca1832a1f4911166bd460/index.js#L26
 *
 * open in editor [MAIN]
 *    electron.shell.openItem(this.path);
 *
 */

type Refs = {};

/**
 * An abstract representation of the configuration store
 * that works on either the [main] or [renderer] processes.
 */
export class Client<T extends t.StoreJson = {}> implements t.IStoreClient<T> {
  /**
   * [Fields]
   */
  private readonly _getKeys: t.GetStoreKeys<T>;
  private readonly _getValues: t.GetStoreValues<T>;
  private readonly _setValues: t.SetStoreValues<T>;

  private readonly _dispose$ = new Subject();
  public readonly dispose$ = this._dispose$.pipe(share());
  public isDisposed = false;

  // private readonly _events$ = new Subject<types.StoreEvents>();
  // public readonly events$ = this._events$.pipe(
  //   takeUntil(this.dispose$),
  //   share(),
  // );

  /**
   * [Constructor]
   */
  constructor(args: {
    getKeys: t.GetStoreKeys<T>;
    getValues: t.GetStoreValues<T>;
    setValues: t.SetStoreValues<T>;
  }) {
    this._getKeys = args.getKeys;
    this._getValues = args.getValues;
    this._setValues = args.setValues;
    this.dispose$.subscribe(() => (this.isDisposed = true));
  }

  /**
   * Disposes of the client.
   */
  public dispose() {
    this.dispose();
  }

  /**
   * Retrieves an object with values for the given keys.
   * Pass no keys to retrieve all values.
   */
  public async read(...keys: Array<keyof T>) {
    return (await this._getValues(keys)) as Partial<T>;
  }

  /**
   * Writes values to disk.
   */
  public async write(...values: Array<t.IStoreKeyValue<T>>) {
    const res = await this._setValues(values, 'UPDATE');
    return res as t.IStoreSetValuesResponse<T>;
  }

  /**
   * Retrieves all available keys.
   */
  public async keys(): Promise<Array<keyof T>> {
    return this._getKeys();
  }

  /**
   * Retrieves the value at the given key from storage.
   */
  public async get<V extends t.StoreValue>(key: keyof T, defaultValue?: V) {
    const res = await this.read(key);
    const value = res[key] === undefined ? defaultValue : res[key];
    return value as V;
  }

  /**
   * Saves the given value.
   */
  public async set<K extends keyof T>(key: K, value: T[K]) {
    await this.write({ key, value });
    return value;
  }

  /**
   * Deletes the given key(s).
   */
  public async delete<K extends keyof T>(...keys: K[]) {
    const values = keys.map(key => ({ key, value: undefined }));
    await this._setValues(values, 'DELETE');
    return {};
  }

  /**
   * Clears all keys.
   */
  public async clear() {
    const keys = await this.keys();
    if (keys.length > 0) {
      await this.delete(...keys);
    }
    return {};
  }
}
