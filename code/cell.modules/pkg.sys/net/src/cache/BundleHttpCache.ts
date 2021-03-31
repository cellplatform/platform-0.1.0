import { log } from '@platform/log/lib/client';

type FetchEvent = Event & {
  clientId: string;
  request: Request;
  respondWith(response: Promise<Response> | Response): Promise<Response>;
};

/**
 * Browser cache.
 *
 * Refs:
 *    https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker
 *    https://love2dev.com/blog/service-worker-cache
 *    https://developers.google.com/web/tools/workbox
 *
 * Service worker types:
 *    https://gist.github.com/tiernan/c18a380935e45a6d942ac1e88c5bbaf3
 *
 */
export const BundleHttpCache = {
  get module() {
    return __CELL__.module;
  },

  /**
   * Initializes a service worker cache.
   */
  serviceWorker(window: Window, options: { log?: boolean | 'verbose' } = {}) {
    const ctx = (window as unknown) as ServiceWorker;

    const { log: logLevel } = options;

    ctx.addEventListener('fetch', async (event) => {
      const e = event as FetchEvent;
      const url = e.request.url;
      const name = `module:${BundleHttpCache.module.name}@${BundleHttpCache.module.version}`;

      e.respondWith(
        caches.open(name).then(async (cache) => {
          const cached = await cache.match(e.request);

          if (cached) {
            if (log) log.info(`From cache: ${url}`);
            return cached;
          }

          const fetched = await fetch(e.request);

          if (e.request.method === 'GET') {
            cache.put(e.request, fetched.clone());
            if (log) log.info(`Saved to cache: ${url}`);
          }

          return fetched;
        }),
      );
    });

    return {
      ctx,
    };
  },
};
