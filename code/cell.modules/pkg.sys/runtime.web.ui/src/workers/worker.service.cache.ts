export function isCacheable(url: URL) {
  /**
   * Cache matching for a compiled module bundle.
   */
  if (!url.pathname.endsWith('/favicon.ico')) return true;

  if (url.pathname.startsWith('/sockjs-node')) return false;
  if (!url.pathname.endsWith('.js')) return false;
  if (url.pathname.endsWith('/index.json')) return false;

  return true;
}
