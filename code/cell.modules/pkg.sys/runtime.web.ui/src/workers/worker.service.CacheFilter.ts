import * as t from '../Web.HttpCache/types';

type T = { module: t.HttpCacheFilter };

export const CacheFilter: T = {
  /**
   * Cache matching for a compiled [module] bundle.
   */
  module(e) {
    const path = e.url.pathname;
    const isCacheable = isCacheableModuleArtefact(path);
    return isCacheable;
  },
};

/**
 * Helpers
 */

function isCacheableModuleArtefact(path: string) {
  // NB: turns up when running the local "dev" build server (HMR).
  if (path.startsWith('/sockjs-node')) return false;

  // Ignore known (stable) entry points.
  if (path.endsWith('/remoteEntry.js')) return false;
  if (path.endsWith('/service.js')) return false;
  if (path.endsWith('/main.js')) return false;

  // Cache "cell" code-chunks (the "code-split" logic of a module).
  //   - Filename template: "cell-<version>-<contenthash>.js"
  //   - NB: The <version> number within the file ensure newer versions always matched.
  if (isVersionedChunkFile(path)) return true;

  // Do cache known, typical file-extensions within the module.
  const extensions = ['.ttf', '.woff', '.woff2', '.ico'];
  if (extensions.some((ext) => path.endsWith(ext))) return true;

  // No match.
  return false;
}

function isVersionedChunkFile(path: string) {
  if (!path.startsWith('cell-')) return false;
  if (!path.endsWith('.js')) return false;
  return true;
}
