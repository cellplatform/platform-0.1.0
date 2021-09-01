import { FileCache, fs, PATH, Path, t, Schema } from '../common';

type B = t.RuntimeBundleOrigin;

/**
 * Wrapper around a raw origin {bundle} data object that
 * processes the contents into useful formatted values.
 */
export const BundleWrapper = {
  /**
   * Generates URLs for the given bundle.
   */
  urls(bundle: t.RuntimeBundleOrigin) {
    const urls = Schema.urls(bundle.host);
    return {
      files: urls.fn.bundle.files(bundle).toString(),
      manifest: urls.fn.bundle.manifest(bundle).toString(),
    };
  },

  /**
   * Create an instance of the wrapper.
   */
  create(bundle: B, cachedir: string) {
    bundle = { ...bundle };
    const { host, uri } = bundle;
    const dir = Path.dir(bundle.dir);
    const cache = FileCache.create({
      dir: toCacheDir(cachedir, host, uri, dir.path),
      fs,
    });

    return {
      toObject: () => bundle,

      host,
      uri,
      dir,
      cache,

      get urls() {
        return BundleWrapper.urls(bundle);
      },

      isCached() {
        return cache.exists(PATH.MANIFEST);
      },

      toString() {
        let text = `${host}|${uri}`;
        text = dir.path ? `${text}|dir:${dir.path}` : text;
        return `[${text}]`;
      },
    };
  },
};

/**
 * [Helpers]
 */

const flattenDir = (dir?: string) => {
  dir = (dir || '').trim().replace(/\/*$/, '');
  dir = dir ? `dir.${dir.replace(/\//g, '-')}` : 'default';
  return dir;
};

const stripHttp = (text: string) => text.replace(/^http:\/\//, '').replace(/^https:\/\//, '');

const toCacheDir = (base: string, host: string, uri: string, dir?: string) => {
  host = stripHttp(host).replace(/\:/g, '-');
  uri = uri.replace(/\:/g, '-');
  return fs.join(base, host, uri, flattenDir(dir));
};
