import { DEFAULT, join, t } from './common';

/**
 * Helpers for working with file-caching a directory.
 */
export function ManifestCache(args: { fs: t.IFsLocal; dir: string }) {
  const { fs, dir } = args;
  const filename = DEFAULT.CACHE_FILENAME;
  const path = join(dir, filename).substring(fs.dir.length);
  const uri = `path:${path}`;

  const api = {
    dir,
    path,

    async dirExists() {
      const uri = `path:${dir.substring(fs.dir.length)}`;
      return (await fs.info(uri)).exists;
    },

    async read() {
      const file = (await fs.read(uri)).file;
      if (!file?.data) return undefined;
      try {
        const text = new TextDecoder().decode(file.data);
        const manifest = JSON.parse(text) as t.DirManifest;
        return manifest.kind === 'dir' && typeof manifest.dir === 'object' ? manifest : undefined;
      } catch (error) {
        return undefined;
      }
    },

    async write(manifest: t.DirManifest) {
      const json = JSON.stringify(manifest, null, '  ');
      const data = new TextEncoder().encode(json);
      await fs.write(uri, data);
    },
  };

  return api;
}