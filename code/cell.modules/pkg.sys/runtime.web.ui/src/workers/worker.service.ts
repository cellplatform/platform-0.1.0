import { HttpCache } from '../Web.HttpCache';
import { WebRuntime } from 'sys.runtime.web';
import { log } from '@platform/log/lib/client';
import { CacheFilter } from './worker.service.CacheFilter';

log.info('(🌸) worker.service.ts ');

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
  const name = 'cache:sys.runtime/module';

  /**
   * Reset.
   */
  if (location.searchParams.has(QUERYSTRING_KEY.reset)) {
    const msg = `(🌸) RESET: unregistering servivce worker, clearing cache, force reloading window...`;
    log.info(msg);

    await HttpCache.Store(name).clear();
    return await WebRuntime.ServiceWorker.forceReload({ removeQueryKey: QUERYSTRING_KEY.reset });
  }

  /**
   * Install the service.
   */
  await WebRuntime.ServiceWorker.init('./worker.service.js');

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
