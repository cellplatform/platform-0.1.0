import { PATH } from './constants';
import { fs } from './libs';

export function fileCache(args: { name: string; mime: string; hash?: string }) {
  let path = '';
  const cache = {
    get path() {
      if (!path) {
        const mime = args.mime.replace(/\//g, '-');
        const dir = fs.join(PATH.TMP, '.download', mime);
        let filename = args.name.replace(/\:/g, '-');
        filename = args.hash ? `${filename}?hash=${args.hash || '|'}` : filename;
        path = fs.join(dir, `${filename}`);
      }
      return path;
    },

    async exists() {
      return fs.pathExists(cache.path);
    },

    async get() {
      const path = cache.path;
      const exists = await cache.exists();
      return exists ? fs.readFile(path) : undefined;
    },

    async put(data: string | Buffer) {
      const path = cache.path;
      await fs.ensureDir(fs.dirname(path));
      await fs.writeFile(path, data);
    },
  };

  return cache;
}
