import { HttpCache } from '../Web.HttpCache';
import { WebRuntime } from 'sys.runtime.web';
import { log } from '@platform/log/lib/client';
import { isCacheable } from './worker.service.cache';

log.info('(🌸) worker.service.ts ');

const ctx: ServiceWorker = self as any;
const location = new URL((self as Window).location.href);
const isLocalhost = location.hostname === 'localhost';

const QUERYSTRING_KEY = {
  RESET: 'reset',
};

/**
 * Startup.
 */
(async () => {
  const name = 'cache:sys.runtime.web/modules';

  /**
   * Reset.
   */
  if (location.searchParams.has(QUERYSTRING_KEY.RESET)) {
    const msg = `(🌸) RESET: unregistering servivce worker, clearing cache, force reloading window...`;
    log.info(msg);
    (await HttpCache.Store(name).open()).clear();
    return await WebRuntime.ServiceWorker.forceReload({ removeQueryKey: QUERYSTRING_KEY.RESET });
  }

  /**
   * Install the service.
   */
  await WebRuntime.ServiceWorker.init('./worker.service.js');

  /**
   * Start the HTTP cache.
   */
  if (!isLocalhost) {
    HttpCache.ServiceWorker({ self, name, log: 'verbose', isCacheable });
  }
})();
