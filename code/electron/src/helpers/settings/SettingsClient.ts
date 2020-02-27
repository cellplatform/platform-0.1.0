import { equals } from 'ramda';
import { Observable, Subject } from 'rxjs';
import { share, takeUntil, distinctUntilChanged } from 'rxjs/operators';

import * as t from './types';

export type ISettingsClientArgs<T extends t.SettingsJson = {}> = {
  change$: Subject<t.ISettingsChange>;
  getKeys: t.GetSettingsKeys<T>;
  getValues: t.GetSettingsValues<T>;
  setValues: t.SetSettingsValues<T>;
  openInEditor: t.OpenSettings;
  openFolder: t.OpenSettings;
  namespace: string;
};

/**
 * An abstract representation of the configuration settings store
 * that works on either the [main] or [renderer] processes.
 */
export class SettingsClient<T extends t.SettingsJson = {}> implements t.ISettingsClient<T> {
  /**
   * [Fields]
   */
  private readonly _args: ISettingsClientArgs<T>;
  private readonly _dispose$ = new Subject();
  public readonly dispose$ = this._dispose$.pipe(share());
  public readonly change$: Observable<t.ISettingsChange<T>>;

  /**
   * [Lifecycle]
   */
  constructor(args: ISettingsClientArgs<T>) {
    this._args = args;
    this.change$ = args.change$.pipe(
      takeUntil(this.dispose$),
      distinctUntilChanged((prev, next) => equals(prev, next)),
      share(),
    );
  }

  /**
   * Disposes of the client.
   */
  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  /**
   * [Methods]
   */

  /**
   * Retrieves an object with values for the given keys.
   * Pass no keys to retrieve all values.
   */
  public async read(...keys: (keyof T)[]) {
    keys = formatKeys<T>({ keys, namespace: this._args.namespace });
    return (await this._args.getValues(keys)) as Partial<T>;
  }

  /**
   * Writes values to disk.
   */
  public async write(...values: t.ISettingsKeyValue<T>[]) {
    values = formatValues({ values, namespace: this._args.namespace });
    const res = await this._args.setValues(values, 'UPDATE');
    return res as t.ISettingsSetValuesResponse<T>;
  }

  /**
   * Retrieves all available keys.
   */
  public async keys(): Promise<(keyof T)[]> {
    return this._args.getKeys();
  }

  /**
   * Retrieves the value at the given key from storage.
   */
  public async get<K extends keyof T>(key: K, defaultValue?: T[K]) {
    const k = formatKey<T>({ key, namespace: this._args.namespace });
    const res = await this.read(key);
    const value = res[k] === undefined ? defaultValue : res[k];
    return value as T[K];
  }

  /**
   * Saves the given value.
   */
  public async put<K extends keyof T>(key: K, value: T[K]) {
    await this.write({ key, value });
    return value;
  }

  /**
   * Deletes the given key(s).
   */
  public async delete<K extends keyof T>(...keys: (keyof T)[]) {
    keys = formatKeys<T>({ keys, namespace: this._args.namespace });
    const values = keys.map(key => ({ key, value: undefined }));
    await this._args.setValues(values, 'DELETE');
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

  /**
   * Opens the settings JSON in an external editor.
   */
  public openInEditor() {
    this._args.openInEditor();
    return this;
  }

  /**
   * Opens the folder containing the settings JSON.
   */
  public openFolder() {
    this._args.openFolder();
    return this;
  }

  /**
   * Retrives a clone of the that prefixes keys with the given namespace.
   */
  public namespace(namespace: string) {
    const args = { ...this._args, namespace };
    return new SettingsClient<T>(args);
  }
}

/**
 * [Helpers]
 */

function formatKey<T extends t.SettingsJson = {}>(args: { key: keyof T; namespace: string }) {
  const namespace = (args.namespace || '').trim();
  let key = args.key.toString();
  if (namespace) {
    const prefix = `${namespace}:`;
    key = key.replace(new RegExp(`^${prefix}`), '');
    key = namespace ? `${prefix}${key}` : key;
  }
  return key as keyof T;
}

function formatKeys<T extends t.SettingsJson = {}>(args: { keys: (keyof T)[]; namespace: string }) {
  const namespace = args.namespace;
  return args.keys.map(key => formatKey<T>({ key, namespace }));
}

function formatValues<T extends t.SettingsJson = {}>(args: {
  values: t.ISettingsKeyValue<T>[];
  namespace: string;
}) {
  const namespace = args.namespace;
  return args.values.map(item => ({
    key: formatKey<T>({ key: item.key, namespace }),
    value: item.value,
  }));
}
