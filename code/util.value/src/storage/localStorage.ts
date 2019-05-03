import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import * as t from '../types';
import { is } from '../common';
import { value as valueUtil } from '../value';

/**
 * A strongly typed interface to the `localStorage` object.
 */
export function localStorage<P extends t.ILocalStorageProps<P>>(
  defaultValues: P,
  options: { provider?: t.ILocalStorageProvider } = {},
): t.ILocalStorage<P> {
  // Setup initial conditions.
  defaultValues = { ...defaultValues };
  const keys = Object.keys(defaultValues);
  const provider = options.provider || defaultStorage;

  // Observables.
  const _events$ = new Subject<t.LocalStorageEvent>();
  const events$ = _events$.pipe(share());

  const getValue = (key: keyof P | string) => {
    key = key.toString();
    const value = provider.get(key.toString());
    return value === undefined ? defaultValues[key] : value;
  };

  // LocalStorage.
  const obj = {
    $: {
      events$,
      get$: events$.pipe(
        filter(e => e.type === 'LOCAL_STORAGE/get'),
        map(e => e.payload as t.ILocalStorageGet),
      ),
      set$: events$.pipe(
        filter(e => e.type === 'LOCAL_STORAGE/set'),
        map(e => e.payload as t.ILocalStorageSet),
      ),
      delete$: events$.pipe(
        filter(e => e.type === 'LOCAL_STORAGE/delete'),
        map(e => e.payload as t.ILocalStorageDelete),
      ),
    },
    delete(key: keyof P) {
      const value = getValue(key);
      provider.delete(key.toString());
      _events$.next({ type: 'LOCAL_STORAGE/delete', payload: { key, value } });
      return obj;
    },
  };

  // Define property handlers.
  keys.forEach(key => {
    Object.defineProperty(obj, key, {
      /**
       * [GET] property value.
       */
      get() {
        const value = getValue(key);
        _events$.next({ type: 'LOCAL_STORAGE/get', payload: { key, value } });
        return value;
      },

      /**
       * [SET] property value.
       */
      set(to: any) {
        const value = { from: getValue(key), to };
        provider.set(key.toString(), to);
        _events$.next({ type: 'LOCAL_STORAGE/set', payload: { key, value } });
      },
    });
  });

  // Finish up.
  return obj as t.ILocalStorage<P>;
}

/**
 * [Helpers]
 */
const defaultStorage: t.ILocalStorageProvider = {
  get(key: string) {
    try {
      const json = is.browser ? window.localStorage.getItem(key) : undefined;
      const value = json ? JSON.parse(json).value : undefined;
      return value ? valueUtil.toType(value) : undefined;
    } catch (error) {
      throw new Error(`Failed while de-serializing localStorage JSON for key '${key}'.`);
    }
  },
  set(key, value) {
    if (is.browser) {
      const json = JSON.stringify({ value });
      window.localStorage.setItem(key, json);
    }
    return value;
  },
  delete(key) {
    if (is.browser) {
      window.localStorage.removeItem(key);
    }
  },
};
