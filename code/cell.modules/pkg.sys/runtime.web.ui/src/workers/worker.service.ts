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
  /**
   * Reload the worker if required.
   */
  const RESET_KEY = 'reset';
  if (location.searchParams.has(RESET_KEY)) {
    log.info(`(🌸) unregistering and force reloading servivce worker...`);
    console.log('-------------------------------------------');
    return WebRuntime.ServiceWorker.forceReload({ removeQueryKey: RESET_KEY });
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
      log: 'verbose',

      isCacheable(url) {
        /**
         * Cache matching for a compiled module bundle.
         */
        console.log('match', url);

        if (!url.pathname.endsWith('/favicon.ico')) return true;

        if (url.pathname.startsWith('/sockjs-node')) return false;
        if (!url.pathname.endsWith('.js')) return false;
        if (url.pathname.endsWith('/index.json')) return false;

        return true;
      },
    });
  }
})();
