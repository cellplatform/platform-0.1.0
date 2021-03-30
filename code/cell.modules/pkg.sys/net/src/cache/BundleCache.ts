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
  serviceWorker(window: Window & typeof globalThis) {
    const ctx = (window as unknown) as ServiceWorker;

    ctx.addEventListener('fetch', async (event) => {
      const e = event as FetchEvent;
      const url = e.request.url;
      const cacheName = `module:${BundleCache.module.name}@${BundleCache.module.version}`;

      e.respondWith(
        caches.open(cacheName).then(async (cache) => {
          const cached = await cache.match(e.request);

          if (cached) {
            console.log('From cache:', url);
            return cached;
          }

          const fetched = await fetch(e.request);

          if (e.request.method === 'GET') {
            cache.put(e.request, fetched.clone());
            console.log('Added to cache:', url);
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
