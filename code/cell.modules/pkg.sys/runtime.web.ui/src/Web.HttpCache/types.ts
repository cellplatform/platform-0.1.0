/**
 * REF:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Cache
 *    https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
 */
export type WebCache = {
  match(url: string | URL): Promise<Response | undefined>;
  put(req: RequestInfo | URL, res: Response): Promise<void>;
  clear(): Promise<void>;
};
