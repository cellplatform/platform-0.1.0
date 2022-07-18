import { t, log, WebRuntime, Is } from './common';
import { HttpCacheStore } from './HttpCache.Store';

type CacheName = string;

/**
 * Initialize a cache on the service-worker thread.
 */
export async function HttpCacheServiceWorker(args: {
  self: Window;
  name: CacheName;
  log?: boolean | 'verbose';
  isCacheable?(url: URL): boolean | Promise<boolean>;
}) {
  const verbose = (...items: any[]) => {
    if (args.log === 'verbose') log.info(...items);
  };

  const ctx = args.self as unknown as ServiceWorker;
  const location = new URL(self.location.href);
  const cache = HttpCacheStore(args.name);

  /**
   * Output info
   */
  const module = `${WebRuntime.module.name}@${WebRuntime.module.version}`;
  log.group('💦🌳');
  log.info(`💦 service worker`);
  log.info(`💦 cache name: "${cache.name}"`);
  log.info(`💦 module: ${module}`);
  log.info(`💦 browser location: ${location.href}`);
  log.groupEnd();

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
   * TODO 🐷 - move "decision" to passed in function (IoC).
   */

  const isCacheable = async (url: URL) => {
    if (!['https:', 'http:'].includes(url.protocol)) return false;

    if (typeof args.isCacheable === 'function') {
      const res = args.isCacheable(url);
      return Is.promise(res) ? await res : res;
    }

    return true;
  };

  /**
   * Retrieve a URL via the cache.
   */
  const handleFetch = async (event: Event) => {
    const e = event as t.FetchEvent;
    const url = new URL(e.request.url);

    if (!(await isCacheable(url))) {
      verbose(`Explicilty not caching (excluded): ${url}`);
      return e.respondWith(fetch(e.request));
    }

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
          verbose(`🐘 PUT Saved to cache: ${url}`);
        }

        return fetched;
      }),
    );
  };

  /**
   * Wire up events.
   */
  ctx.addEventListener('activate', handleActivate);
  ctx.addEventListener('fetch', handleFetch);
  const dispose = () => {
    ctx.removeEventListener('activate', handleActivate);
    ctx.removeEventListener('fetch', handleFetch);
  };

  // Finish up.
  return { ctx, name, dispose };
}
