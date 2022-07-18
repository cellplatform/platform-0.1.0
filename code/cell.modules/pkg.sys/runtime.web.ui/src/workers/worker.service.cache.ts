export function isCacheable(url: URL) {
  const path = url.pathname;

  /**
   * Cache matching for a compiled [module] bundle.
   */
  if (path.startsWith('/sockjs-node')) return false; // NB: turnes up when running the local "dev" build server (HMR).

  const extensions = ['.js', '.ttf', '.woff', '.woff2', '.ico'];
  if (extensions.some((ext) => path.endsWith(ext))) return true;

  return false;
}
