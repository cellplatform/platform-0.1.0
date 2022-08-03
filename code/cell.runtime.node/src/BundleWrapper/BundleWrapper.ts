import { FileCache, fs, PATH, t } from '../common';

/**
 * Wrapper around a raw origin {bundle} data object that
 * processes the contents into useful formatted values.
 */
export function BundleWrapper(manifestUrl: t.ManifestUrl, cachedir: string) {
  try {
    const url = new URL(manifestUrl);
    const cache = FileCache.create({ dir: toCacheDir(cachedir, url), fs });
    return {
      url,
      cache,
      isCached: () => cache.exists(PATH.MANIFEST),
      toString: () => url.href,
    };
  } catch (error: any) {
    const err = `Failed to wrap bundle. url: "${manifestUrl}", cachedir: "${cachedir}". ${error.message}`;
    throw new Error(err);
  }
}

/**
 * [Helpers]
 */

const stripHttp = (text: string) => text.replace(/^http:\/\//, '').replace(/^https:\/\//, '');

const toCacheDir = (base: string, url: URL) => {
  const host = stripHttp(url.host).replace(/:/g, '-');
  const parts = fs.dirname(url.pathname.replace(/^\/*/, '')).split('/');
  const dir = parts.join('/').replace(/^\/*/, '').replace(/:/g, '-');
  return fs.join(base, host, flattenDir(dir));
};

const flattenDir = (dir?: string) => {
  dir = (dir || '').trim().replace(/\/*$/, '');
  dir = dir ? `dir.${dir.replace(/\//g, '-')}` : 'default';
  return dir;
};
