import { HttpCacheServiceWorker as ServiceWorker } from './HttpCache.ServiceWorker';
import { HttpCacheStore as Store } from './HttpCache.Store';

/**
 * TODO 🐷 move to [sys.runtime.web]
 */

/**
 * Browser Cache
 */
export const HttpCache = {
  Store,
  ServiceWorker,
};
