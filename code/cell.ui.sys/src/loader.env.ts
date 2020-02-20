import { t, util } from './common';

const getEnv: t.GetEnv = (callback: t.GetEnvCallback) => {
  if (typeof callback !== 'function') {
    return;
  }

  // const host = window.location.origin;
  const query = util.toQueryObject<t.IEnvLoaderQuery>();
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

export function init() {
  if (typeof window === 'object' && window === window.top) {
    const win = (window as unknown) as t.ITopWindow;
    win.getEnv = getEnv;

    console.log('getEnv', getEnv);
  }
}
