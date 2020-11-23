import { FileCache, fs, PATH, Path, t, Schema } from './common';

type B = t.RuntimeBundleOrigin;

/**
 * Wrapper around a raw origin {bundle} object that
 * processes the contents into formatted values.
 */
export function Bundle(bundle: B, cachedir: string) {
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
      const urls = Schema.urls(bundle.host);
      return {
        files: urls.cell(bundle.uri).files.list.query({ filter: `${dir.path}/**` }),
        manifest: urls.func.manifest(bundle),
      };
    },

    exists() {
      return cache.exists(PATH.MANIFEST);
    },

    toString() {
      let text = `${host}|${uri}`;
      text = dir.path ? `${text}|dir:${dir.path}` : text;
      return `[${text}]`;
    },
  };
}

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
