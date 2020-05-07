import { t, Uri } from '../../common';

/**
 * Cache key generators.
 */
export class TypeCacheKey {
  public static client: t.CacheClientKey = (ns, ...path) => {
    const suffix = path.length === 0 ? '' : `/${path.join('/')}`;
    return `TypeSystem/client/${ensurePrefix('ns:', ns)}${suffix}`;
  };

  public static fetch: t.CacheFetchKey = (method, ns, ...path) => {
    const suffix = path.length === 0 ? '' : `/${path.join('/')}`;
    ns = ensurePrefix('ns:', ns);
    return `TypeSystem/fetch/${ensurePrefix('ns:', ns)}/${method}${suffix}`;
  };

  public static default: t.CacheDefaultValue = uri => {
    return `TypeSystem/default/${uri}`;
  };
}

/**
 * [Helpers]
 */

function ensurePrefix(prefix: string, text: string) {
  text = text.toString();
  return text.startsWith(prefix) ? text : `${prefix}${text}`;
}
