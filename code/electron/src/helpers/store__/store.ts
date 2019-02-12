import { Subject, Observable } from 'rxjs';
import { share, filter, map } from 'rxjs/operators';

import {
  ElectronStore as ElectronStoreBase,
  ElectronStoreOptions,
  JsonValue,
} from './types';

const Base = require('electron-store');

export type ElectronStore<T = {}> = ElectronStoreBase<T> & {
  events$: Observable<StoreEvent>;
  changes$: Observable<IStoreChangeEvent<T>>;
};

export type StoreEvent<T = {}> = IStoreChangeEvent<T> | IStoreClearedEvent;

export type IStoreChangeEvent<T = {}> = {
  type: 'CHANGE';
  key: keyof T | string;
  path: string;
  from: JsonValue | undefined;
  to: JsonValue | undefined;
};

export type IStoreClearedEvent = {
  type: 'CLEARED';
};

/**
 * Create a new electron store.
 */
export function create<T = {}>(options?: ElectronStoreOptions<T>) {
  const store = new Store(options) as unknown;
  return store as ElectronStore<T>;
}

/**
 * Extended store with an observable for changes.
 */
export class Store<T = {}> extends Base {
  private _events$: Subject<StoreEvent<T>>;
  public readonly events$: Observable<StoreEvent<T>>;
  public readonly changes$: Observable<IStoreChangeEvent<T>>;

  constructor(options?: ElectronStoreOptions<T>) {
    super(options);
    this._events$ = new Subject<StoreEvent<T>>();
    this.events$ = this._events$.pipe(share());
    this.changes$ = this.events$.pipe(
      filter(e => e.type === 'CHANGE'),
      map(e => e as IStoreChangeEvent<T>),
    );
  }

  public set<K extends keyof T>(key: K, value: T[K]): void {
    const e = toChangeEvent<T>(key, this.get(key), value);
    super.set(key, value);
    if (e.from !== e.to) {
      this._events$.next(e);
    }
  }

  public delete(key: keyof T | string): void {
    const e = toChangeEvent<T>(key, this.get(key), undefined);
    super.delete(key);
    if (e.from !== e.to) {
      this._events$.next(e);
    }
  }

  public clear(): void {
    super.clear();
    this._events$.next({ type: 'CLEARED' });
  }
}

/**
 * INTERNAL
 */

function toChangeEvent<T>(
  key: string | keyof T,
  from: unknown,
  to: unknown,
): IStoreChangeEvent<T> {
  let path = key as string;
  const index = path.lastIndexOf('.');
  path = index > -1 ? path.substr(index + 1) : path;
  return {
    type: 'CHANGE',
    key,
    path,
    from: from as JsonValue,
    to: to as JsonValue,
  };
}
