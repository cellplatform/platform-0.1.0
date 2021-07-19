import { log } from '@platform/log/lib/client';
import { Url } from '@platform/util.string/lib/Url';

import * as t from './types';

/**
 * Browser cache for managing code/bundle downloads.
 *
 * Refs:
 *    https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker
 *    https://love2dev.com/blog/service-worker-cache
 *    https://developers.google.com/web/tools/workbox
 *    https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
 *
 * Service worker types:
 *    https://gist.github.com/tiernan/c18a380935e45a6d942ac1e88c5bbaf3
 *
 */
export const BundleCache = {
  get module() {
    return __CELL__.module;
  },

  /**
   * Helper function for parsing and interpreting a URL.
   */
  url(input: string | { url: string }): t.CacheUrl {
    const url = Url(input);
    const parts = url.path.split('/').slice(1);
    const uri = parts[0].includes(':') ? parts[0] : '';
    const isFilesystem = uri.startsWith('cell:') && parts[1] === 'fs';
    return { ...url, uri, isFilesystem };
  },

  /**
   * The HTTP brower cache for the module.
   */
  cache() {
    const { module } = BundleCache;
    const name = `module:${module.name}@${module.version}`;
    return {
      name,
      async open() {
        const cache = await caches.open(name);
        return {
          match: (url: string) => cache.match(url),
          put: (request: RequestInfo, response: Response) => cache.put(request, response),
          add: (request: RequestInfo) => cache.add(request),
        };
      },
    };
  },

  /**
   * Initializes a service worker cache.
   */
  serviceWorker(self: Window, options: { log?: boolean | 'verbose'; localhost?: boolean } = {}) {
    const ctx = self as unknown as ServiceWorker;
    const hostname = self.location.hostname;

    const verbose = (...items: any[]) => {
      if (options.log === 'verbose') log.info(...items);
    };

    if (hostname === 'localhost' && !options.localhost) {
      verbose('Exiting ServiceWorker cache while running on [localhost].');
      return;
    }

    /**
     * Ensure the module can immediately start using the cache.
     * https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
     */
    const handleActivate = (event: Event) => {
      const e = event as t.ActivateEvent;
      const clients = (self as any).clients;
      if (typeof clients.claim === 'function') e.waitUntil(clients.claim());
    };

    /**
     * Retrieve a URL via the cache.
     */
    const handleFetch = async (event: Event) => {
      const e = event as t.FetchEvent;
      const url = BundleCache.url(e.request);

      const isCacheable = (url: t.CacheUrl) => {
        if (url.path.startsWith('/favicon.ico')) return true;
        if (url.path.startsWith('/sockjs-node')) return false;
        if (url.isLocalhost && !options.localhost) return false;
        if (!url.isLocalhost && !url.isFilesystem) return false;
        return true;
      };

      if (!isCacheable(url)) {
        verbose(`Explicilty not caching (excluded): ${url}`);
        return e.respondWith(fetch(e.request));
      }

      const cache = BundleCache.cache();

      return e.respondWith(
        cache.open().then(async (cache) => {
          const cached = await cache.match(url.toString());

          if (cached) {
            verbose(`🐘 From cache: ${url}`);
            return cached;
          }

          const fetched = await fetch(e.request);

          if (e.request.method === 'GET') {
            cache.put(e.request, fetched.clone());
            verbose(`🐘 Saved to cache: ${url}`);
          }

          return fetched;
        }),
      );
    };

    ctx.addEventListener('activate', handleActivate);
    ctx.addEventListener('fetch', handleFetch);

    return { ctx };
  },
};
