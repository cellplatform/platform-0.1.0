type NameString = string;

/**
 * REF:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Cache
 *    https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
 */
export type BrowserCache = {
  match(url: string | URL): Promise<Response | undefined>;
  put(req: RequestInfo | URL, res: Response): Promise<void>;
  clear(options?: BrowserCacheClearArgs): Promise<void>;
};
export type BrowserCacheClearArgs = { log?: boolean };

/**
 * Filter that determines whether a given element should be added to the HTTP cache.
 */
export type HttpCacheFilter = (e: HttpCacheFilterArgs) => boolean | Promise<boolean>;
export type HttpCacheFilterArgs = { url: URL; cache: NameString; request: Request };
