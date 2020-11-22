import { FileCache, fs, PATH, Path, t, Urls, log, logger, HttpClient } from './common';

type B = t.RuntimeBundleOrigin;

/**
 * Wrapper around a raw origin {bundle} object that processes
 * the contents into formatted values.
 */
export function Bundle(bundle: B, cachedir: string) {
  const { host, uri } = bundle;
  const dir = Path.dir(bundle.dir);

  const hostdir = bundle.host
    .replace(/^http:\/\//, '')
    .replace(/^https:\/\//, '')
    .replace(/\:/g, '-');
  const cache = FileCache.create({
    fs,
    dir: fs.join(cachedir, hostdir, bundle.uri.replace(/\:/g, '-'), dir.path),
  });

  return {
    toObject: () => bundle,
    host,
    uri,
    dir,
    cache,
    get urls() {
      const urls = Urls.create(bundle.host).cell(bundle.uri);
      return {
        files: urls.files.list.query({ filter: `${dir.path}/**` }),
        manifest: urls.file.byName(Path.dir(dir.path).append(PATH.MANIFEST_FILENAME)),
      };
    },
  };
}
