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
    getValues: t.GetStoreValues<T>;
    setValues: t.SetStoreValues<T>;
  }) {
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
    return (await this._setValues(values)) as t.IStoreSetValuesResponse<T>;
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
