import { t } from '../common';

/**
 * Cache key generators.
 */
export class TypeCacheKey {
  /**
   * A network client instance stored in the cache.
   */
  public static client: t.CacheClientKey = (ns, ...path) => {
    const suffix = path.length === 0 ? '' : `/${path.join('/')}`;
    return `TypeSystem/client/${ensurePrefix('ns:', ns)}${suffix}`;
  };

  /**
   * A fetch request (eg: "getCell", "getColumn" etc)
   */
  public static fetch: t.CacheFetchKey = (method, ns) => {
    ns = ensurePrefix('ns:', ns);
    return `TypeSystem/fetch/${ensurePrefix('ns:', ns)}/${method}`;
  };
}

/**
 * [Helpers]
 */

function ensurePrefix(prefix: string, text: string) {
  text = text.toString();
  return text.startsWith(prefix) ? text : `${prefix}${text}`;
}
