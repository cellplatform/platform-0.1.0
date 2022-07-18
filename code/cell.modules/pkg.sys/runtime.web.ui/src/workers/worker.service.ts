import { HttpCache } from '../Web.HttpCache';
import { WebRuntime } from 'sys.runtime.web';
import { log } from '@platform/log/lib/client';

console.log('(🌸) worker.service.ts ');

const ctx: ServiceWorker = self as any;
const location = new URL((self as Window).location.href);
const isLocalhost = location.hostname === 'localhost';

/**
 * Startup.
 */
(async () => {
  const name = 'cache:sys.runtime.web/modules';

  /**
   * Reset.
   */
  const RESET_KEY = 'reset';
  if (location.searchParams.has(RESET_KEY)) {
    const msg = `(🌸) RESET: unregistering servivce worker, clearing cache, force reloading window...`;
    log.info(msg);
    (await HttpCache.Store(name).open()).clear();
    await WebRuntime.ServiceWorker.forceReload({ removeQueryKey: RESET_KEY });
  }

  /**
   * TODO 🐷 clear away '@platform/cell.runtime.web/lib/BundleCache'
   */

  // import { BundleCache } from '@platform/cell.runtime.web/lib/BundleCache';
  // BundleCache.serviceWorker(self, { log: 'verbose', localhost: false });

  /**
   * HTTP cache.
   */
  if (!isLocalhost) {
    HttpCache.ServiceWorker({
      self,
      name,
      log: 'verbose',

      isCacheable(url) {
        /**
         * Cache matching for a compiled module bundle.
         */
        if (!url.pathname.endsWith('/favicon.ico')) return true;

        if (url.pathname.startsWith('/sockjs-node')) return false;
        if (!url.pathname.endsWith('.js')) return false;
        if (url.pathname.endsWith('/index.json')) return false;

        return true;
      },
    });
  }
})();
