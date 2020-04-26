import { t, util } from '../common';

let isInitialized = false;

/**
 * Initialize the environment.
 */
export function init() {
  if (!isInitialized) {
    isInitialized = true;
    if (typeof window === 'object' && window === window.top) {
      const win = (window as unknown) as t.ITopWindow;
      win.getEnv = getEnv;
    }
  }

  const query = util.toQueryObject<t.IEnvLoaderQuery>(); // The window's query-string.
  return query;
}

/**
 * Called by loaded modules to retrieve a reference to the programmable environment.
 */
export const getEnv: t.GetEnv = (callback: t.GetEnvCallback) => {
  if (typeof callback !== 'function') {
    return;
  }

  // const host = window.location.origin;
  const query = util.toQueryObject<t.IEnvLoaderQuery>(); // The window's query-string.
  const { host } = query;

  const env: t.IEnv = {
    host,
    def: { uri: query.def },
  };

  /**
   * TODO 🐷
   * - Flesh out env object.
   */

  callback(env);
};
