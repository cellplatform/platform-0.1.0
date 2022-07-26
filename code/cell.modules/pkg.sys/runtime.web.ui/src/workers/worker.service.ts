import { log } from '@platform/log/lib/client';

import { WebRuntime } from 'sys.runtime.web';
import { CacheFilter } from './CacheFilter';

log.info('(🌸) service.ts (ServiceWorker process)');

const ctx: ServiceWorker = self as any;
const location = new URL((self as Window).location.href);
const isLocalhost = location.hostname === 'localhost';

const QUERYSTRING_KEY = {
  reset: 'reset',
};

/**
 * Startup.
 */
(async () => {
  const { HttpCache, ServiceWorker } = WebRuntime;
  const name = 'cache:sys.runtime/module';

  /**
   * Reset.
   */
  if (location.searchParams.has(QUERYSTRING_KEY.reset)) {
    const msg = `(🌸) RESET: unregistering servivce worker, clearing cache, force reloading window...`;
    log.info(msg);

    await HttpCache.Store(name).clear();
    return await ServiceWorker.forceReload({ removeQueryKey: QUERYSTRING_KEY.reset });
  }

  /**
   * Install the service.
   */
  await ServiceWorker.init('./service.js');

  /**
   * Start the HTTP cache.
   */
  if (!isLocalhost) {
    HttpCache.ServiceWorker({
      self,
      name,
      filter: (e) => CacheFilter.module(e),
      log: 'verbose',
    });
  }
})();
