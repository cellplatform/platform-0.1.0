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
export const BundleCache = {
  get module() {
    return __CELL__.module;
  },

  /**
   * Initializes a service worker cache.
   */
  serviceWorker(window: Window, options: { log?: boolean | 'verbose'; force?: boolean } = {}) {
    const ctx = (window as unknown) as ServiceWorker;
    const hostname = window.location.hostname;

    const verbose = (...items: any[]) => {
      if (options.log === 'verbose') log.info(items);
    };

    if (hostname === 'localhost' && !options.force) {
      verbose('Exiting Serviceworker cache while running on [localhost].');
      return;
    }

    ctx.addEventListener('fetch', async (event) => {
      const e = event as FetchEvent;
      const url = e.request.url;
      const name = `module:${BundleCache.module.name}@${BundleCache.module.version}`;

      e.respondWith(
        caches.open(name).then(async (cache) => {
          const cached = await cache.match(e.request);

          if (cached) {
            verbose(`From cache: ${url}`);
            return cached;
          }

          const fetched = await fetch(e.request);

          if (e.request.method === 'GET') {
            cache.put(e.request, fetched.clone());
            verbose(`Saved to cache: ${url}`);
          }

          return fetched;
        }),
      );
    });

    return { ctx };
  },
};
