import { Subject } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';

import { is, value as valueUtil } from '../common';
import * as t from '../types';

export type ILocalStorageField = {
  key: string;
  default: t.Json | undefined;
};

/**
 * A strongly typed interface to the `localStorage` object.
 */
export function localStorage<P extends t.ILocalStorageProps<P>>(
  config: { [prop in keyof P]: string | Partial<ILocalStorageField> },
  options: { provider?: t.ILocalStorageProvider } = {},
): t.ILocalStorage<P> {
  // Setup initial conditions.
  const props = Object.keys(config);
  const provider = options.provider || defaultStorage;

  // Prepare the default values.
  const fields: { [prop: string]: ILocalStorageField } = {};
  props.forEach(prop => {
    const field: ILocalStorageField =
      typeof config[prop] === 'string' ? { key: prop } : config[prop];
    const key = field.key || prop;
    fields[prop] = { key, default: field.default };
  });

  // Observables.
  const _events$ = new Subject<t.LocalStorageEvent>();
  const events$ = _events$.pipe(share());

  const getValue = (prop: keyof P | string) => {
    const field = fields[prop.toString()];
    const key = field.key;
    const value = provider.get(key);
    return value === undefined ? field.default : value;
  };

  // API.
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
  props.forEach(key => {
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
