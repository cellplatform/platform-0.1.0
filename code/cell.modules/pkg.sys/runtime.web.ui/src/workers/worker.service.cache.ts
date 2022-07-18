export function isCacheable(url: URL) {
  /**
   * Cache matching for a compiled module bundle.
   */

  if (url.pathname.startsWith('/sockjs-node')) return false;
  if (!url.pathname.endsWith('.js')) return false;

  return true;
}
