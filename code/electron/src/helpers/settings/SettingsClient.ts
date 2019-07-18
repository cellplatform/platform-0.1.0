import { equals } from 'ramda';
import { Observable, Subject } from 'rxjs';
import { share, takeUntil, distinctUntilChanged } from 'rxjs/operators';

import * as t from './types';

/**
 * An abstract representation of the configuration settings store
 * that works on either the [main] or [renderer] processes.
 */
export class SettingsClient<T extends t.SettingsJson = {}> implements t.ISettingsClient<T> {
  /**
   * [Fields]
   */
  private readonly _getKeys!: t.GetSettingsKeys<T>;
  private readonly _getValues!: t.GetSettingsValues<T>;
  private readonly _setValues!: t.SetSettingsValues<T>;
  private readonly _openInEditor!: t.OpenSettings;
  private readonly _openFolder!: t.OpenSettings;

  private readonly _dispose$ = new Subject();
  public readonly dispose$ = this._dispose$.pipe(share());
  public isDisposed = false;
  public readonly change$: Observable<t.ISettingsChange<T>>;

  /**
   * [Constructor]
   */
  constructor(args: {
    change$: Subject<t.ISettingsChange>;
    getKeys: t.GetSettingsKeys<T>;
    getValues: t.GetSettingsValues<T>;
    setValues: t.SetSettingsValues<T>;
    openInEditor: t.OpenSettings;
    openFolder: t.OpenSettings;
  }) {
    this._getKeys = args.getKeys;
    this._getValues = args.getValues;
    this._setValues = args.setValues;
    this._openInEditor = args.openInEditor;
    this._openFolder = args.openFolder;
    this.dispose$.subscribe(() => (this.isDisposed = true));
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
  public async write(...values: Array<t.ISettingsKeyValue<T>>) {
    const res = await this._setValues(values, 'UPDATE');
    return res as t.ISettingsSetValuesResponse<T>;
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
  public async get<K extends keyof T>(key: K, defaultValue?: T[K]) {
    const res = await this.read(key);
    const value = res[key] === undefined ? defaultValue : res[key];
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

  /**
   * Opens the settings JSON in an external editor.
   */
  public openInEditor() {
    this._openInEditor();
    return this;
  }

  /**
   * Opens the folder containing the settings JSON.
   */
  public openFolder() {
    this._openFolder();
    return this;
  }
}
