import { t, util } from './common';

const getEnv: t.GetEnv = (callback: t.GetEnvCallback) => {
  if (typeof callback !== 'function') {
    return;
  }

  const query = util.toQueryObject<{ def: string }>();
  const env: t.IEnv = { def: { uri: query.def } };

  /**
   * TODO 🐷
   * - Flesh out env object.
   */

  callback(env);
};

if (typeof window === 'object' && window === window.top) {
  const win = (window as unknown) as t.ITopWindow;
  win.getEnv = getEnv;
}
