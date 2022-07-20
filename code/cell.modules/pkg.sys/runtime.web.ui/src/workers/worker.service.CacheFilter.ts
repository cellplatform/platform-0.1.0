import * as t from '../Web.HttpCache/types';

type T = { module: t.HttpCacheFilter };

export const CacheFilter: T = {
  /**
   * Cache matching for a compiled [module] bundle.
   */
  module(e) {
    const path = e.url.pathname;

    // NB: turns up when running the local "dev" build server (HMR).
    if (path.startsWith('/sockjs-node')) return false;

    // Known (stable) entry points.
    if (path.endsWith('/remoteEntry.js')) return false;
    if (path.endsWith('/service.js')) return false;
    if (path.endsWith('/main.js')) return false;

    // Cacheable file-extensions.
    const extensions = ['.js', '.ttf', '.woff', '.woff2', '.ico'];
    if (extensions.some((ext) => path.endsWith(ext))) return true;

    // No match.
    return false;
  },
};
