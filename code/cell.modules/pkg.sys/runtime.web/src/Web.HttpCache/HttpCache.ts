import { HttpCacheServiceWorker as ServiceWorker } from './HttpCache.ServiceWorker';
import { HttpCacheStore as Store } from './HttpCache.Store';

/**
 * Browser Cache
 */
export const HttpCache = {
  Store,
  ServiceWorker,
};
