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
  defaultValues = { ...defaultValues };
  const keys = Object.keys(defaultValues);
  const provider = options.provider || defaultStorage;

  const obj = {
    delete(key: keyof P) {
      provider.delete(key.toString());
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
        const result = provider.get(key.toString());
        return result === undefined ? defaultValues[key] : result;
      },

      /**
       * [SET] property value.
       */
      set(value: any) {
        provider.set(key.toString(), value);
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
