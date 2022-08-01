import { Subject } from 'rxjs';
import { t } from '../common';

export type LocalStorageChange<T extends t.JsonMap> =
  | LocalStoragePut<T>
  | LocalStorageDelete<T>
  | LocalStorageClear;
export type LocalStoragePut<T extends t.JsonMap> = { kind: 'put'; key: keyof T; value: t.Json };
export type LocalStorageDelete<T extends t.JsonMap> = { kind: 'delete'; key: keyof T };
export type LocalStorageClear = { kind: 'clear' };

/**
 * Helper for working with a strongly typed local-storage object.
 */
export function LocalStorage<T extends t.JsonMap>(prefix: string) {
  prefix = prefix.replace(/\/$/, '');
  const toKey = (name: keyof T) => `${prefix}/${String(name)}`;

  const changed$ = new Subject<LocalStorageChange<T>>();
  const next = (payload: LocalStorageChange<T>) => changed$.next(payload);

  const local = {
    prefix,
    changed$: changed$.asObservable(),

    get<K extends keyof T>(key: K, defaultValue: T[K]) {
      const value = localStorage.getItem(toKey(key));
      if (value === null) return defaultValue;
      return JSON.parse(value).value as T[K];
    },

    put<K extends keyof T>(key: K, value: T[K]) {
      const json = JSON.stringify({ value });
      localStorage.setItem(toKey(key), json);
      next({ kind: 'put', key, value });
      return value;
    },

    delete<K extends keyof T>(key: K) {
      localStorage.removeItem(toKey(key));
      next({ kind: 'delete', key });
    },

    clear() {
      Object.keys(localStorage).forEach((key) => local.delete(key));
      next({ kind: 'clear' });
    },

    object(initial: T): T {
      const obj = {} as T;
      Object.keys(initial).forEach((key) => {
        Object.defineProperty(obj, key, {
          get: () => local.get(key, initial[key] as any),
          set: (value) => local.put(key, value),
          enumerable: true,
        });
      });
      return obj;
    },
  };

  return local;
}
