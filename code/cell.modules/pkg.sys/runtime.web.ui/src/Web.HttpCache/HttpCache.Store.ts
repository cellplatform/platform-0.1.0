import { t, log } from './common';

type CacheName = string;

/**
 * Wrapper API to the underlying HTML5 browser cache.
 *
 * REF:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Cache
 *    https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
 *
 */
export function HttpCacheStore(name: CacheName) {
  const store = {
    name,
    async open(): Promise<t.WebCache> {
      const cache = await caches.open(name);

      return {
        /**
         * Lookup and match an entry in the cache.
         */
        match: (url: string) => cache.match(url),

        /**
         * Add an item to the cache.
         * REF:
         *    https://developer.mozilla.org/en-US/docs/Web/API/Cache/put
         */
        put: (request: RequestInfo, response: Response) => cache.put(request, response),

        /**
         * Delete all keys.
         */
        async clear(options = {}) {
          const keys = await cache.keys();
          const wait = keys.map((key) => {
            cache.delete(key);
            if (options.log) log.info(`delete from cache: ${key}`);
          });
          await Promise.all(wait);
        },
      };
    },
  };

  return store;
}
