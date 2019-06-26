import { Subject } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';

import { is, value as valueUtil } from '../common';
import * as t from '../types';

export type ILocalStorageField<P extends t.ILocalStorageProps<P>> = {
  key: string;
  default?: P[keyof P];
};

/**
 * A strongly typed interface to the `localStorage` object.
 */
export function localStorage<P extends t.ILocalStorageProps<P>>(
  config: { [prop in keyof P]: string | Partial<ILocalStorageField<P>> },
  options: { provider?: t.ILocalStorageProvider; prefix?: string } = {},
): t.ILocalStorage<P> {
  // Setup initial conditions.
  const props = Object.keys(config);
  const provider = options.provider || defaultStorage;

  // Prepare the default values.
  const fields: { [prop: string]: ILocalStorageField<P> } = {};
  props.forEach(prop => {
    const field: ILocalStorageField<P> =
      typeof config[prop] === 'string' ? { key: config[prop] } : config[prop];
    let key = field.key || prop;
    key = options.prefix ? `${options.prefix}${key}` : key;
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

  const getKey = (prop: keyof P | string) => {
    const field = fields[prop.toString()];
    return field.key;
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
    delete(prop: keyof P) {
      const key = getKey(prop);
      const value = getValue(prop);
      provider.delete(key);
      _events$.next({ type: 'LOCAL_STORAGE/delete', payload: { key, prop, value } });
      return obj;
    },
  };

  // Define property handlers.
  props.forEach(prop => {
    Object.defineProperty(obj, prop, {
      /**
       * [GET] property value.
       */
      get() {
        const key = getKey(prop);
        const value = getValue(prop);
        _events$.next({ type: 'LOCAL_STORAGE/get', payload: { key, prop, value } });
        return value;
      },

      /**
       * [SET] property value.
       */
      set(to: any) {
        const key = getKey(prop);
        const value = { from: getValue(prop), to };
        provider.set(key, to);
        _events$.next({ type: 'LOCAL_STORAGE/set', payload: { key, prop, value } });
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
  type: 'browser',
  get(key: string) {
    try {
      const json = is.browser ? window.localStorage.getItem(key) : undefined;
      const value = json ? JSON.parse(json).value : undefined;
      return value === undefined ? undefined : valueUtil.toType(value);
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
